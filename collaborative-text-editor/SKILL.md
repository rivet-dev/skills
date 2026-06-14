---
name: "collaborative-text-editor"
description: "Build a collaborative text editor backend with Yjs CRDTs and Rivet Actors: per-document actors relay sync and awareness updates and persist snapshots."
---

# Collaborative Text Editor

**IMPORTANT: Before doing anything, you MUST read `BASE_SKILL.md` in this skill's directory. It contains essential guidance on debugging, error handling, state management, deployment, and project setup. Those rules and patterns apply to all RivetKit work. Everything below assumes you have already read and understood it.**

## Working Examples

If you need a reference implementation, read the raw working example code in these templates:

- [collaborative-document](https://github.com/rivet-dev/rivet/tree/main/examples/collaborative-document)


Patterns for building a Yjs server on RivetKit: CRDT document sync, presence and cursors, and snapshot persistence, with one Rivet Actor per document acting as a relay.

## Starter Code

Start with the working example on [GitHub](https://github.com/rivet-dev/rivet/tree/main/examples/collaborative-document) and adapt it to your editor. It ships a React frontend with a plain textarea, remote cursor overlays, and a workspace document index.

| Use Case | Starter Code | Common Examples |
| --- | --- | --- |
| Shared document editing | [GitHub](https://github.com/rivet-dev/rivet/tree/main/examples/collaborative-document) | Notion-style docs, shared notes, pair-writing tools, form co-editing |

## CRDT vs OT

Two families of algorithms solve concurrent text editing. The choice decides what your server has to do.

| Dimension | CRDT (Yjs) | Operational Transformation |
| --- | --- | --- |
| Conflict resolution model | Commutative merges. Updates apply in any order on any peer and converge to the same result. | Server transforms each operation against every concurrent operation. Correctness depends on a central sequencer. |
| Offline support | Strong. Clients keep editing locally and merge buffered updates on reconnect. | Weak. Long-lived divergence makes transformation chains complex and fragile. |
| Server role | Relay plus persistence. The server applies opaque updates and rebroadcasts them. It never needs to understand document semantics. | Authoritative transformer. The server must implement transformation logic for every operation type. |
| Library maturity | Yjs is mature and widely deployed, with bindings for ProseMirror, CodeMirror, Monaco, and others. | Production-grade implementations are mostly proprietary (Google Docs) or aging (ShareDB). |

The example uses Yjs because CRDTs let the server stay a relay-style Rivet Actor. The actor applies each incoming update to a server-side `Y.Doc` so it can persist the merged state and serve late joiners, but it never transforms operations or arbitrates conflicts. Ordering does not matter because Yjs merges are commutative.

## Document Actor Model

| Topic | Summary |
| --- | --- |
| Topology | One `document[workspaceId, documentId]` actor per document plus one `documentList[workspaceId]` coordinator per workspace. |
| Sync model | Each client holds a local `Y.Doc`. The document actor relays incremental Yjs updates as broadcast [events](/docs/actors/events) and keeps a server-side merged copy in vars. |
| Persistence | Full merged Yjs snapshot overwritten in one binary [actor KV](/docs/actors/kv) key (`yjs:doc`) on every sync update. Document metadata lives in JSON [state](/docs/actors/state). |
| Queues | None. The example is purely [actions](/docs/actors/actions) plus broadcast events. |
| Presence | Yjs Awareness relayed through the same `applyUpdate` action. Per-connection `connState` tracks asserted awareness clientIds for disconnect cleanup. |

The two-actor split follows the coordinator pattern from [Design Patterns](/docs/actors/design-patterns): the coordinator owns discovery and creation, and each document actor owns one document's realtime state. Multi-part [keys](/docs/actors/keys) scope both actors to a workspace.

**Actors**

- **Key**: `document[workspaceId, documentId]`
- **Responsibility**: Applies incoming sync and awareness updates to a server-side `Y.Doc` and `Awareness`, persists the merged Yjs snapshot to actor KV, and broadcasts updates to all connected collaborators.
- **Actions**
  - `getContent`
  - `applyUpdate`
  - `getAwareness`
- **Queues**
  - None
- **State**
  - JSON metadata only: `title`, `createdAt`, `updatedAt`
  - Binary KV key `yjs:doc` holding the full merged Yjs snapshot
  - Ephemeral vars: the live `Y.Doc` and `Awareness`, created in `createVars` and rehydrated from KV on actor start
  - Per-connection `connState`: `clientIds` of awareness clients asserted by that connection

- **Key**: `documentList[workspaceId]`
- **Responsibility**: Coordinator for one workspace. Creates document actors through the actor-to-actor client and maintains the index of document summaries.
- **Actions**
  - `createDocument`
  - `listDocuments`
  - `deleteDocument`
- **Queues**
  - None
- **State**
  - JSON
  - `documents` array of `DocumentSummary` entries (`id`, `title`, `createdAt`, `updatedAt`)

The coordinator's `createDocument` generates a UUID, then explicitly creates the document actor with `c.client<typeof registry>()` and passes `{ title, createdAt }` as creation [input](/docs/actors/input), which the document actor's `createState` consumes. See [Communicating Between Actors](/docs/actors/communicating-between-actors) for the actor-to-actor client.

## Update Relay

A single `applyUpdate(update, kind, clientId?)` action handles both update kinds. Updates cross the action boundary as `number[]` byte arrays and are converted back to `Uint8Array` on each side.

| Kind | Server Applies To | Persists | Broadcasts |
| --- | --- | --- | --- |
| `"sync"` | `c.vars.doc` via `Y.applyUpdate` with origin `"client"` | Full merged snapshot to KV key `yjs:doc`, then bumps `updatedAt` | `sync` event carrying the incremental update |
| `"awareness"` | `c.vars.awareness` via `applyAwarenessUpdate` with origin `"client"` | Nothing. Presence is ephemeral. | `awareness` event carrying the update |

Note the asymmetry on the sync branch: the broadcast carries only the small incremental update, while the KV write stores the full merged document re-encoded with `Y.encodeStateAsUpdate`.

Yjs origin tags are the echo guards that keep the relay loop-free:

| Origin Tag | Set Where | Effect |
| --- | --- | --- |
| `"local"` | Client edits inside `doc.transact(..., "local")` | The client's update listener fires and sends `applyUpdate` to the actor. |
| `"client"` | Server applying an incoming update to its `Y.Doc` or `Awareness` | Marks the change as client-originated on the server copy. |
| `"remote"` | Client applying broadcast events or initial sync data | Update listeners early-return on `"remote"`, so a client never re-sends its own echo. |

On connect or reconnect, the client calls `getContent` and `getAwareness`, then applies both results to its local `Y.Doc` and `Awareness` with origin `"remote"`. After that, every change flows through `applyUpdate` and the broadcast events.

## Awareness And Presence

Presence (user names, colors, cursor positions) rides on the Yjs Awareness protocol instead of actor state:

- Clients set presence with `awareness.setLocalStateField` for the `user` and `cursor` fields. The awareness update listener encodes the change and sends `applyUpdate(update, "awareness", awareness.clientID)`.
- The actor records each asserted `clientId` in that connection's `connState.clientIds`, applies the update to the server-side `Awareness`, and broadcasts the `awareness` event to all peers. See [Connections](/docs/actors/connections) for per-connection state.
- `onDisconnect` reads the connection's `clientIds`, calls `removeAwarenessStates` on the server-side `Awareness`, and broadcasts the encoded removal so every remaining client drops the departed user's cursor. See [Lifecycle](/docs/actors/lifecycle) for the hook.

Because the actor tracks which awareness clientIds belong to which connection, presence cleanup is automatic on disconnect with no client cooperation required.

## Persistence And Compaction

The example persists with a full-snapshot overwrite: on every `"sync"` update, the actor re-encodes the entire merged document with `Y.encodeStateAsUpdate` and overwrites the single binary KV key `yjs:doc`. There is no append-only update log and no separate compaction job. Compaction is implicit because `Y.encodeStateAsUpdate` emits one compact merged representation of the document, so Yjs merge semantics keep the stored blob compact on their own.

| Property | Full-Snapshot Overwrite (the example) |
| --- | --- |
| Write cost | One full-document KV write per sync update, so every keystroke rewrites the whole blob. |
| Read cost | One binary KV read in `createVars` rehydrates the document on actor start. |
| Crash safety | The last completed `applyUpdate` is durable. No log replay needed. |
| Sweet spot | Small to medium documents where simplicity beats write amplification. |

**Recommended extension (not in the example)**: for large documents or very high edit rates, switch to appending incremental updates to a KV update log and writing a merged snapshot only periodically (for example every N updates). Boot becomes snapshot plus log replay, and the snapshot write becomes the explicit compaction step that truncates the log. Adopt this only when full-snapshot writes become the measured bottleneck or the blob approaches KV value size limits.

## Lifecycle

```mermaid
sequenceDiagram
	participant A as Client A
	participant B as Client B
	participant DL as documentList
	participant D as document

	A->>DL: listDocuments()
	A->>DL: createDocument(title)
	DL->>D: create([workspaceId, documentId], input)
	DL-->>A: DocumentSummary
	A->>D: connect
	B->>D: connect
	Note over D: createVars rehydrates Y.Doc from KV "yjs:doc"
	A->>D: getContent() + getAwareness()
	D-->>A: encoded doc + awareness state
	Note over A: local edit with origin "local"
	A->>D: applyUpdate(update, "sync")
	Note over D: apply with origin "client", overwrite KV snapshot
	D-->>B: sync event (incremental update)
	Note over B: apply with origin "remote", no echo
	A->>D: applyUpdate(update, "awareness", clientId)
	D-->>B: awareness event
	B-->>D: disconnect
	Note over D: onDisconnect removes B's awareness clientIds
	D-->>A: awareness event (removal)
```

## Security Checklist

The example ships with no authentication or authorization. Harden it with this baseline before production. None of these are implemented in the example.

- **Authenticate before connect**: Anyone who knows or guesses a workspace ID can connect, and because `useActor` implicitly getOrCreates, connecting with a nonexistent workspace ID silently creates a blank `documentList` coordinator. Add connection auth so unauthenticated clients never reach an actor. See [Authentication](/docs/actors/authentication).
- **Per-document access control**: Validate that the authenticated user is allowed to access the specific `[workspaceId, documentId]` key, not just any document.
- **Cap and rate limit `applyUpdate`**: Update payloads are unvalidated `number[]` arrays with no size limit, and the example client sends one action per keystroke and per cursor move with zero throttling. Enforce payload size caps and per-connection rate limits on the server, and debounce on the client.
- **Do not trust client-asserted awareness clientIds**: The `clientId` argument to `applyUpdate` is client-supplied and trusted as-is. Derive or verify presence identity from connection-scoped server state instead.
- **Destroy actors and KV on delete**: `deleteDocument` only filters the entry out of the coordinator's index. The document actor and its KV snapshot are orphaned. On delete, also destroy the document actor and its storage, with a permission check on who may delete.

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

