# Roll back the migration

Every rollback action changes production, so **stop and ask** before each one. Step numbers match `references/migrate.md`. [Roll back in detail](https://openorange.dev/docs/migrate/#roll-back-in-detail) has the same table, with each case.

| Last step done | How to go back |
|---|---|
| 2, prepare | Delete `wrangler.migrate.jsonc` and `.open-orange/migrate/`. |
| 3, prepared Worker on Cloudflare | The user deploys the original config with `wrangler deploy`. |
| 4, migration on in Orange | No action: Orange has no user traffic. |
| 5, D1 before `moved` | Stop the command with Ctrl-C. Cloudflare still holds the current data. |
| 5, D1 `moved` | No automated way back. See [After a D1 database moved](#after-a-d1-database-moved). |
| 6 or 7 | Roll back the Durable Objects, below. |
| 8, clean up | None. The data on Cloudflare is old. |

## Roll back the Durable Objects

1. The user points the domain back at Cloudflare.
2. For a Worker with crons, stop them on Orange, which rolls the pool, and the user adds them back on Cloudflare, for example with `wrangler deploy --config wrangler.migrate.jsonc`:

   ```sh
   rivet cluster env set --env ORANGE_CRONS=off --pool <pool>
   ```

3. The user sets `MIGRATOR_DISABLED` to `true` on the prepared Worker:

   ```sh
   wrangler secret put MIGRATOR_DISABLED --config wrangler.migrate.jsonc
   ```

Done when every object serves on Cloudflare again, from its state when it moved, with its alarm. A busy object can refuse requests for up to 5 minutes. Tell the user that writes made on Orange stay on Orange.

`MIGRATOR_DISABLED` does not change D1. A moved D1 database stays on Orange, and Cloudflare still forwards its queries, so Orange keeps running with both step 4 settings.

## After a D1 database moved

Orange holds the only current copy, and the copy on Cloudflare refuses every write. Keep the prepared Worker on Cloudflare: the original Worker reads old data, and its writes fail. To serve the database from Cloudflare again, the user copies the data back.
