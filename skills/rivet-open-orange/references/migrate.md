# Migrate the data from Cloudflare

`orange migrate` moves SQLite-backed Durable Objects with no downtime: each object copies itself on its first request to Orange, and a backfill moves the rest. A D1 database takes no writes during its move.

Step numbers match the [migration guide](https://openorange.dev/docs/migrate/). Its detail sections have every message, failure, and limit. This file has the order, the points where you stop and ask, and the gotchas.

## Before you start

Go through [Before you start](https://openorange.dev/docs/migrate/#before-you-start) with the user. Also check:

- A pool CIDR allowlist lets Cloudflare reach the Orange URL. The D1 move needs this.
- The Rivet CLI is 3.1 or later (`rivet --version`). Steps 4, 6, and 8 use `rivet cluster secret` and `rivet cluster env`, which older versions lack. It shares the `orange login` session and the `orange link` cluster.
- No test request has reached a Durable Object on the deployed Orange. If one did, see [Test data on Orange](#test-data-on-orange).

Done when every item holds.

## Where the values live

The user creates `WORKER_MIGRATOR_TOKEN`, a long random value. The same value goes in three places: the Cloudflare Worker (step 3), Orange (step 4), and the machine that runs `orange migrate`.

The user keeps the machine's values in a file outside the project, such as `~/.orange-migrate/<worker>.env`:

```sh
ORANGE_MIGRATE_WORKER_URL=https://<worker>.<subdomain>.workers.dev
WORKER_MIGRATOR_TOKEN=...
CLOUDFLARE_API_TOKEN=...
CLOUDFLARE_ACCOUNT_ID=...
```

Load the file in a subshell for one command, so that no value enters your shell or your output. Run every `orange migrate d1`, `orange migrate backfill`, and `curl` below this way:

```sh
(set -a; . ~/.orange-migrate/<worker>.env; set +a; orange migrate backfill --dry-run)
```

The guide also allows `.dev.vars` for these values. Keep `ORANGE_MIGRATE_WORKER_URL` out of `.dev.vars` and out of the shell that runs `orange dev`: with it set, `orange dev` turns the migration on, and each object that starts locally copies itself off the production Worker, which then refuses app traffic for that object.

## 1. Check your app

Step 2 of "Set up" in `SKILL.md` did this. Done when each class to move has `"migratable":true`.

## 2. Prepare the Worker

```sh
orange migrate prepare
```

It writes `wrangler.migrate.jsonc` and `.open-orange/migrate/worker.mjs`, changes no code, and deploys nothing. Add the files that it names to `.gitignore`. A `Not moved:` line names each binding whose data stays on Cloudflare, such as KV and R2: tell the user, because that data needs its own copy.

After each Orange update, run `prepare` and step 3 again.

Done when it prints `✓ Prepared`.

## 3. Deploy the prepared Worker to Cloudflare

**Stop and ask** before each command. The first sets a secret, which deploys a new version of the production Worker, and the user runs it to type the token. The second replaces the production Worker with the prepared Worker.

```sh
wrangler secret put WORKER_MIGRATOR_TOKEN --config wrangler.migrate.jsonc
wrangler deploy --config wrangler.migrate.jsonc
```

Done when the app works as before, and this returns an ID, with a Durable Object binding in place of `MY_OBJECT`:

```sh
(set -a; . ~/.orange-migrate/<worker>.env; set +a
 curl -H "authorization: Bearer $WORKER_MIGRATOR_TOKEN" "$ORANGE_MIGRATE_WORKER_URL/__migrate/MY_OBJECT/resolve?name=test")
```

For a Worker with only D1, use the [`state` request](https://openorange.dev/docs/migrate/#d1-state). It returns `"state":"none"`.

Let the prepared Worker serve for a while before step 6, so that active objects save their names. A named object with an alarm and little traffic can get a second copy on Orange, whose alarm fires too. Tell the user about this risk ([Names](https://openorange.dev/docs/migrate/#names)).

## 4. Deploy to Rivet

This turns the migration on in Orange. Cloudflare still serves all traffic. From this deploy on, each object that starts on Orange copies itself from Cloudflare.

The user stores the token on the cluster:

```sh
rivet cluster secret set WORKER_MIGRATOR_TOKEN
```

**Stop and ask**, then deploy. For a Worker with crons, add `--var ORANGE_CRONS:off`.

```sh
orange deploy \
  --var ORANGE_MIGRATE_WORKER_URL:https://<worker>.<subdomain>.workers.dev \
  --secret WORKER_MIGRATOR_TOKEN
```

Done when it prints `✓ Deployed`. Its `URL` is the Orange URL of steps 5 and 7.

## 5. Move each D1 database

Skip this step when the Worker has no D1 database. Move every database before step 6: until its move, the database on Orange is empty.

**Stop and ask** before each database, with its size. Writes fail from the start of the move until the switch, about 3 minutes per GB. Every query fails during Cloudflare's export, about 47 seconds per GB. After the state is `moved`, there is no automated way back.

```sh
(set -a; . ~/.orange-migrate/<worker>.env; set +a; orange migrate d1 <binding> --url <orange-url>)
```

When it stops, find its message in [Failures](https://openorange.dev/docs/migrate/#failures). Most stops change nothing or open the freeze again, and a new run starts over. **Stop and ask** again before `--replace`: it drops what Orange holds for that database.

After the move, `wrangler d1 migrations apply --remote` fails on Cloudflare. Tell the user to remove it from scripts such as `predeploy`, and to apply new migrations on Orange ([After a D1 database has moved](https://openorange.dev/docs/migrate/#after-a-d1-database-has-moved)).

Done when each run prints `✓ Moved <binding>`.

## 6. Point your domain at Orange

An object with an open WebSocket still runs the code from before step 3, and its copy fails until those connections close. Ask the user to make long-lived WebSocket clients reconnect, for example by reloading open sessions.

**Stop and ask:** the user confirms that every D1 database moved and that the WebSocket clients reconnected. Then the user points the domain at Orange in their DNS provider, and you wait for their word.

For a Worker with crons, after DNS points at Orange, the user removes the cron triggers in the Cloudflare dashboard, in the Worker's settings. Then **stop and ask**, and turn the crons on in Orange. This rolls the pool:

```sh
rivet cluster env unset ORANGE_CRONS --pool <pool>
```

Done when the user confirms that DNS points at Orange, and the crons run only on Orange.

## 7. Backfill the Durable Objects

Wait at least 7 minutes after step 6: Cloudflare lists new objects late. Then count the objects. This moves nothing:

```sh
(set -a; . ~/.orange-migrate/<worker>.env; set +a; orange migrate backfill --dry-run)
```

**Stop and ask**, with the counts. They include the objects that already moved, so they are the most that the backfill moves. Each object that it wakes moves to Orange and refuses app traffic on Cloudflare.

```sh
(set -a; . ~/.orange-migrate/<worker>.env; set +a; orange migrate backfill --url https://<app-domain>)
```

Run it again while it exits `1`, which retries the failed objects, or prints `Run this command once more`. A failed object's error is in [Failures](https://openorange.dev/docs/migrate/#failures). `Orange failed on its own side` fails the same way on a retry: give the user the bug report link.

Done when a run prints `0 moved, 0 failed` for every class and exits `0`.

## 8. Clean up

Check with the user:

| Check | Pass |
|---|---|
| A request for a Durable Object through the app domain | It returns the data that the object had on Cloudflare |
| The same request to the `workers.dev` URL | HTTP 503 with `migrator.moved` |
| The `state` request for each D1 database | `"state":"moved"` |
| The user's own test of the app | Passes |

Clean up only when the user trusts the move and confirms that no traffic reaches the Cloudflare Worker: after this, a query that Cloudflare forwards fails. **Stop and ask**, then turn the migration off. This rolls the pool:

```sh
rivet cluster env unset ORANGE_MIGRATE_WORKER_URL --pool <pool>
```

Done when the checks pass, and the user knows that the Cloudflare Worker, its Durable Objects, and its D1 data are still on Cloudflare, for them to delete.

## Test data on Orange

Before step 4, a request to the deployed Orange that starts a Durable Object leaves data on Orange, even a read, when the constructor writes, such as a `CREATE TABLE IF NOT EXISTS`. After step 4, that object refuses its copy: its calls fail with `has data on Orange that did not come from this migration`, and every backfill run fails on it.

Safe before step 4: `orange dev`, routes that start no Durable Object, and objects with names or IDs that Cloudflare never had.

When it happened, **stop and ask**, then have the user destroy those actors on Orange as in [Remove test data from Orange](https://openorange.dev/docs/migrate/#remove-test-data-from-orange). The user runs the requests, because the token is theirs. After step 4, destroy only the actors whose calls fail with that message.
