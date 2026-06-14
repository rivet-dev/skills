---
name: "ai-agent-workspace"
description: "Give every AI agent its own computer: a persistent workspace with a filesystem, processes, shells, networking, and agent sessions on a lightweight in-process OS."
---

# AI Agent Workspaces

**IMPORTANT: Before doing anything, you MUST read `BASE_SKILL.md` in this skill's directory. It contains essential guidance on debugging, error handling, state management, deployment, and project setup. Those rules and patterns apply to all RivetKit work. Everything below assumes you have already read and understood it.**

## Working Examples

If you need a reference implementation, read the raw working example code in these templates:

- [agent-os](https://github.com/rivet-dev/rivet/tree/main/examples/agent-os)


Patterns for giving every AI agent its own computer with [agentOS](/docs/agent-os): one Rivet Actor per agent that owns a portable, lightweight in-process OS running on Wasm and V8. Use it for code interpreters that keep state between runs, agents that ship artifacts behind shareable preview URLs, per-user dev environments, and scheduled maintenance agents. agentOS is in preview and the API is subject to change.

This entry is about giving an agent a workspace. For conversation memory, message queues, and streaming chat patterns, see [AI Agent](/cookbook/ai-agent/).

## Starter Code

The [agent-os](https://github.com/rivet-dev/rivet/tree/main/examples/agent-os) collection is reference code, one sub-example per capability; treat it as patterns to copy into your project rather than a turnkey app. The [agent-os-e2e](https://github.com/rivet-dev/rivet/tree/main/examples/agent-os-e2e) example is the complete end-to-end walkthrough.

| Example | Starter Code | Use When |
| --- | --- | --- |
| Hello World | [GitHub](https://github.com/rivet-dev/rivet/tree/main/examples/agent-os/src/hello-world) | You want the minimal loop: boot a VM lazily on the first action, write a file, read it back. |
| Filesystem | [GitHub](https://github.com/rivet-dev/rivet/tree/main/examples/agent-os/src/filesystem) | The agent needs the full file surface: recursive listing, stat, move, delete, and custom mounts. |
| Git | [GitHub](https://github.com/rivet-dev/rivet/tree/main/examples/agent-os/src/git) | The agent works with real git repos inside the workspace: init, commit, branch, and clone via `exec`. |
| Processes | [GitHub](https://github.com/rivet-dev/rivet/tree/main/examples/agent-os/src/processes) | The agent runs shell commands with pipes and long-lived spawned programs. |
| Network | [GitHub](https://github.com/rivet-dev/rivet/tree/main/examples/agent-os/src/network) | The agent serves HTTP inside the VM and you need `vmFetch` or signed preview URLs. |
| Cron | [GitHub](https://github.com/rivet-dev/rivet/tree/main/examples/agent-os/src/cron) | The workspace runs scheduled commands or recurring agent work. |
| Tools | [GitHub](https://github.com/rivet-dev/rivet/tree/main/examples/agent-os/src/tools) | You want your backend functions exposed as CLI commands inside the workspace. |
| Agent Session | [GitHub](https://github.com/rivet-dev/rivet/tree/main/examples/agent-os/src/agent-session) | You drive a Pi coding agent session inside the workspace. Requires `ANTHROPIC_API_KEY`. |
| Sandbox Mounting | [GitHub](https://github.com/rivet-dev/rivet/tree/main/examples/agent-os/src/sandbox) | The agent needs native binaries or a real OS, mounted into the VM from a Docker-backed sandbox. Requires Docker. |
| End-to-End Walkthrough | [GitHub](https://github.com/rivet-dev/rivet/tree/main/examples/agent-os-e2e) | You want one runnable script covering files, processes, preview URLs, and a streaming Pi agent session. |

## Setup

The whole backend is one registry with one `agentOs()` actor:

```typescript
import { agentOs } from "rivetkit/agent-os";
import { setup } from "rivetkit";
import common from "@rivet-dev/agent-os-common";
import pi from "@rivet-dev/agent-os-pi";

const vm = agentOs({
  options: { software: [common, pi] },
});

export const registry = setup({ use: { vm } });
registry.start();
```

See the [Quickstart](/docs/agent-os/quickstart) for the client side and project layout.

## Workspace Model

- **One actor per workspace, key as identity.** `client.vm.getOrCreate(["my-agent"])` gives each agent its own workspace; key by user id for per-user dev environments. Each workspace has its own filesystem, processes, and networking with no shared state and no cross-contamination (see the [overview](/docs/agent-os)).
- **Software packages choose what is installed.** agentOS starts with no commands installed. The `software` option installs packages such as `@rivet-dev/agent-os-common` (a meta-package of Wasm command-line tools: coreutils, sed, grep, gawk, findutils, diffutils, tar, and gzip), `@rivet-dev/agent-os-git` (git), and `@rivet-dev/agent-os-pi` (the Pi coding agent). See [Software](/docs/agent-os/software).
- **The VM boots lazily and sleeps when idle.** The first action boots the VM (clients see a `vmBooted` event); when nothing is active, the actor sleeps and broadcasts `vmShutdown`, then wakes on the next action.

What survives a sleep/wake cycle (see [Persistence](/docs/agent-os/persistence)):

| Data | Across sleep/wake |
| --- | --- |
| Session transcripts and event history | Persist in actor SQLite as events stream. `listPersistedSessions` and `getSessionEvents` read them back without booting the VM, and `resumeSession` picks a session back up in a rebooted VM. |
| Signed preview URL tokens | Persist in actor SQLite. Requests are validated against the stored token and the VM reboots lazily to serve them, so preview URLs keep working after sleep. |
| Files | Persist when the mount is backed by a persistent driver (database-backed, S3, or a sandbox mount). In-memory mounts come back empty on wake. |
| Processes, shells, and cron jobs | Do not persist. Restart long-running processes and reschedule cron jobs on wake (recommended extension). |

The actor holds itself awake while sessions, processes, shells, or hooks are active, then sleeps after a grace period.

## Capability Tour

| Area | Use It For | Key Actions | Docs | Example |
| --- | --- | --- | --- | --- |
| Filesystem | Give the agent a file tree to read and write | `readFile`, `writeFile`, `mkdir`, `readdir`, `move` | [Filesystem](/docs/agent-os/filesystem) | [GitHub](https://github.com/rivet-dev/rivet/tree/main/examples/agent-os/src/filesystem) |
| Processes | Run commands and long-lived programs | `exec`, `spawn`, `waitProcess`, `killProcess` | [Processes](/docs/agent-os/processes) | [GitHub](https://github.com/rivet-dev/rivet/tree/main/examples/agent-os/src/processes) |
| Shells | Interactive terminals with streamed output | `openShell`, `writeShell`, `resizeShell`, `closeShell` | [Processes](/docs/agent-os/processes) | No standalone example |
| Networking and preview URLs | Reach services inside the VM and share them externally | `vmFetch`, `createSignedPreviewUrl`, `expireSignedPreviewUrl` | [Networking](/docs/agent-os/networking) | [GitHub](https://github.com/rivet-dev/rivet/tree/main/examples/agent-os/src/network) |
| Cron | Scheduled commands and recurring agent sessions | `scheduleCron`, `listCronJobs`, `cancelCronJob` | [Cron](/docs/agent-os/cron) | [GitHub](https://github.com/rivet-dev/rivet/tree/main/examples/agent-os/src/cron) |
| Agent sessions | Drive a coding agent inside the workspace | `createSession`, `sendPrompt`, `resumeSession`, `closeSession` | [Sessions](/docs/agent-os/sessions) | [GitHub](https://github.com/rivet-dev/rivet/tree/main/examples/agent-os/src/agent-session) |

Two details worth knowing up front:

- `createSignedPreviewUrl` returns a relative path plus the token and expiry. Build the full URL with the client handle's `getGatewayUrl()` method; it is a client method, not an actor action.
- Schedule cron jobs through the actor with the `exec` and `session` action types only. Callback cron actions are defined in server code and do not serialize through `listCronJobs`.

## Driving a Coding Agent Session

Only the Pi agent (`@rivet-dev/agent-os-pi`) is currently supported as a session agent; Amp, Claude Code, Codex, and OpenCode are coming soon. See [Sessions](/docs/agent-os/sessions).

1. `createSession("pi", { env: { ANTHROPIC_API_KEY } })` returns a `sessionId`. The VM does not inherit the host `process.env`, so API keys are passed explicitly per session or kept server-side through the [LLM gateway](/docs/agent-os/llm-gateway).
2. Open a realtime connection and subscribe to `sessionEvent` to stream the agent's output, such as message chunks, as it works.
3. `sendPrompt(sessionId, ...)` starts a turn; `cancelPrompt` stops one in flight.
4. When the agent asks to use a tool, clients receive a `permissionRequest` event and answer with `respondPermission`, or the server auto-approves with the `onPermissionRequest` config hook (see [Permissions](/docs/agent-os/permissions)).
5. Transcripts are persisted automatically in the universal transcript format (Agent Communication Protocol, ACP). After sleep, `resumeSession` continues a session in the rebooted VM, and `listPersistedSessions` plus `getSessionEvents` read history without booting the VM at all.

## Host Tools

Expose your backend functions to the agent as CLI commands inside the workspace. Define a toolkit with `toolKit()` and `hostTool()` (Zod-schema'd JavaScript functions on the host), pass it via `agentOs({ options: { toolKits: [...] } })`, and it is installed as a command such as `agentos-weather forecast --city Paris --days 3` and injected into the agent's system prompt. The agent calls your backend with no HTTP endpoints or MCP servers to stand up, and CLI-shaped tools are code mode compatible for large token savings. See [Tools](/docs/agent-os/tools) and the [tools example](https://github.com/rivet-dev/rivet/tree/main/examples/agent-os/src/tools).

## When to Mount a Full Sandbox

agentOS is not a replacement for sandboxes; it is designed to work alongside them. When a workspace needs native binaries, browsers, compilation, or desktop automation, use sandbox mounting: start a Docker-backed sandbox with `SandboxAgent.start({ sandbox: docker() })`, project its filesystem into the VM as a native directory (for example `/sandbox`) with `createSandboxFs`, and expose sandbox process control as host tools with `createSandboxToolkit`. Filesystem actions like `writeFile` and `readFile` project transparently through the mount while heavy workloads run in the container.

See [Sandbox Mounting](/docs/agent-os/sandbox) for the hybrid model and [agentOS vs Sandboxes](/docs/agent-os/versus-sandbox) for when each side wins: the lightweight VM has a near-zero cold start (~6 ms) and installs with `npm install`, while sandboxes are full Linux environments billed per second of uptime.

## Architecture

| Topic | Summary |
| --- | --- |
| Topology | One `vm[workspaceId]` actor per agent or per user; the actor key is the workspace identity. |
| Ingress | Actor actions for files, processes, networking, cron, and sessions; a realtime connection for streamed events. |
| Streaming | `sessionEvent` per agent event, `processOutput` and `processExit` for spawned processes, `shellData` for interactive shells. |
| Persistence | Session transcripts, event history, and preview tokens in actor SQLite; files persist through persistent mounts. |

**Actors**

- **Key**: `vm[workspaceId]`, for example `client.vm.getOrCreate(["my-agent"])`
- **Responsibility**: Owns one workspace. Boots the VM lazily on the first action, serves all capability actions, proxies signed preview URL requests into the VM's virtual network, and persists sessions and tokens to actor SQLite.
- **Actions** (grouped; the most load-bearing of each area)
  - Filesystem: `readFile`, `writeFile`, `mkdir`, `readdir`, `readdirRecursive`, `stat`, `exists`, `move`, `deleteFile`
  - Processes: `exec`, `spawn`, `writeProcessStdin`, `waitProcess`, `listProcesses`, `killProcess`
  - Shells: `openShell`, `writeShell`, `resizeShell`, `closeShell`
  - Network: `vmFetch`, `createSignedPreviewUrl`, `expireSignedPreviewUrl`
  - Cron: `scheduleCron`, `listCronJobs`, `cancelCronJob`
  - Sessions: `createSession`, `sendPrompt`, `cancelPrompt`, `respondPermission`, `resumeSession`, `closeSession`, `destroySession`, `listPersistedSessions`, `getSessionEvents`
- **Queues**
  - None
- **Events**
  - `vmBooted`
  - `vmShutdown`
  - `sessionEvent`
  - `permissionRequest`
  - `processOutput`
  - `processExit`
  - `shellData`
  - `cronEvent`
- **State**
  - SQLite
  - `agent_os_sessions` and `agent_os_session_events` (session metadata plus seq-ordered transcript events)
  - `agent_os_preview_tokens` (signed preview URL tokens with expiry)
  - `agent_os_fs_entries` (file content for database-backed mounts)

**Lifecycle**

```mermaid
sequenceDiagram
	participant C as Client
	participant A as vm actor
	participant V as agentOS VM
	participant P as Pi session

	C->>A: getOrCreate(["my-agent"])
	C->>A: writeFile("/tmp/hello.txt", ...)
	Note over A,V: first action boots the VM
	A-->>C: vmBooted
	C->>A: exec("echo hello | tr a-z A-Z")
	A->>V: run command
	V-->>A: {exitCode: 0, stdout}
	C->>A: spawn("node", ["/tmp/server.mjs"])
	C->>A: createSignedPreviewUrl(8080, 60)
	A-->>C: {path, token, expiresAt}
	C->>A: fetch(gatewayUrl + path)
	Note over A: token checked in SQLite, request proxied into the VM network
	C->>A: createSession("pi", {env})
	A->>P: start session
	C->>A: sendPrompt(sessionId, ...)
	loop streamed agent output
		P-->>A: agent event
		A-->>C: sessionEvent
	end
	Note over A: idle, sleeps after grace period (vmShutdown)
	C->>A: resumeSession(sessionId)
	Note over A,V: wake reboots the VM, restoring transcripts, preview tokens, and persistent mounts
```

## Security Checklist

- **Authenticate connections**: Add the `onBeforeConnect` hook in the `agentOs()` config so only authorized callers reach a workspace. Signed preview URL requests deliberately skip it because the token is the credential; browsers navigating a preview URL cannot supply actor connection params.
- **Gate agent tool use with permissions**: Session permission requests broadcast as `permissionRequest` events for human-in-the-loop approval via `respondPermission`, or run a server-side `onPermissionRequest` policy for automated pipelines. See [Permissions](/docs/agent-os/permissions).
- **Treat preview URLs as bearer credentials**: Tokens are randomly generated 32-character values with a default expiry of 1 hour and a maximum of 24; revoke early with `expireSignedPreviewUrl`. Preview responses carry permissive CORS headers, so do not serve private data on a preview port without app-level auth.
- **Keep LLM credentials off the browser**: Create sessions from trusted server code with the key in `createSession` env, or keep keys entirely server-side with the [LLM gateway](/docs/agent-os/llm-gateway). Session keys are injected into the session environment inside the VM and are never stored in actor config or SQLite.
- **Treat mounted sandboxes as their own trust boundary**: A mounted sandbox is a full Linux environment outside the workspace's Wasm and V8 isolate. Scope what its network and filesystem can reach before projecting it into an agent's VM.
- **Set resource and cost limits**: Cap per-workspace memory and CPU (`maxMemoryMb`, `maxCpuPercent`, see [Security](/docs/agent-os/security)). Active sessions, processes, and shells hold the actor awake, so add per-workspace session caps and token budgets as a recommended extension.

## Reference Map

### Actors

- [Access Control](reference/actors/access-control.md)
- [Actions](reference/actors/actions.md)
- [Actor Keys](reference/actors/keys.md)
- [Actor Scheduling](reference/actors/schedule.md)
- [Actor Statuses](reference/actors/statuses.md)
- [AI and User-Generated Rivet Actors](reference/actors/ai-and-user-generated-actors.md)
- [Authentication](reference/actors/authentication.md)
- [Communicating Between Actors](reference/actors/communicating-between-actors.md)
- [Connections](reference/actors/connections.md)
- [Custom Inspector Tabs](reference/actors/inspector-tabs.md)
- [Debugging](reference/actors/debugging.md)
- [Design Patterns](reference/actors/design-patterns.md)
- [Destroying Actors](reference/actors/destroy.md)
- [Errors](reference/actors/errors.md)
- [Fetch and WebSocket Handler](reference/actors/fetch-and-websocket-handler.md)
- [Helper Types](reference/actors/helper-types.md)
- [Icons & Names](reference/actors/appearance.md)
- [Input Parameters](reference/actors/input.md)
- [Lifecycle](reference/actors/lifecycle.md)
- [Limits](reference/actors/limits.md)
- [Low-Level HTTP Request Handler](reference/actors/request-handler.md)
- [Low-Level KV Storage](reference/actors/kv.md)
- [Low-Level WebSocket Handler](reference/actors/websocket-handler.md)
- [Metadata](reference/actors/metadata.md)
- [Next.js Quickstart](reference/actors/quickstart/next-js.md)
- [Node.js & Bun Quickstart](reference/actors/quickstart/backend.md)
- [Queues & Run Loops](reference/actors/queues.md)
- [React Quickstart](reference/actors/quickstart/react.md)
- [Realtime](reference/actors/events.md)
- [Rust Quickstart (Preview)](reference/actors/quickstart/rust.md)
- [Sandbox Actor](reference/actors/sandbox.md)
- [Scaling & Concurrency](reference/actors/scaling.md)
- [Sharing and Joining State](reference/actors/sharing-and-joining-state.md)
- [SQLite](reference/actors/sqlite.md)
- [SQLite + Drizzle](reference/actors/sqlite-drizzle.md)
- [State & Storage](reference/actors/state.md)
- [Testing](reference/actors/testing.md)
- [Troubleshooting](reference/actors/troubleshooting.md)
- [Types](reference/actors/types.md)
- [Vanilla HTTP API](reference/actors/http-api.md)
- [Versions & Upgrades](reference/actors/versions.md)
- [Workflows](reference/actors/workflows.md)

### Agent Os

- [Agent-to-Agent Communication](reference/agent-os/agent-to-agent.md)
- [agentOS vs Sandbox](reference/agent-os/versus-sandbox.md)
- [Authentication](reference/agent-os/authentication.md)
- [Benchmarks](reference/agent-os/benchmarks.md)
- [Configuration](reference/agent-os/configuration.md)
- [Core Package](reference/agent-os/core.md)
- [Cron Jobs](reference/agent-os/cron.md)
- [Deployment](reference/agent-os/deployment.md)
- [Embedded LLM Gateway](reference/agent-os/llm-gateway.md)
- [Events](reference/agent-os/events.md)
- [Filesystem](reference/agent-os/filesystem.md)
- [Limitations](reference/agent-os/limitations.md)
- [LLM Credentials](reference/agent-os/llm-credentials.md)
- [Multiplayer](reference/agent-os/multiplayer.md)
- [Networking & Previews](reference/agent-os/networking.md)
- [Overview](reference/agent-os.md)
- [Permissions](reference/agent-os/permissions.md)
- [Persistence & Sleep](reference/agent-os/persistence.md)
- [Pi](reference/agent-os/agents/pi.md)
- [Processes & Shell](reference/agent-os/processes.md)
- [Queues](reference/agent-os/queues.md)
- [Quickstart](reference/agent-os/quickstart.md)
- [Sandbox Mounting](reference/agent-os/sandbox.md)
- [Security & Auth](reference/agent-os/security.md)
- [Security Model](reference/agent-os/security-model.md)
- [Sessions](reference/agent-os/sessions.md)
- [Software](reference/agent-os/software.md)
- [SQLite](reference/agent-os/sqlite.md)
- [System Prompt](reference/agent-os/system-prompt.md)
- [Tools](reference/agent-os/tools.md)
- [Webhooks](reference/agent-os/webhooks.md)
- [Workflow Automation](reference/agent-os/workflows.md)

### Clients

- [Node.js & Bun](reference/clients/javascript.md)
- [React](reference/clients/react.md)
- [Swift](reference/clients/swift.md)
- [SwiftUI](reference/clients/swiftui.md)

### Connect

- [Deploy To Amazon Web Services Lambda](reference/connect/aws-lambda.md)
- [Deploying to AWS ECS](reference/connect/aws-ecs.md)
- [Deploying to Cloudflare Workers](reference/connect/cloudflare.md)
- [Deploying to Freestyle](reference/connect/freestyle.md)
- [Deploying to Google Cloud Run](reference/connect/gcp-cloud-run.md)
- [Deploying to Hetzner](reference/connect/hetzner.md)
- [Deploying to Kubernetes](reference/connect/kubernetes.md)
- [Deploying to Railway](reference/connect/railway.md)
- [Deploying to Rivet Compute](reference/connect/rivet-compute.md)
- [Deploying to Supabase Functions](reference/connect/supabase.md)
- [Deploying to Vercel](reference/connect/vercel.md)
- [Deploying to VMs & Bare Metal](reference/connect/vm-and-bare-metal.md)

### Cookbook

- [AI Agent](reference/cookbook/ai-agent.md)
- [AI Agent Workspaces](reference/cookbook/ai-agent-workspace.md)
- [Chat Room](reference/cookbook/chat-room.md)
- [Collaborative Text Editor](reference/cookbook/collaborative-text-editor.md)
- [Cron Jobs and Scheduled Tasks](reference/cookbook/cron-jobs.md)
- [Database per Tenant](reference/cookbook/per-tenant-database.md)
- [Deploying Rivet in a VPC or Air-Gapped Network](reference/cookbook/vpc-air-gapped.md)
- [Live Cursors and Presence](reference/cookbook/live-cursors.md)
- [Multiplayer Game](reference/cookbook/multiplayer-game.md)

### General

- [Actor Configuration](reference/general/actor-configuration.md)
- [Architecture](reference/general/architecture.md)
- [Cross-Origin Resource Sharing](reference/general/cors.md)
- [Documentation for LLMs & AI](reference/general/docs-for-llms.md)
- [Edge Networking](reference/general/edge.md)
- [Endpoints](reference/general/endpoints.md)
- [Environment Variables](reference/general/environment-variables.md)
- [HTTP Server](reference/general/http-server.md)
- [Logging](reference/general/logging.md)
- [Pool Configuration](reference/general/pool-configuration.md)
- [Production Checklist](reference/general/production-checklist.md)
- [Registry Configuration](reference/general/registry-configuration.md)
- [Runtime Modes](reference/general/runtime-modes.md)

### Self Hosting

- [Configuration](reference/self-hosting/configuration.md)
- [Docker Compose](reference/self-hosting/docker-compose.md)
- [Docker Container](reference/self-hosting/docker-container.md)
- [File System](reference/self-hosting/filesystem.md)
- [FoundationDB (Enterprise)](reference/self-hosting/foundationdb.md)
- [Installing Rivet Engine](reference/self-hosting/install.md)
- [Kubernetes](reference/self-hosting/kubernetes.md)
- [Multi-Region](reference/self-hosting/multi-region.md)
- [PostgreSQL](reference/self-hosting/postgres.md)
- [Production Checklist](reference/self-hosting/production-checklist.md)
- [Railway Deployment](reference/self-hosting/railway.md)
- [Render Deployment](reference/self-hosting/render.md)
- [TLS & Certificates](reference/self-hosting/tls.md)

