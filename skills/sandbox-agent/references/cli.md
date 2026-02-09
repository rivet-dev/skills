# CLI Reference

> Source: `docs/cli.mdx`
> Canonical URL: https://sandboxagent.dev/docs/cli
> Description: Complete CLI reference for sandbox-agent.

---
## Server

Start the HTTP server:

```bash
sandbox-agent server [OPTIONS]
```

| Option | Default | Description |
|--------|---------|-------------|
| `-t, --token ` | - | Authentication token for all requests |
| `-n, --no-token` | - | Disable authentication (local dev only) |
| `-H, --host ` | `127.0.0.1` | Host to bind to |
| `-p, --port ` | `2468` | Port to bind to |
| `-O, --cors-allow-origin ` | - | CORS origin to allow (repeatable) |
| `-M, --cors-allow-method ` | all | CORS allowed method (repeatable) |
| `-A, --cors-allow-header ` | all | CORS allowed header (repeatable) |
| `-C, --cors-allow-credentials` | - | Enable CORS credentials |
| `--no-telemetry` | - | Disable anonymous telemetry |
| `--log-to-file` | - | Redirect server logs to a daily log file |

```bash
sandbox-agent server --token "$TOKEN" --port 3000
```

Server logs print to stdout/stderr by default. Use `--log-to-file` or `SANDBOX_AGENT_LOG_TO_FILE=1` to redirect logs to a daily log file under the sandbox-agent data directory (for example, `~/.local/share/sandbox-agent/logs`). Override the directory with `SANDBOX_AGENT_LOG_DIR`, or set `SANDBOX_AGENT_LOG_STDOUT=1` to force stdout/stderr.

HTTP request logging is enabled by default. Control it with:
- `SANDBOX_AGENT_LOG_HTTP=0` to disable request logs
- `SANDBOX_AGENT_LOG_HTTP_HEADERS=1` to include request headers (Authorization is redacted)

---

## Install Agent (Local)

Install an agent without running the server:

```bash
sandbox-agent install-agent <AGENT> [OPTIONS]
```

| Option | Description |
|--------|-------------|
| `-r, --reinstall` | Force reinstall even if already installed |

```bash
sandbox-agent install-agent claude --reinstall
```

---

## OpenCode (Experimental)

Start (or reuse) a sandbox-agent daemon and attach an OpenCode session (uses `opencode attach`):

```bash
sandbox-agent opencode [OPTIONS]
```

| Option | Default | Description |
|--------|---------|-------------|
| `-t, --token ` | - | Authentication token for all requests |
| `-n, --no-token` | - | Disable authentication (local dev only) |
| `-H, --host ` | `127.0.0.1` | Host to bind to |
| `-p, --port ` | `2468` | Port to bind to |
| `--session-title ` | - | Title for the OpenCode session |

```bash
sandbox-agent opencode --token "$TOKEN"
```

The daemon logs to a per-host log file under the sandbox-agent data directory (for example, `~/.local/share/sandbox-agent/daemon/daemon-127-0-0-1-2468.log`).

Existing installs are reused and missing binaries are installed automatically.

---

## Daemon

Manage the background daemon. See the [Daemon](/daemon) docs for details on lifecycle and auto-upgrade.

### Start

```bash
sandbox-agent daemon start [OPTIONS]
```

| Option | Default | Description |
|--------|---------|-------------|
| `-H, --host ` | `127.0.0.1` | Host to bind to |
| `-p, --port ` | `2468` | Port to bind to |
| `-t, --token ` | - | Authentication token |
| `-n, --no-token` | - | Disable authentication |

```bash
sandbox-agent daemon start --no-token
```

### Stop

```bash
sandbox-agent daemon stop [OPTIONS]
```

| Option | Default | Description |
|--------|---------|-------------|
| `-H, --host ` | `127.0.0.1` | Host of the daemon |
| `-p, --port ` | `2468` | Port of the daemon |

### Status

```bash
sandbox-agent daemon status [OPTIONS]
```

| Option | Default | Description |
|--------|---------|-------------|
| `-H, --host ` | `127.0.0.1` | Host of the daemon |
| `-p, --port ` | `2468` | Port of the daemon |

---

## Credentials

### Extract

Extract locally discovered credentials:

```bash
sandbox-agent credentials extract [OPTIONS]
```

| Option | Description |
|--------|-------------|
| `-a, --agent ` | Filter by agent (`claude`, `codex`, `opencode`, `amp`) |
| `-p, --provider ` | Filter by provider (`anthropic`, `openai`) |
| `-d, --home-dir ` | Custom home directory for credential search |
| `-r, --reveal` | Show full credential values (default: redacted) |
| `--no-oauth` | Exclude OAuth credentials |

