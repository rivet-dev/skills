# Migrate data from Cloudflare to Orange

Step numbers match `SKILL.md`. The migration moves SQLite-backed Durable Objects and D1 databases. The app serves during the move, and its code does not change. A D1 database takes no writes during its move, and no queries during its export (step 6).

## Before step 4

Check each item with the user:

- Steps 1 to 3 pass: doctor exits `0`, `orange dev` serves the app, and `orange deploy` works.
- Each class to move is in `new_sqlite_classes` and has a binding (`references/doctor.md`).
- The user can run `wrangler deploy` and `wrangler secret put` for the production Worker.
- A URL reaches the Cloudflare Worker after the domain moves, such as `https://<worker>.<subdomain>.workers.dev`. This is `ORANGE_MIGRATE_WORKER_URL`.
- Cloudflare can reach the Orange URL. The D1 move needs this, so a pool CIDR allowlist must let Cloudflare in.
- The DNS TTL of the domain is low. A client with stale DNS gets errors for moved objects until its DNS updates.
- For the backfill: a Cloudflare API token with a Workers read permission, and the account ID. For the D1 move: a token with D1 edit permission, which the D1 export API needs.

## Test the deployed Orange

Before step 5, a request to the deployed Orange that starts a Durable Object leaves data on Orange, even a read, when the constructor writes, such as a `CREATE TABLE IF NOT EXISTS`. After step 5, that object refuses its copy from Cloudflare: its calls fail with `has data on Orange that did not come from this migration`, and every backfill run fails on it.

| Safe before step 5 | Not safe before step 5 |
|---|---|
| Every route on `orange dev` (step 2). Its data is local. | A request to the deployed Orange that reaches a Durable Object that also exists on Cloudflare, such as an `idFromName("global")` singleton |
| Routes on the deployed Orange that use no Durable Object | A cron on the deployed Orange that reaches such an object. See "Cron triggers". |
| Durable Objects with names or IDs that Cloudflare never had and that production never uses | |

If it happened, **stop and ask**, then have the user run these Rivet Engine API requests to destroy the Durable Object actors on Orange, before step 5. The user runs them, because the token is theirs: never ask for it. Until step 5 they hold only test data. After step 5, destroy only the actors whose calls fail with that message. The next request starts a new actor, which copies the object from Cloudflare. `<engine-host>`, `<namespace>`, and the token are the parts of `RIVET_ENDPOINT`, which the user supplies:

```sh
# Actor names of a class start with the class name in kebab case, such as room-1a2b3c4d.
curl -H "authorization: Bearer $RIVET_TOKEN" "https://<engine-host>/actors/names?namespace=<namespace>"
curl -H "authorization: Bearer $RIVET_TOKEN" "https://<engine-host>/actors?namespace=<namespace>&name=<actor-name>"
curl -X DELETE -H "authorization: Bearer $RIVET_TOKEN" "https://<engine-host>/actors/<actor_id>?namespace=<namespace>"
```

## Cron triggers

Orange runs `triggers.crons` from its first deploy, next to Cloudflare, so each side effect happens twice. After step 5, a cron on Orange that reaches a Durable Object moves it off Cloudflare, and Cloudflare then answers that object's users with `migrator.moved`. Run each cron in one place:

1. Until the cutover, every `orange deploy` of a Worker with crons has `--var ORANGE_CRONS:off`. Orange then runs no cron and deletes the jobs it ran before.
2. At the cutover (step 7), after DNS points at Orange, the user removes the cron triggers of the Cloudflare Worker in the Cloudflare dashboard, in the Worker's settings. A later `wrangler deploy` with `triggers.crons` adds them back.
3. Then turn the crons on in Orange. This rolls the pool:

   ```sh
   rivet cluster env unset ORANGE_CRONS --pool <pool>
   ```

`orange dev` runs crons too. With crons that act on production services, put `ORANGE_CRONS=off` in `.dev.vars`.

## Where the secrets live

The user creates `WORKER_MIGRATOR_TOKEN`, a long random value. The same value goes in three places: the Cloudflare Worker, Orange, and the machine that runs `orange migrate`.

Suggest that the user keeps the machine-side values in a file outside the project, such as `~/.orange-migrate/<worker>.env`, so that it never enters git or the deploy image:

```sh
ORANGE_MIGRATE_WORKER_URL=https://<worker>.<subdomain>.workers.dev
WORKER_MIGRATOR_TOKEN=...
CLOUDFLARE_API_TOKEN=...
CLOUDFLARE_ACCOUNT_ID=...
```

Load it for one command without reading it:

