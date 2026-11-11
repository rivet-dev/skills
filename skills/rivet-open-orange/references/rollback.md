# Roll back

**Stop and ask** before each action. Step numbers match `SKILL.md`.

| Last step done | How to go back |
|---|---|
| 3, deploy to Rivet | Nothing serves from Orange yet. To undo a bad deploy, roll the pool back: `pnpm orange deploy --pool <pool> --build <earlier-build-id>`. |
| 4, prepare | Delete `wrangler.migrate.jsonc` and `.open-orange/migrate/`. |
| 4, wrapped Worker deployed | The user deploys the original config with `wrangler deploy`. |
| 5, migration on in Orange | No action for users: Orange has no user traffic. An object that a test started on the deployed Orange before step 5 fails its calls and its backfill. See "Test the deployed Orange" in `references/migrate.md`. |
| 6, D1 before `moved` | Stop the command with Ctrl-C. It opens the freeze, and Cloudflare still holds the current data. |
| 6, D1 `moved` | **No automated way back.** See below. |
| 7 or 8, Durable Objects | Roll back the Durable Objects. See below. Writes made on Orange do not sync back. |
| 10, clean up | None. The data on Cloudflare is old. |

## Roll back Durable Objects

1. The user points the domain back at Cloudflare. For a Worker with crons, stop them on Orange with `rivet cluster env set --env ORANGE_CRONS=off --pool <pool>`, which rolls the pool, and the user adds the cron triggers back on Cloudflare, for example with `wrangler deploy --config wrangler.migrate.jsonc`.
2. The user sets `MIGRATOR_DISABLED` to `true` on the wrapped Worker:

   ```sh
   wrangler secret put MIGRATOR_DISABLED --config wrangler.migrate.jsonc
   ```

- Every object serves on Cloudflare again, from its state when it moved, and gets its alarm back.
- A busy object can refuse requests for up to 5 minutes. A rollback took about 5 minutes in tests.
- Writes made on Orange after the move stay on Orange.
- `MIGRATOR_DISABLED` does not change D1. A moved database stays on Orange, and Cloudflare still forwards its queries, so keep Orange running with both step 5 settings.

## Stop a D1 move

Before the state is `moved`:

- Ctrl-C opens the freeze, and writes work on Cloudflare again. A killed command's freeze opens by itself when its lease runs out: 5 minutes plus 3 minutes per GB.
- Run the same command again to move the database. Orange goes on with its partial copy, or starts again.
- Orange keeps the partial copy and refuses app queries on that database until a move finishes. `--replace` on a later move drops it.

## After a D1 database moved

- Orange holds the only current copy. The copy on Cloudflare stops at the switch, and triggers refuse every write to it.
- Do not deploy the original Worker to Cloudflare. It reads old data, and its writes fail.
- To serve from Cloudflare again, the user must copy the data back themselves.

## Errors during the migration

Routes answer `{"error": {"code": "...", "message": "..."}}`.

| Code | HTTP | From | Meaning |
|---|---|---|---|
| `migrator.moved` | 503 | Cloudflare | The object moved. Expected after a move. |
| `migrator.dirty` | 409 | Cloudflare | A write voided the export. Orange retries. |
| `migrator.unsupported` | 501 | Cloudflare | The object is not SQLite-backed, or holds a virtual table |
| `migrator.unauthorized`, `migrate.unauthorized` | 401 | Either | The token differs between Cloudflare, Orange, and the shell |
| `migrator.not_configured` | 500 | Cloudflare | `WORKER_MIGRATOR_TOKEN` is not set on the Worker |
| `migrate.unknown_binding` | 404 | Orange | No Durable Object binding has that name |
| `migrate.import_failed` | 502 | Orange | The object did not copy. The message holds the reason. |
| `migrate.internal` | 502 | Orange | The copy failed inside Orange, such as SQL that Orange's SQLite cannot run. Tell the user, and offer the bug report that `backfill` prints. |

| What happens | Result |
|---|---|
| An object already has data on Orange when the migration turns on | Its calls fail with `has data on Orange that did not come from this migration`. To serve the Cloudflare data, destroy its actor on Orange ("Test the deployed Orange" in `references/migrate.md`). To keep the Orange data, remove `ORANGE_MIGRATE_WORKER_URL`. |
| `ORANGE_MIGRATE_WORKER_URL` is removed during an unfinished copy | Its calls fail and never return partial data. Set the variable again. |
| Cloudflare is down during the first request to an object | The request fails, and a later request tries again |
| Background work outside `ctx.waitUntil` writes after a move | That write is lost |
| A large object on a small cluster (Free-1) | The Engine can fence and restart. Use a larger cluster and a lower `--concurrency`. |
