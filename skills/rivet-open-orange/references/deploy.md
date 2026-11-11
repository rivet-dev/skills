# Run and deploy with Open Orange

## Run locally

```sh
pnpm orange dev
```

It prints the binding table, then `● Ready in <time>` and `Local http://127.0.0.1:8787`. Local data is in `.open-orange/`, which belongs in `.gitignore`. Pass `--port <port>` when `8787` is in use.

Orange's D1 rejects `DELETE ... LIMIT` and `UPDATE ... LIMIT`, which Cloudflare's D1 accepts. Such a query fails with `D1_ERROR: near "LIMIT": syntax error at offset <n>: SQLITE_ERROR`. chanfana before 3.1.0 deletes this way, and doctor reports it as the `chanfana` check: the fix is chanfana 3.1.0 or later. In the app's own SQL, the fix is a subquery: `DELETE FROM t WHERE rowid IN (SELECT rowid FROM t WHERE ... LIMIT 1)`. Tell the user before you change their code.

Keep `ORANGE_MIGRATE_WORKER_URL` out of `.dev.vars` and out of the shell that runs `orange dev`. With it set in either place, `orange dev` turns the migration on, and an object that starts locally copies itself from the production Worker, which then refuses app traffic for that object. After you load the migration env file into a shell, start `orange dev` with `env -u ORANGE_MIGRATE_WORKER_URL pnpm orange dev`.

`orange dev` starts its own local Rivet Engine. To run against an Engine that the user runs, use `orange serve` with `RIVET_ENDPOINT` (see "Run on the user's own Rivet Engine").

For a D1 app, the local database is empty at first. Apply the app's migrations to it with `pnpm orange d1 migrations apply <DB> --local`.

## Pick where it runs

**Stop and ask** which one the user wants.

| Target | Command | What the user needs |
|---|---|---|
| A Rivet cluster | `orange deploy` | Docker, a Rivet Cloud account, and a cluster |
| The user's own Rivet Engine | `orange serve`, or the image from `orange deploy --dry-run --outdir out` | A Rivet Engine and its `RIVET_ENDPOINT` |

## Deploy to a Rivet cluster

1. Sign in and link. `orange login` opens a browser for the user. `link` writes `.rivet/project.json`, shared with the Rivet CLI.

   ```sh
   pnpm orange login
   pnpm orange link --cluster <cluster-name>
   pnpm orange whoami
   ```

   Do not guess the cluster name. Ask the user, or list clusters with the Rivet MCP. `--org <slug>` picks the organization when the user has several. In CI, the token comes from `RIVET_CLOUD_TOKEN`, never `--token`, because a flag stays in shell history.

2. Check the plan. A dry run writes the build to `.open-orange/deploy/` and calls no API.

   ```sh
   pnpm orange deploy --dry-run
   ```

   Show the user the cluster, region, pool, image, variables, and secrets it prints. A cluster with several regions needs `--region`. The pool defaults to `default`.

3. **Stop and ask**, then deploy.

   ```sh
   pnpm orange deploy
   ```

   A deploy takes several minutes: a Docker build, an upload, about 3 to 5 minutes for Rivet Cloud to prepare the build, and a rollout. It ends with:

   ```
   ✓ Deployed <image> to pool <pool> in <region>
     Build   <build-id>
     URL     <pool-url>
   ```

   Record the build ID for a rollback. The URL is the Orange URL in the migration steps.

### Variables and secrets

| Source | Reaches the deployed Worker |
|---|---|
| `vars` in the Wrangler configuration | Yes, inside the image. Never put a secret here. |
| `--var NAME:value` | Yes, in the pool's environment |
| `--secrets-file <path>` | Yes. Each entry becomes a cluster secret. The file is a JSON object or `.env` lines. |
| `--secret KEY[=SECRET_NAME]` | Yes, from a secret the cluster already holds (set with `rivet cluster secret set`) |
| `.dev.vars` and `.env` | Only through `--secrets-file`. They never enter the image. |

- These flags add to the pool's variables and keep the rest. A deploy without them leaves the variables as they are.
- `rivet cluster env unset <KEY> --pool <pool>` removes a variable and rolls the pool. `--pool` defaults to `default`, so pass it for any other pool. It needs the Rivet CLI.
- `--secrets-file .dev.vars` uploads every entry of `.dev.vars`. Check with the user which names the file holds, without reading the values, before you pass it.
- Orange refuses a value with a line break, a secret over 1,024 bytes, and an empty value in a secrets file.
- `-e <name>` picks a Wrangler environment. It does not set a variable.

### Deploy errors

| Response | Meaning |
|---|---|
| 401 | The token is missing, invalid, or expired. The user runs `orange login` again. |
| 403 or 404 | The cluster belongs to another organization, or does not exist. |
| 402 | The organization's plan or payment method does not cover the pool. |
| 400 | A value is invalid. Orange prints each field error. |
| Pool `degraded` or `down` | The deploy stops and prints the command that rolls the pool back. |

## Run on the user's own Rivet Engine

```sh
RIVET_ENDPOINT=https://<namespace>:<token>@<engine-host> pnpm orange serve
```

The user supplies `RIVET_ENDPOINT`, because it holds a token. As a container:

```sh
pnpm orange deploy --dry-run --outdir out
docker build --platform linux/amd64 -f out/Dockerfile -t my-worker out/context
docker run --rm -p 8080:8080 -e RIVET_ENDPOINT -e ORANGE_MIGRATE_WORKER_URL -e WORKER_MIGRATOR_TOKEN my-worker
```

A bare `-e NAME` makes Docker read the value from the user's shell. For a migration, set `ORANGE_MIGRATE_WORKER_URL` and `WORKER_MIGRATOR_TOKEN` this way in place of the deploy flags of migration step 5.

## Roll back a deploy

```sh
pnpm orange deploy --pool <pool> --build <earlier-build-id>
```

`--build` builds and uploads nothing. The pool keeps its variables.