```sh
(set -a; . ~/.orange-migrate/<worker>.env; set +a; pnpm orange migrate backfill --url https://<app-domain>)
```

`orange migrate d1` and `backfill` read these names from the shell, then from the Worker's variables, such as `.dev.vars`. Keep them out of `.dev.vars` (see `references/deploy.md`).

## 4. Prepare the Cloudflare Worker

```sh
pnpm orange migrate prepare
```

It prints `✓ Prepared <classes and D1 bindings>. Your code did not change.` and the two commands below. A `Not moved: <binding> (<type>), ...` line names each binding whose data stays on Cloudflare, such as KV namespaces, R2 buckets, and Vectorize indexes: tell the user, because that data needs its own copy. It writes two files and changes no code:

| File | Content |
|---|---|
| `wrangler.migrate.jsonc` | A copy of the Wrangler config whose `main` is the generated Worker |
| `.open-orange/migrate/worker.mjs` | The app, with each `new_sqlite_classes` class wrapped by the migrator, the routes `/__migrate/*` and `/__migrate-d1/*` in front of `fetch`, and each D1 binding wrapped |

Nobody edits or commits these files. Run `prepare` again to change them, and again after each Orange update. When `prepare` prints `Add <files> to .gitignore`, add those entries to the project's `.gitignore`.

`prepare` stops and writes nothing when the config has a KV-backed class, a class without a binding, `no_bundle`, or nothing to move.

**Stop and ask**, then the user sets the token on the production Worker on Cloudflare. A new secret deploys a new version of that Worker:

```sh
wrangler secret put WORKER_MIGRATOR_TOKEN --config wrangler.migrate.jsonc
```

**Stop and ask**, then deploy the wrapped Worker to Cloudflare:

```sh
wrangler deploy --config wrangler.migrate.jsonc
```

Nothing moves yet. From now on, an object saves its name when it gets a request.

**Check.** The app works as before. With a Durable Object binding `MY_OBJECT`, this returns an ID:

```sh
(set -a; . ~/.orange-migrate/<worker>.env; set +a
 curl -H "authorization: Bearer $WORKER_MIGRATOR_TOKEN" "$ORANGE_MIGRATE_WORKER_URL/__migrate/MY_OBJECT/resolve?name=test")
```

The subshell reads the token from the file, so it never enters your shell, your output, or the conversation. Never export it, and never ask the user for its value.

For a Worker with only D1, use the `state` request of step 6. It returns `"state":"none"`.

Let the wrapped Worker serve traffic for a while before the cutover, step 7 (step 6, "Point your domain at Orange", in `docs/migrate.mdx`), so that active objects save their names. A named object without a saved name gets a second copy on Orange, keyed by its ID: the backfill moves it by ID and the app later copies it again by name, or the app copies it by name and the backfill then copies it again by ID. The app never reaches the second copy, but an alarm in it fires too. Tell the user about this risk for named objects with alarms that get little traffic. The backfill counts such objects in its `<n> had no saved name, so they moved by ID` line, together with `newUniqueId()` objects.

## 5. Turn the migration on in Orange

| Setting | Value |
|---|---|
| `ORANGE_MIGRATE_WORKER_URL` | The URL that reaches the Cloudflare Worker after the domain moves |
| `WORKER_MIGRATOR_TOKEN` | The value from step 4 |

Set both on the pool. Put `WORKER_MIGRATOR_TOKEN` in a secrets file that holds only that entry, such as `~/.orange-migrate/<worker>.secrets`, or have the user run `rivet cluster secret set WORKER_MIGRATOR_TOKEN` and pass `--secret WORKER_MIGRATOR_TOKEN`.

**Stop and ask**, then:

```sh
pnpm orange deploy \
  --var ORANGE_MIGRATE_WORKER_URL:https://<worker>.<subdomain>.workers.dev \
  --secrets-file ~/.orange-migrate/<worker>.secrets
```

For a Worker with crons, add `--var ORANGE_CRONS:off` (see "Cron triggers").

Cloudflare still serves all traffic. Orange now answers `/__migrate/*` and `/__migrate-d1/*` for requests with the token, and each object copies itself from Cloudflare before its constructor first runs.

**Check.** The deploy prints `✓ Deployed`. Steps 6 and 8 stop with an error when Orange does not answer as a migrating Worker.

## 6. Move each D1 database

Move every D1 database before step 7. Until a database moves, its copy on Orange is empty.

**Stop and ask** for each database. Tell the user what the app sees during the move:

