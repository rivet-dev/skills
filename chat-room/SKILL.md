---
name: "chat-room"
description: "Build a realtime chat room backend with Rivet Actors: one actor per room, SQLite-backed message history, and WebSocket broadcast to every connected client."
---

# Chat Room

**IMPORTANT: Before doing anything, you MUST read `BASE_SKILL.md` in this skill's directory. It contains essential guidance on debugging, error handling, state management, deployment, and project setup. Those rules and patterns apply to all RivetKit work. Everything below assumes you have already read and understood it.**

## Working Examples

If you need a reference implementation, read the raw working example code in these templates:

- [chat-room](https://github.com/rivet-dev/rivet/tree/main/examples/chat-room)


Patterns for building a chat room backend with RivetKit: room-scoped actors, persistent message history, and realtime delivery over WebSocket connections.

## Starter Code

Start with the working example on [GitHub](https://github.com/rivet-dev/rivet/tree/main/examples/chat-room) and adapt it. The backend is a single `chatRoom` actor; the frontend is a React app using `@rivetkit/react` (see the [React quickstart](/docs/actors/quickstart/react)).

| Topic | Summary |
| --- | --- |
| Room model | One `chatRoom` actor per room key. The frontend defaults the key to `general`; typing a different room name connects to a different actor. |
| History | SQLite `messages` table created in `db({ onMigrate })`, read back with `ORDER BY id ASC`. |
| Delivery | `sendMessage` inserts the row, then broadcasts a typed `newMessage` event to every connected client. |
| Identity | None in the example. `sender` is a plain action argument; production should bind identity to the connection. |

## Room-Per-Actor Model

Each room is one Rivet Actor instance, addressed by [key](/docs/actors/keys). The client calls `useActor({ name: "chatRoom", key: [roomId] })`, which gets-or-creates the actor for that room. This gives you:

- **Isolation**: each room's history and connections are fully scoped to its key. Switching the room input re-keys the hook and connects to a different actor with separate history.
- **A single serialized writer**: all `sendMessage` calls for one room run through one actor, so message ordering is consistent without locks. The SQLite `AUTOINCREMENT` id is the canonical order, which is why `getHistory` sorts by `id` rather than by timestamp.
- **Natural scaling**: rooms spread across the cluster independently. A hot room does not slow down other rooms.

## Message History Storage

This example stores history in the actor's SQLite database, not in JSON state. Pick based on history size and query needs:

| Approach | Use When | Implementation Guidance |
| --- | --- | --- |
| [SQLite](/docs/actors/sqlite) (what this example uses) | Large or long-lived history that needs ordering, caps, pagination, or search | Create the `messages` table in `db({ onMigrate })`, insert with parameterized queries (`c.db.execute("INSERT ... VALUES (?, ?, ?)", ...)`), and read with `ORDER BY id ASC`. History survives actor sleep and scales past what you want in memory. |
| [JSON state](/docs/actors/state) | Small recent history, for example the last 50 to 100 messages | Push onto a `messages` array in actor state and trim to a cap on every send. Simplest option, but the whole history lives in memory and there is no query layer, so it only fits bounded recent-history use cases. |

## Broadcast Delivery

New messages reach connected clients through a typed [event](/docs/actors/events):

- The actor declares `events: { newMessage: event() }`, where `Message` is `{ sender, text, timestamp }`.
- The `sendMessage` [action](/docs/actors/actions) builds the message with a server-side `Date.now()` timestamp, inserts it into the `messages` table, then calls `c.broadcast("newMessage", message)` and returns the message to the caller.
- Each client subscribes with `useEvent("newMessage", ...)` and appends to its local list. The sender renders its own message through the same broadcast path as everyone else, so all clients stay on one code path.
- History load is connection-gated: once the connection is ready, the client calls `getHistory()` once to render the backlog, then relies on events for everything after.

Use `c.broadcast(...)` for room-wide messages. For private or per-recipient payloads (such as DMs inside a room), send on the individual connection instead, which is a recommended extension beyond this example.

## Typing Indicators And Presence (Extension)

The example does not implement typing indicators, presence, or join/leave handling of any kind. There is no `createConnState`, `onConnect`, or `onDisconnect` in the code. If you need them, add them as ephemeral [connection](/docs/actors/connections) behavior:

- **Keep it ephemeral**: store the username and typing flag in per-connection state, never in SQLite or persisted actor state. Presence is derived from live connections and should disappear with them.
- **Broadcast on change only**: emit a typing event when a user starts or stops typing, and a presence event from `onConnect` / `onDisconnect`, rather than polling or ticking.
- **Expire on the client**: clear a typing indicator after a short client-side timeout so a dropped connection never leaves a stuck "is typing" row.

## Per-User Inbox (Extension)

For offline delivery, DMs, unread counts, or notification fanout, add a `userInbox[userId]` actor per user. This is an extension beyond the example:

- The room actor forwards each message to the inbox actor of every member via [actor-to-actor calls](/docs/actors/communicating-between-actors), so users who are not connected to the room still accumulate messages.
- The inbox actor owns per-user unread state and serves it when the user comes online, independent of which rooms they are in.
- DMs become a degenerate room: either a `chatRoom` keyed by the sorted pair of user ids, or direct inbox-to-inbox delivery if you do not need shared history semantics.

## Actors

- **Key**: `chatRoom[roomId]`
- **Responsibility**: Owns one chat room. Persists the room's message history in its SQLite database and broadcasts each new message to every connected client.
- **Actions**
  - `sendMessage`
  - `getHistory`
- **Queues**
  - None
- **Events**
  - `newMessage`
- **State**
  - SQLite
  - `messages` table: `id` (autoincrement primary key), `sender`, `text`, `timestamp`

## Lifecycle

```mermaid
sequenceDiagram
	participant A as Client A
	participant B as Client B
	participant R as chatRoom

	A->>R: connect with key [roomId]
	Note over R: every start runs onMigrate (CREATE TABLE IF NOT EXISTS messages)
	A->>R: getHistory()
	R-->>A: Message[] ordered by id
	B->>R: connect with key [roomId]
	B->>R: getHistory()
	R-->>B: Message[] ordered by id
	A->>R: sendMessage(sender, text)
	Note over R: INSERT row with server timestamp
	R-->>A: newMessage (broadcast)
	R-->>B: newMessage (broadcast)
	A->>R: disconnect
	Note over R: history stays in SQLite for the next connection
```

## Security Checklist

The example is intentionally minimal and skips all of the following. Add them before production:

- **Auth before join**: any client can join any room by knowing its name, and `sender` is arbitrary client input on every call. Validate a token during [connection auth](/docs/actors/authentication), bind identity to [connection state](/docs/actors/connections), and check room membership before serving history. Never trust a sender name passed as an action argument.
- **Message length clamps**: the example accepts empty messages and has no length limit. Trim server-side, reject empty text, and clamp to a maximum length.
- **Per-connection rate limiting**: rate limit `sendMessage` per connection to stop spam and broadcast amplification.
- **Server-side timestamps and ids**: the example already does this correctly. `timestamp` comes from `Date.now()` inside the action and `id` from SQLite `AUTOINCREMENT`. Keep it that way; never accept client-supplied timestamps or ids.
- **History caps**: `getHistory` returns every row with no limit. Add a `LIMIT` plus pagination, and prune or archive old rows so a long-lived room cannot grow unbounded.
- **Parameterized queries**: the example already inserts with `?` placeholders. Keep all user-supplied text out of SQL string interpolation.

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