```bash
sandbox-agent credentials extract --agent claude --reveal
sandbox-agent credentials extract --provider anthropic
```

### Extract as Environment Variables

Output credentials as shell environment variables:

```bash
sandbox-agent credentials extract-env [OPTIONS]
```

| Option | Description |
|--------|-------------|
| `-e, --export` | Prefix each line with `export` |
| `-d, --home-dir ` | Custom home directory for credential search |
| `--no-oauth` | Exclude OAuth credentials |

```bash
# Source directly into shell
eval "$(sandbox-agent credentials extract-env --export)"
```

---

## API Commands

The `sandbox-agent api` subcommand mirrors the HTTP API for scripting without client code.

All API commands support:

| Option | Default | Description |
|--------|---------|-------------|
| `-e, --endpoint ` | `http://127.0.0.1:2468` | API endpoint |
| `-t, --token ` | - | Authentication token |

---

### Agents

#### List Agents

```bash
sandbox-agent api agents list
```

#### Install Agent

```bash
sandbox-agent api agents install <AGENT> [OPTIONS]
```

| Option | Description |
|--------|-------------|
| `-r, --reinstall` | Force reinstall |

```bash
sandbox-agent api agents install claude --reinstall
```

#### Get Agent Modes

```bash
sandbox-agent api agents modes <AGENT>
```

```bash
sandbox-agent api agents modes claude
```

#### Get Agent Models

```bash
sandbox-agent api agents models <AGENT>
```

```bash
sandbox-agent api agents models claude
```

---

### Sessions

#### List Sessions

```bash
sandbox-agent api sessions list
```

#### Create Session

```bash
sandbox-agent api sessions create <SESSION_ID> [OPTIONS]
```

| Option | Description |
|--------|-------------|
| `-a, --agent ` | Agent identifier (required) |
| `-g, --agent-mode ` | Agent mode |
| `-p, --permission-mode ` | Permission mode (`default`, `plan`, `bypass`, `acceptEdits`) |
| `-m, --model ` | Model override |
| `-v, --variant ` | Model variant |
| `-A, --agent-version ` | Agent version |
| `--mcp-config ` | JSON file with MCP server config (see `mcp` docs) |
| `--skill ` | Skill directory or `SKILL.md` path (repeatable) |

```bash
sandbox-agent api sessions create my-session \
  --agent claude \
  --agent-mode code \
  --permission-mode default
```

`acceptEdits` passes through to Claude, auto-approves file changes for Codex, and is treated as `default` for other agents.

#### Send Message

```bash
sandbox-agent api sessions send-message <SESSION_ID> [OPTIONS]
```

| Option | Description |
|--------|-------------|
| `-m, --message ` | Message text (required) |

```bash
sandbox-agent api sessions send-message my-session \
  --message "Summarize the repository"
```

#### Send Message (Streaming)

Send a message and stream the response:

```bash
sandbox-agent api sessions send-message-stream <SESSION_ID> [OPTIONS]
```

| Option | Description |
|--------|-------------|
| `-m, --message ` | Message text (required) |
| `--include-raw` | Include raw agent data |

```bash
sandbox-agent api sessions send-message-stream my-session \
  --message "Help me debug this"
```

#### Terminate Session

```bash
sandbox-agent api sessions terminate <SESSION_ID>
```

```bash
sandbox-agent api sessions terminate my-session
```

#### Get Events

Fetch session events:

```bash
sandbox-agent api sessions events <SESSION_ID> [OPTIONS]
```

| Option | Description |
|--------|-------------|
| `-o, --offset ` | Event offset |
| `-l, --limit ` | Max events to return |
| `--include-raw` | Include raw agent data |

```bash
sandbox-agent api sessions events my-session --offset 0 --limit 50
```

`get-messages` is an alias for `events`.

#### Stream Events (SSE)

Stream session events via Server-Sent Events:

```bash
sandbox-agent api sessions events-sse <SESSION_ID> [OPTIONS]
```

| Option | Description |
|--------|-------------|
| `-o, --offset ` | Event offset to start from |
| `--include-raw` | Include raw agent data |

```bash
sandbox-agent api sessions events-sse my-session --offset 0
```

#### Reply to Question

```bash
sandbox-agent api sessions reply-question <SESSION_ID> <QUESTION_ID> [OPTIONS]
```

| Option | Description |
|--------|-------------|
| `-a, --answers ` | JSON array of answers (required) |

```bash
sandbox-agent api sessions reply-question my-session q1 \
  --answers '[["yes"]]'
```

#### Reject Question

```bash
sandbox-agent api sessions reject-question <SESSION_ID> <QUESTION_ID>
```

```bash
sandbox-agent api sessions reject-question my-session q1
```

#### Reply to Permission

```bash
sandbox-agent api sessions reply-permission <SESSION_ID> <PERMISSION_ID> [OPTIONS]
```