| Phase | Reads | Writes |
|---|---|---|
| Freeze, from the start of the move | Work | Fail at once with `orange-d1-frozen: <binding> is moving to Orange, so it takes no writes until the move ends` |
| Export, about 50 seconds per GB | Fail with `D1_ERROR: Currently processing a long-running export.` | Fail the same way |
| Import and check | Work | Fail with `orange-d1-frozen` |
| After the switch | Run on Orange | Run on Orange |

Then:

```sh
(set -a; . ~/.orange-migrate/<worker>.env; set +a; pnpm orange migrate d1 <binding> --url <orange-url>)
```

- `<binding>` is the D1 binding or database name. `<orange-url>` is the pool URL from the deploy.
- It needs `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` too, and the `database_id` in the Wrangler config.
- The command exports the database with Cloudflare's export API in its exact format, and Orange reads the export in commits of about 1 MiB.
- Before the switch it checks every row: row counts and a SHA-256 of each page of rows, Orange against the frozen D1, and the schema.
- After the switch, the wrapped Worker on Cloudflare sends every query for this database to Orange.
- When the command fails before the switch, it opens the freeze, and writes work on Cloudflare again. Run it again: Orange goes on with its partial copy of the same export, or starts again.
- When the command is killed, the freeze opens by itself after its lease: 5 minutes plus 3 minutes per GB. The switch then refuses, so no write is lost.
- A database that already moved prints `<binding> has already moved to <url>` and exits `0`.
- Before the move, Orange's copy must have no tables. Never apply migrations to the deployed database before this step: the move then refuses with `already has ... tables`.
- Do not change the schema on Cloudflare during the move. The check then refuses.

### Change the schema after the move

After the move, `wrangler d1 migrations apply --remote` fails on Cloudflare, because the triggers that refuse writes also cover `d1_migrations`. Many templates run it in a `predeploy` script, so tell the user to remove that command from `predeploy` before they deploy to Cloudflare again. The database now lives on Orange, and the applied migrations moved with it in `d1_migrations`. Apply new migrations there:

```sh
RIVET_ENDPOINT=... pnpm orange d1 migrations apply <DB> --remote
```

`RIVET_ENDPOINT` is the Rivet Engine of the deployment (see `references/deploy.md`). The user supplies it, because it holds a token. Run it from the project, with the Worker name and `--env` of the deployment.

**Done** when it prints:

```
Checked <rows> rows in <n> tables, value for value, in <seconds> s: Orange equals Cloudflare.
✓ Moved <binding> in <seconds> s: export <seconds> s, import <seconds> s. Writes were frozen for <seconds> s.
```

Read the state on Cloudflare at any time. After the move, `state` is `moved`:

```sh
(set -a; . ~/.orange-migrate/<worker>.env; set +a
 curl -X POST -H "authorization: Bearer $WORKER_MIGRATOR_TOKEN" "$ORANGE_MIGRATE_WORKER_URL/__migrate-d1/<binding>/state")
```

| `state` | Meaning |
|---|---|
| `none` | No move is in progress. Cloudflare serves reads and writes. |
| `frozen` | A move is in progress. Writes fail. |
| `expired` | A move stopped, and its lease ran out. Writes work. Run the command again. |
| `moved` | Cloudflare forwards every query to Orange |

### When the D1 move refuses

| Message | Cause | Next step |
|---|---|---|
| `D1's export can't include virtual tables` | The database has a virtual table, such as FTS5 | Nothing changed. Tell the user: drop the virtual tables on Cloudflare, move, and create them again on Orange. |
| `already has ... tables, indexes, views, or triggers on Orange` | Orange's database already has data | **Stop and ask** before `--replace`. It drops what Orange holds for this database. |
| `Cloudflare can't reach Orange at <url>` | Cloudflare cannot reach `--url` | Check the URL and the pool allowlist. Nothing changed. |
| `Cloudflare's API refused ...` | The API token, the account ID, or the `database_id` is wrong | Fix it. Nothing changed. |
| `Cloudflare's export failed: ...` | The export API failed | The freeze is open again. Run the command again. |
| `Orange's copy of <table> differs from Cloudflare's in rows ...` | A value did not survive the export, such as TEXT with invalid UTF-8 or a NUL character | The freeze is open again, and Orange drops the copy. Tell the user which table. |
| `schema changed on Cloudflare during the move` | A schema change ran during the move | Run the command again after it. |
| `the write freeze ran out or was replaced` | The move took longer than its lease, or another move started | The freeze is open again. Run the command again. |
| `no D1 migration route named freeze` | The wrapped Worker is older than this CLI | Run step 4 again (`prepare`, then `wrangler deploy`). |
| `Set ORANGE_MIGRATE_WORKER_URL and WORKER_MIGRATOR_TOKEN`, or HTTP 404 from Orange | Orange lacks the step 5 settings | Do step 5. |

