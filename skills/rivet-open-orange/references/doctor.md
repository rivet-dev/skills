# Read `orange doctor --json`

`orange doctor` changes nothing. With `--json` it prints one JSON object per line. Useful flags: `-c, --config <path>`, `-e, --env <name>`, `--cwd <dir>`, `--port <port>` (default `8787`), `--ip <host>` (default `127.0.0.1`), and `--strict`, which also exits `1` when something needs setup.

## Exit code

| Code | Meaning |
|---|---|
| `0` | Ready for `orange dev` |
| `1` | A check failed, or, with `--strict`, something needs setup |
| `2` | Invalid arguments. The only event is a `failure` event. |

A binding that is not supported does not change the exit code. Read the `binding` events too.

## Events

### `check`

```json
{"type":"check","id":"node","title":"Node.js","status":"ok","detail":"24.6.0"}
```

| `status` | Meaning | What to do |
|---|---|---|
| `ok` | Passes | Nothing |
| `action` | A feature needs setup before it works. `orange dev` still starts. | Tell the user the `hint`. |
| `fail` | `orange dev` cannot start | Fix it with the `hint`, then run doctor again. |

| `id` | Checks | Usual fix for `fail` |
|---|---|---|
| `node` | The Node.js version is in Orange's range | Install the Node.js major in the `hint` |
| `rivetkit` | The pinned RivetKit packages and engine binary are installed | Reinstall Open Orange |
| `config` | The Wrangler configuration loads | Fix the error in `detail` |
| `bundle` | The Worker bundles. Skipped when the config has a custom `build`. | Fix the import or build error in `detail` |
| `port` | The port is free | Stop the other server, or pass the free port that the `hint` names to `orange dev --port` |
| `disk` | The disk of `.open-orange/` has room for the local Rivet Engine's log, by the same rule that `orange dev` uses. `detail` shows the free space and the log size Orange picks: half the free space, from 256 MiB to 4 GiB. Below 512 MiB free, it fails. | The user frees disk space. When `RIVET__STORAGE__LOG_SHARD__MAX_DISK_BYTES` is set in the shell, it wins: lower it or unset it. When `detail` starts with `Couldn't read the free disk space`, fix the permissions of `.open-orange/`. |
| `ai:<binding>` | Workers AI has an API key (`action` when it has none) | The user sets the key in `.dev.vars` |
| `r2:<binding>` | The R2 backend settings are complete | The user sets the missing variables in `.dev.vars` |
| `chanfana` | A project with D1 has chanfana 3.1.0 or later installed (`action` when it is older: its deletes use `DELETE ... LIMIT`, which Orange's D1 rejects) | The user upgrades chanfana to 3.1.0 or later |
| `sandbox` | The sandbox provider for container classes is set (`action` when it is not) | The user sets the provider key in `.dev.vars` |

### `binding`

One event per binding, Durable Objects first.

```json
{"type":"binding","name":"AI","bindingType":"ai","resource":"Workers AI","status":"pluggable","support":"needs_service","runsOn":"OpenAI-compatible API","setup":"Set ...","docs":"https://..."}
```

| Field | Meaning |
|---|---|
| `name` | The binding, as in `env.<name>`. This is the value to pass to `orange migrate d1`. |
| `bindingType` | The Wrangler binding type, such as `d1`, `kv_namespace`, `durable_object_namespace` |
| `support` | `runs_as_is` needs nothing. `needs_service` needs a service the user supplies: tell them `setup`. `not_supported` has no backend, so its calls throw or its data is dropped: tell them `alternative`, or the `docs` page when there is no `alternative`. |
| `status` | `local`, `pluggable` (a backend set by a variable), or `stub` (every call throws) |
| `runsOn` | What backs the binding on Rivet |
| `docs` | The Open Orange page for the binding |

An older Orange prints no `support` field. Then treat `"status":"stub"` as not supported.

Show the user one table: binding, resource, support, and the `setup` or `alternative` text.

### `summary`

```json
{"type":"summary","ok":5,"actions":1,"failures":0,"exitCode":0,"bindings":{"runs_as_is":1,"needs_service":1,"not_supported":0}}
```

The last line. `failures` and `actions` count `check` events. `bindings` counts `binding` events by `support`.

### `failure`

```json
{"type":"failure","message":"--port needs a value","hint":"Run open-orange doctor --help."}
```

Only for invalid arguments, with exit code `2`. Fix the command.

## What doctor does not check: migration

Doctor does not read the Durable Object storage backend. Before a migration, read the `migrations` array of the Wrangler configuration, in order:

| The class was created in | It can move |
|---|---|
| `new_sqlite_classes` | Yes |
| `new_classes` | No. It is KV-backed, and Cloudflare gives it no way to export. `orange migrate prepare` refuses the whole Worker. |

A `renamed_classes` entry keeps the backend, and `deleted_classes` removes the class. Each class to move also needs an entry in `durable_objects.bindings`. `prepare` also refuses `no_bundle: true`.

Other things that do not move: KV namespaces, R2 buckets, Queues, Durable Object facets, Durable Objects in a jurisdiction, and Durable Object or D1 virtual tables such as FTS5. Tell the user before step 4, because KV and R2 data needs its own copy.