| Option | Description |
|--------|-------------|
| `-r, --reply ` | `once`, `always`, or `reject` (required) |

```bash
sandbox-agent api sessions reply-permission my-session perm1 --reply once
```

---

### Filesystem

#### List Entries

```bash
sandbox-agent api fs entries [OPTIONS]
```

| Option | Description |
|--------|-------------|
| `--path ` | Directory path (default: `.`) |
| `--session-id ` | Resolve relative paths from the session working directory |

```bash
sandbox-agent api fs entries --path ./workspace
```

#### Read File

`api fs read` writes raw bytes to stdout.

```bash
sandbox-agent api fs read <PATH> [OPTIONS]
```

| Option | Description |
|--------|-------------|
| `--session-id ` | Resolve relative paths from the session working directory |

```bash
sandbox-agent api fs read ./notes.txt > ./notes.txt
```

#### Write File

```bash
sandbox-agent api fs write <PATH> [OPTIONS]
```

| Option | Description |
|--------|-------------|
| `--content ` | Write UTF-8 content |
| `--from-file ` | Read content from a local file |
| `--session-id ` | Resolve relative paths from the session working directory |

```bash
sandbox-agent api fs write ./hello.txt --content "hello"
sandbox-agent api fs write ./image.bin --from-file ./image.bin
```

#### Delete Entry

```bash
sandbox-agent api fs delete <PATH> [OPTIONS]
```

| Option | Description |
|--------|-------------|
| `--recursive` | Delete directories recursively |
| `--session-id ` | Resolve relative paths from the session working directory |

```bash
sandbox-agent api fs delete ./old.log
```

#### Create Directory

```bash
sandbox-agent api fs mkdir <PATH> [OPTIONS]
```

| Option | Description |
|--------|-------------|
| `--session-id ` | Resolve relative paths from the session working directory |

```bash
sandbox-agent api fs mkdir ./cache
```

#### Move/Rename

```bash
sandbox-agent api fs move <FROM> <TO> [OPTIONS]
```

| Option | Description |
|--------|-------------|
| `--overwrite` | Overwrite destination if it exists |
| `--session-id ` | Resolve relative paths from the session working directory |

```bash
sandbox-agent api fs move ./a.txt ./b.txt --overwrite
```

#### Stat

```bash
sandbox-agent api fs stat <PATH> [OPTIONS]
```

| Option | Description |
|--------|-------------|
| `--session-id ` | Resolve relative paths from the session working directory |

```bash
sandbox-agent api fs stat ./notes.txt
```

#### Upload Batch (tar)

```bash
sandbox-agent api fs upload-batch --tar <PATH> [OPTIONS]
```

| Option | Description |
|--------|-------------|
| `--tar ` | Tar archive to extract |
| `--path ` | Destination directory |
| `--session-id ` | Resolve relative paths from the session working directory |

```bash
sandbox-agent api fs upload-batch --tar ./skills.tar --path ./skills
```

---

## CLI to HTTP Mapping

| CLI Command | HTTP Endpoint |
|-------------|---------------|
| `api agents list` | `GET /v1/agents` |
| `api agents install` | `POST /v1/agents/{agent}/install` |
| `api agents modes` | `GET /v1/agents/{agent}/modes` |
| `api agents models` | `GET /v1/agents/{agent}/models` |
| `api sessions list` | `GET /v1/sessions` |
| `api sessions create` | `POST /v1/sessions/{sessionId}` |
| `api sessions send-message` | `POST /v1/sessions/{sessionId}/messages` |
| `api sessions send-message-stream` | `POST /v1/sessions/{sessionId}/messages/stream` |
| `api sessions terminate` | `POST /v1/sessions/{sessionId}/terminate` |
| `api sessions events` | `GET /v1/sessions/{sessionId}/events` |
| `api sessions events-sse` | `GET /v1/sessions/{sessionId}/events/sse` |
| `api sessions reply-question` | `POST /v1/sessions/{sessionId}/questions/{questionId}/reply` |
| `api sessions reject-question` | `POST /v1/sessions/{sessionId}/questions/{questionId}/reject` |
| `api sessions reply-permission` | `POST /v1/sessions/{sessionId}/permissions/{permissionId}/reply` |
| `api fs entries` | `GET /v1/fs/entries` |
| `api fs read` | `GET /v1/fs/file` |
| `api fs write` | `PUT /v1/fs/file` |
| `api fs delete` | `DELETE /v1/fs/entry` |
| `api fs mkdir` | `POST /v1/fs/mkdir` |
| `api fs move` | `POST /v1/fs/move` |
| `api fs stat` | `GET /v1/fs/stat` |
| `api fs upload-batch` | `POST /v1/fs/upload-batch` |
