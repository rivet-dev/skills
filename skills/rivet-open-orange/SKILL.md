---
name: rivet-open-orange
description: Move a Cloudflare Workers project to Rivet with Open Orange, the orange CLI. Use when asked to run, deploy, or migrate a Worker, its Durable Objects, or its D1 databases from Cloudflare to Rivet, or when a project with a wrangler.jsonc, wrangler.json, or wrangler.toml mentions Open Orange or orange.
---

# Move a Cloudflare Worker to Rivet with Open Orange

Open Orange runs a Worker, unchanged, on Rivet: `orange dev` locally, `orange deploy` on a Rivet cluster, and `orange migrate` to move the data of Durable Objects and D1 databases from Cloudflare while the app serves. A D1 database takes no writes during its move.

Steps 1 to 3 run and deploy the Worker. Steps 4 to 10 move production data. Do only the steps the user asked for.

## Rules

- **Secrets.** The user creates and enters every secret value: `WORKER_MIGRATOR_TOKEN`, `CLOUDFLARE_API_TOKEN`, Rivet tokens. Refer to a secret only by its name or as `$NAME`. Keep secret values out of commands you show, files you read, and your output. Run the commands that prompt for a secret (`wrangler secret put`, `rivet cluster secret set`) by asking the user to run them.
- **Stop and ask.** At each **Stop and ask**, tell the user what will change and for whom, then wait for an explicit yes. A yes covers that one action.
- **Cloudflare stays.** Orange never deletes anything on Cloudflare. Deleting the Cloudflare Worker or its data is the user's job, after the migration.
- **Run commands through the project.** Open Orange is a dev dependency of the project, so run `pnpm orange ...` (or the project's package manager). When the project has no `orange`, install it as the [Open Orange README](https://github.com/rivet-dev/open-orange#readme) says. `orange <command> --help` is the source of truth for flags.
- **Rivet MCP.** When the user's agent has no Rivet MCP server, suggest it once for reading cluster state and logs: `claude mcp add --transport http rivet https://mcp.rivet.dev/mcp`. Other clients are at <https://rivet.dev/docs/mcp/>.

## Steps

1. **Check the project.** Run `orange doctor --json` and read each event as `references/doctor.md` says. Fix every `check` event with `"status":"fail"`. Show the user a table of the `binding` events. To migrate, read the Wrangler `migrations` too: a class created in `new_classes` is KV-backed and cannot move.
   **Stop and ask:** confirm the bindings that need setup, the ones not supported, and the Durable Object classes and D1 databases that will move.
   Done when doctor exits `0` and the user agreed to the plan.

2. **Run locally.** Follow "Run locally" in `references/deploy.md`. For a D1 app, apply its migrations to the local database first: `orange d1 migrations apply <DB> --local`. Start `orange dev` in the background on `http://127.0.0.1:8787` (or the `--port` used). Exercise every kind of route the app has: create, read, update, and delete, for each resource. When the app has its own test suite, run it against that URL.
   Done when each route gives the response that the app gives on Cloudflare. Stop `orange dev` after the check.

3. **Deploy to Rivet.** Follow `references/deploy.md`: pick a Rivet cluster (`orange deploy`) or the user's own Rivet Engine (`orange serve`), sign in, and run `orange deploy --dry-run`.
   When the Wrangler config has `triggers.crons` and the Worker still serves on Cloudflare, deploy with `--var ORANGE_CRONS:off`, or each cron runs on both sides ("Cron triggers" in `references/migrate.md`).
   **Stop and ask** before the first real `orange deploy`: it creates or rolls a runner pool, which can cost money.
   Done when `orange deploy` prints `✓ Deployed`, a `Build` ID, and a `URL`, and a request to that URL works. Record the build ID. When the data will move later, test the deployed Orange only as "Test the deployed Orange" in `references/migrate.md` says: a request that starts a Durable Object that also exists on Cloudflare, even a read, blocks that object's move. For a D1 app, the D1 database on Orange is empty until step 6, so check a route that does not use D1. Do not apply migrations to the deployed database: `orange migrate d1` then refuses with `already has ... tables` unless `--replace`.

4. **Prepare the Cloudflare Worker.** Go through "Before step 4" and "Where the secrets live" in `references/migrate.md` with the user. Run `orange migrate prepare`. It writes `wrangler.migrate.jsonc` and `.open-orange/migrate/worker.mjs` and deploys nothing.
   **Stop and ask** before the user runs `wrangler secret put WORKER_MIGRATOR_TOKEN --config wrangler.migrate.jsonc`: a new secret deploys a new version of the production Worker on Cloudflare.
   **Stop and ask** before `wrangler deploy --config wrangler.migrate.jsonc`: it replaces the production Worker on Cloudflare with the wrapped Worker.
   Done when the app works as before and the `resolve` or `state` check in `references/migrate.md` step 4 answers.

5. **Turn the migration on in Orange.** Deploy again with Orange's migration variables, `ORANGE_MIGRATE_WORKER_URL` and `WORKER_MIGRATOR_TOKEN` (`references/migrate.md` step 5).
   **Stop and ask** first: from this deploy on, an object that starts on Orange copies itself from Cloudflare.
   Done when the deploy prints `✓ Deployed`.

6. **Move each D1 database.** Run `orange migrate d1 <binding> --url <orange-url>` one time per database (`references/migrate.md` step 6).
   **Stop and ask** before each database, with its size: the app's writes to it fail from the start of the move until the switch, and all its queries fail during the export, about 50 seconds per GB. In a test, a 1 GB database was frozen for about 3 minutes. After the state is `moved` there is no automated way back. Ask again before any `--replace`.
   Done when each run prints `✓ Moved <binding>`.

7. **Cut over.** The user points the app's domain at Orange in their DNS provider. The user makes this change, and you wait.
   **Stop and ask:** the user confirms that the D1 databases moved (step 6), that clients with long-lived WebSockets reconnected after the step 4 deploy (`references/migrate.md` step 7), and tells you when DNS points at Orange.
   For a Worker with crons, move them to Orange after the DNS change ("Cron triggers" in `references/migrate.md`). **Stop and ask** first.
   Done when the user confirms the DNS change, and the crons run only on Orange.

8. **Backfill.** Wait at least 7 minutes after the cutover, run `orange migrate backfill --dry-run` to count the objects of each class, then run `orange migrate backfill --url https://<app-domain>` (`references/migrate.md` step 8).
   **Stop and ask** before the first real run, with the counts, which include objects that already moved: each object it wakes moves to Orange and refuses app traffic on Cloudflare.
   Done when a run reports `0 failed` for every class, and one more run a few minutes later reports `0 moved, 0 failed` for every class. Each run exits `0`.

9. **Verify.** Run the checks in `references/migrate.md` step 9.
   Done when every check passes. Report the results to the user.

10. **Clean up.** Follow `references/migrate.md` step 10: remove `ORANGE_MIGRATE_WORKER_URL` from the pool.
   **Stop and ask** before each action, and only after the user confirms that no traffic reaches the Cloudflare Worker.
   Done when the user knows that the Cloudflare Worker and its data are still on Cloudflare, for them to delete.

## Roll back

When the user asks to undo a step, or a step leaves production broken, follow `references/rollback.md`. Every rollback action changes production, so **stop and ask** before each one.

Full guides: [migrate.mdx](https://github.com/rivet-dev/open-orange/blob/main/docs/migrate.mdx) and [deploy.mdx](https://github.com/rivet-dev/open-orange/blob/main/docs/deploy.mdx).