### Offline copy

`--file <export.sql>` copies an export file into the local database, or with `--remote` into the Engine in `RIVET_ENDPOINT`. It needs no `--url` and changes nothing on Cloudflare, and Cloudflare does not forward queries after it. Use it only when the user can stop all writes to the database.

- It takes a file of any size, in commits of about 1 MiB. A rerun with the same file goes on where it stopped.
- `wrangler d1 export` writes D1's default format, which rounds integers at or past 2^53. The copy refuses such a file before Orange changes. The `--url` move exports in the exact format.

## 7. Cut over

An object with open WebSockets keeps running the code from before the step 4 deploy until those connections close, which can take minutes or longer. Such an object has no export route, so its copy fails with `the object did not answer as a migrator ... Try again after its old connections close`. Before the cutover, ask the user to make long-lived WebSocket clients reconnect, for example by reloading open sessions, or to wait until they have.

The user points the domain at Orange in their DNS provider. Wait for the user to confirm. Then, for a Worker with crons, do steps 2 and 3 of "Cron triggers".

From now on, the first request to each Durable Object waits while the object copies itself, about one round trip to Cloudflare for each 4 MB. After the copy, the object on Cloudflare answers HTTP 503 with `migrator.moved`.

## 8. Backfill

The backfill moves the objects that got no request. Cloudflare lists a new object late, so wait at least 7 minutes after step 7.

Show the user how many objects will move. This moves nothing and needs only the Cloudflare API settings:

```sh
(set -a; . ~/.orange-migrate/<worker>.env; set +a; pnpm orange migrate backfill --dry-run)
```

It prints `<class>: <n> objects on Cloudflare, including any that already moved to Orange. Dry run: nothing moved.` for each class. The count includes the objects that the app already moved after the cutover, so it is the most that the backfill moves, not the number left. **Stop and ask**, then:

```sh
(set -a; . ~/.orange-migrate/<worker>.env; set +a; pnpm orange migrate backfill --url https://<app-domain>)
```

- `--url` is any URL that reaches Orange: the app domain after step 7, or the pool URL.
- Each class prints `<class>: <n> moved, <m> failed, already moved: <k>.` and the failed IDs. `already moved` counts objects that Orange already had, for example because the app asked for them after the cutover. `no data on Cloudflare: <e>` shows when not 0: objects with no saved name and no data on Cloudflare, which Orange does not copy. To check, backfill reads the first export page of each object with no saved name, so an object of one page (about 4 MB) refuses traffic on Cloudflare from then on, even when its wake fails. The next run copies it.
- Exit `1` means some objects did not move. Run it again to retry them. When the last line is `Orange failed on its own side: <reason>`, a retry fails the same way: tell the user, and show the `Looks like a bug? Report it:` link.
- A failed object with `did not answer as a migrator ... Try again after its old connections close` still runs the code from before the wrapped deploy, because it kept a WebSocket open. Run the backfill again after those connections close.
- Exit `130` means it was stopped. Run it again: it continues from `.open-orange/migrate/backfill-<class>.json`.
- After a run with `0 failed`, wait a few minutes and run it one more time to catch objects that Cloudflare listed late.
- `--concurrency <n>` (default `8`) lowers the load. Use a lower value on a small cluster or with large objects.

## 9. Verify

| Check | Pass |
|---|---|
| A request for a Durable Object through the app domain | It returns the data the object had on Cloudflare |
| The same request to the `workers.dev` URL | HTTP 503 with `migrator.moved` |
| The `state` request for each D1 database | `"state":"moved"` |
| The last two backfill runs | The last one prints `0 moved, 0 failed` for every class, and both exit `0` |
| The user's own smoke test of the app | Passes |

## 10. Clean up

Only when the user trusts the move. **Stop and ask** before each action.

1. The user confirms that no traffic reaches the Cloudflare Worker.
2. After a backfill with `0 failed`, remove `ORANGE_MIGRATE_WORKER_URL` from the pool. This needs the Rivet CLI, and it rolls the pool:

   ```sh
   rivet cluster env unset ORANGE_MIGRATE_WORKER_URL --pool <pool>
   ```

   Orange stops all contact with Cloudflare, and the `/__migrate*` routes go away. A query that Cloudflare still forwards fails after this, which is why item 1 comes first. When the user set the variable in `vars`, remove it there and deploy again.

3. Tell the user that the Cloudflare Worker, its Durable Objects, and its D1 data are still on Cloudflare. Deleting them is their decision.
