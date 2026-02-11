# CLI Reference

> Source: `docs/cli.mdx`
> Canonical URL: https://sandboxagent.dev/docs/cli
> Description: CLI reference for sandbox-agent.

---
Global flags (available on all commands):

- `-t, --token `: require/use bearer auth
- `-n, --no-token`: disable auth

## server

Run the HTTP server.

```bash
sandbox-agent server [OPTIONS]
```

| Option | Default | Description |
|--------|---------|-------------|
| `-H, --host ` | `127.0.0.1` | Host to bind |
| `-p, --port ` | `2468` | Port to bind |
| `-O, --cors-allow-origin ` | - | Allowed CORS origin (repeatable) |
| `-M, --cors-allow-method ` | all | Allowed CORS method (repeatable) |
| `-A, --cors-allow-header ` | all | Allowed CORS header (repeatable) |
| `-C, --cors-allow-credentials` | false | Enable CORS credentials |
| `--no-telemetry` | false | Disable anonymous telemetry |

```bash
sandbox-agent server --port 3000
```

Notes:

- Server logs are redirected to files by default.
- Set `SANDBOX_AGENT_LOG_STDOUT=1` to force stdout/stderr logging.
- Use `SANDBOX_AGENT_LOG_DIR` to override log directory.

## install-agent

Install or reinstall a single agent.

```bash
sandbox-agent install-agent <AGENT> [OPTIONS]
```

| Option | Description |
|--------|-------------|
| `-r, --reinstall` | Force reinstall |
| `--agent-version ` | Override agent package version |
| `--agent-process-version ` | Override agent process version |

```bash
sandbox-agent install-agent claude --reinstall
```

## opencode (experimental)

Start/reuse daemon and run `opencode attach` against `/opencode`.

```bash
sandbox-agent opencode [OPTIONS]
```

| Option | Default | Description |
|--------|---------|-------------|
| `-H, --host ` | `127.0.0.1` | Daemon host |
| `-p, --port ` | `2468` | Daemon port |
| `--session-title ` | - | Reserved option (currently no-op) |
| `--yolo` | false | OpenCode attach mode flag |

```bash
sandbox-agent opencode
```

## daemon

Manage the background daemon.

### daemon start

```bash
sandbox-agent daemon start [OPTIONS]
```

| Option | Default | Description |
|--------|---------|-------------|
| `-H, --host ` | `127.0.0.1` | Host |
| `-p, --port ` | `2468` | Port |
| `--upgrade` | false | Use ensure-running + upgrade behavior |

```bash
sandbox-agent daemon start
sandbox-agent daemon start --upgrade
```

### daemon stop

```bash
sandbox-agent daemon stop [OPTIONS]
```

| Option | Default | Description |
|--------|---------|-------------|
| `-H, --host ` | `127.0.0.1` | Host |
| `-p, --port ` | `2468` | Port |

### daemon status

```bash
sandbox-agent daemon status [OPTIONS]
```

| Option | Default | Description |
|--------|---------|-------------|
| `-H, --host ` | `127.0.0.1` | Host |
| `-p, --port ` | `2468` | Port |

## credentials

### credentials extract

```bash
sandbox-agent credentials extract [OPTIONS]
```

| Option | Description |
|--------|-------------|
| `-a, --agent ` | Filter by `claude`, `codex`, `opencode`, or `amp` |
| `-p, --provider ` | Filter by provider |
| `-d, --home-dir ` | Override home dir |
| `--no-oauth` | Skip OAuth sources |
| `-r, --reveal` | Show full credential values |

```bash
sandbox-agent credentials extract --agent claude --reveal
```

### credentials extract-env

```bash
sandbox-agent credentials extract-env [OPTIONS]
```

| Option | Description |
|--------|-------------|
| `-e, --export` | Prefix output with `export` |
| `-d, --home-dir ` | Override home dir |
| `--no-oauth` | Skip OAuth sources |

```bash
eval "$(sandbox-agent credentials extract-env --export)"
```

## api

API subcommands for scripting.

Shared option:

| Option | Default | Description |
|--------|---------|-------------|
| `-e, --endpoint ` | `http://127.0.0.1:2468` | Target server |

### api agents

```bash
sandbox-agent api agents list [--endpoint <URL>]
sandbox-agent api agents install <AGENT> [--reinstall] [--endpoint <URL>]
```
