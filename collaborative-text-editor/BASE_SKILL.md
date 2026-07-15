---
name: "rivetkit"
description: "RivetKit backend and Rivet Actor runtime guidance. Use for building, modifying, debugging, or testing Rivet Actors, registries, serverless/runner modes, deployment, or actor-based workflows."
---

# Rivet Actors

Build high-performance, long-lived, in-memory processes on Rivet's actor runtime. Use this skill whenever HTTP endpoints, databases, or queues no longer meet the requirements for AI agents, realtime collaboration, workflow orchestration, or geo-distributed data.

## What To Do If You Get Stuck

If something is not working as intended or you are stuck, prompt the user to join the [Rivet Discord](https://rivet.dev/discord) or file an issue on the [Rivet GitHub](https://github.com/rivet-dev/rivet) to report an issue and get help.

Provide the user with a pre-generated report with:

- Symptoms
    - If this is happening in local dev, deployed, or both
    - The error you're seeing
    - Relevant source code related to this
- What you've tried to solve it
- Environment
    - RivetKit version
    - Runtime (Node, Bun, etc) including version
    - If applicable, provider in use (e.g. Vercel, Railway, etc)
    - If applicable, HTTP router in use (e.g. Hono, Express, Elysia)

## Debugging Actors

Use the inspector HTTP API to examine running actors. These endpoints are accessible through the gateway at `/gateway/{actor_id}/inspector/*`. Key endpoints:

- `GET /inspector/summary` - full actor snapshot (state, connections, RPCs, queue)
- `GET /inspector/state` / `PATCH /inspector/state` - read/write actor state
- `GET /inspector/connections` - active connections
- `GET /inspector/rpcs` - available actions
- `POST /inspector/action/{name}` - execute an action with `{"args": [...]}`
- `POST /inspector/database/execute` - run SQL with `{"sql": "...", "args": [...]}` or `{"sql": "...", "properties": {...}}` for reads or mutations
- `GET /inspector/queue?limit=50` - queue status
- `GET /inspector/traces?startMs=0&endMs=...&limit=1000` - trace spans (OTLP JSON)
- `GET /inspector/workflow-history` - workflow history and status as JSON (`nameRegistry`, `entries`, `entryMetadata`)
- `POST /inspector/workflow/replay` - replay a workflow from a specific step or from the beginning; returns `409 actor/workflow_in_flight` if the workflow is still running
- `GET /inspector/database/schema` - SQLite tables and views exposed by `c.db`
- `GET /inspector/database/rows?table=...&limit=100&offset=0` - paged SQLite rows for a table or view

In local dev, no auth token is needed. In production, pass `Authorization: Bearer <inspector-token>`, where the inspector token is the actor-specific token auto-generated on first start and persisted in the actor's internal KV at key `0x03`. The Rivet dashboard retrieves this token automatically; for direct API access, fetch it through the management KV endpoint. See the [debugging docs](https://rivet.dev/docs/actors/debugging) for details.

## Citing Sources

When providing information from Rivet documentation, cite the canonical URL so users can learn more. Each reference file includes its canonical URL in the header metadata.

**How to cite:**

- Use inline links for key concepts: "Use [actor keys](https://rivet.dev/docs/actors/keys) to uniquely identify instances."
- Add a "Learn more" link after explanations for complex topics

**Finding canonical URLs:**

The Reference Map below links to reference files. Each file's header contains:

```
> Canonical URL: https://rivet.dev/docs/actors/actions
```

Use that canonical URL when citing, not the reference file path.

**Examples:**

- Actions → `https://rivet.dev/docs/actors/actions`
- React client → `https://rivet.dev/docs/clients/react`
- Self-hosting on Kubernetes → `https://rivet.dev/docs/self-hosting/kubernetes`

## Version Check

Before starting any work, check if the user's project is on the latest version of RivetKit (latest: 2.3.4). Look at the `rivetkit` version in the user's `package.json` (check both `dependencies` and `devDependencies`). If the installed version is older than 2.3.4, inform the user and suggest upgrading:

```bash
npm install rivetkit@2.3.4
```

If the user also uses `@rivetkit/react`, `@rivetkit/next-js`, or other `@rivetkit/*` client packages, suggest upgrading those too. Outdated versions may have known bugs or missing features that cause issues.

## First Steps

1. Install RivetKit (latest: 2.3.4)
    ```bash
    npm install rivetkit@2.3.4
    ```
2. Define a registry with `setup({ use: { /* actors */ } })`.
3. Call `registry.start()` to start the server. For custom HTTP server integration, use `registry.handler()` with a router like Hono. For serverless deployments, use `registry.serve()`. For runner-only mode, use `registry.startEnvoy()`.
4. Verify `/api/rivet/metadata` returns 200 before deploying.
5. Configure Rivet Cloud or self-hosted engine
    - You must configure versioning for production builds. This is not needed for local development. See [Versions & Upgrades](https://rivet.dev/docs/actors/versions).
6. Integrate clients (see client guides below for JavaScript, React, or Swift)
7. Prompt the user if they want to deploy. If so, go to Deploying Rivet Backends.

For more information, read the quickstart guide relevant to the user's project.

## Project Setup

### .gitignore

Every RivetKit project should have a `.gitignore`. Include at minimum:

```
node_modules/
dist/
.env
```

### .dockerignore

Every project with a Dockerfile should have a `.dockerignore` to keep the image small and avoid leaking secrets:

```
node_modules/
dist/
.env
.git/
```

### Dockerfile

Use this as a base Dockerfile for deploying a RivetKit project. The `RIVET_RUNNER_VERSION` build arg is only needed when self-hosting or using a custom runner (not needed for Rivet Compute). It lets Rivet track which version of the actor is running and drain old actors on deploy. See https://rivet.dev/docs/actors/versions for details.

```dockerfile
FROM node:24-alpine

ARG RIVET_RUNNER_VERSION
ENV RIVET_RUNNER_VERSION=$RIVET_RUNNER_VERSION

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build --if-present

CMD ["node", "dist/index.js"]
```

Build with:

```bash
docker build --build-arg RIVET_RUNNER_VERSION=$(date +%s) .
```

Adjust the `CMD` to match the project's entry point. If the project uses a different output directory or start command, update accordingly.

## Error Handling Policy

- Prefer fail-fast behavior by default.
- Avoid `try/catch` unless it is required for a real recovery path, cleanup boundary, or to add actionable context.
- Never swallow errors. If you add a `catch`, you must handle the error explicitly, at minimum by logging it.
- When you cannot recover, log context and rethrow.

## State vs Vars: Persistence Rules

**`c.vars` is ephemeral.** Data in `c.vars` is lost on every restart, crash, upgrade, or sleep/wake cycle. Only use `c.vars` for non-serializable objects (e.g., physics engines, WebSocket references, event emitters, caches) or truly transient runtime data (e.g., current input direction that doesn't matter after disconnect).

**Persistent storage options.** Any data that must survive restarts belongs in one of these, NOT in `c.vars`:

- **`c.state`** — CBOR-serializable data for small, bounded datasets. Ideal for configuration, counters, small player lists, phase flags, etc. Keep under 128 KB. Do not store unbounded or growing data here (e.g., chat logs, event histories, spawned entity lists that grow without limit). State is read/written as a single blob on every persistence cycle.
- **`c.kv`** — Key-value store for unbounded data. This is what `c.state` uses under the hood. Supports binary values. Use for larger or variable-size data like user inventories, world chunks, file blobs, or any collection that may grow over time. Keys are scoped to the actor instance.
- **`c.db`** — SQLite database for structured or complex data. Use when you need queries, indexes, joins, aggregations, or relational modeling. Ideal for leaderboards, match histories, player pools, or any data that benefits from SQL.

**Common mistake:** Storing meaningful game/application data in `c.vars` instead of persisting it. For example, if users can spawn objects in a physics simulation, the spawn definitions (position, size, type) must be persisted in `c.state` (or `c.kv` if unbounded), even though the physics engine handles (non-serializable) live in `c.vars`. On restart, `run()` should recreate the runtime objects from the persisted data.

## Deploying Rivet Backends

Assume the user is deploying to Rivet Cloud, unless otherwise specified. If user is self-hosting, read the self-hosting guides below.

1. Verify that Rivet Actors are working in local dev
2. Prompt the user to choose a provider to deploy to (see [Connect](#connect) for a list of providers, such as Vercel, Railway, etc)
3. Follow the deploy guide for that given provider. You will need to instruct the user when you need manual intervention.

## API Reference

The RivetKit OpenAPI specification is available in the skill directory at `openapi.json`. This file documents all HTTP endpoints for managing actors.

## Misc Notes

- The Rivet domain is rivet.dev, not rivet.gg

## TypeScript Caveat: Actor Client Inference

- In multi-file TypeScript projects, bidirectional actor calls can create a circular type dependency when both actors use `c.client<typeof registry>()`.
- Symptoms usually include `c.state` becoming `unknown`, actor methods becoming possibly `undefined`, or `TS2322` / `TS2722` errors after the first cross-actor call.
- If an action returns the result of another actor call, prefer an explicit return type annotation on that action instead of relying on inference through `c.client<typeof registry>()`.
- If explicit return types are not enough, use a narrower client or registry type for only the actors that action needs.
- As a last resort, pass `unknown` for the registry type and be explicit that this gives up type safety at that call site.

## Features

- **Long-Lived, Stateful Compute**: Each unit of compute is like a tiny server that remembers things between requests – no need to re-fetch data from a database or worry about timeouts. Like AWS Lambda, but with memory and no timeouts.
- **Blazing-Fast Reads & Writes**: State is stored on the same machine as your compute, so reads and writes are ultra-fast. No database round trips, no latency spikes. State is persisted to Rivet for long term storage, so it survives server restarts.
- **Realtime**: Update state and broadcast changes in realtime with WebSockets. No external pub/sub systems, no polling – just built-in low-latency events.
- **Infinitely Scalable**: Automatically scale from zero to millions of concurrent actors. Pay only for what you use with instant scaling and no cold starts.
- **Fault Tolerant**: Built-in error handling and recovery. Actors automatically restart on failure while preserving state integrity and continuing operations.

## When to Use Rivet Actors

- **AI agents & sandboxes**: multi-step toolchains, conversation memory, sandbox orchestration.
- **Multiplayer or collaborative apps**: CRDT docs, shared cursors, realtime dashboards, chat.
- **Workflow automation**: background jobs, cron, rate limiters, durable queues, backpressure control.
- **Data-intensive backends**: geo-distributed or per-tenant databases, in-memory caches, sharded SQL.
- **Networking workloads**: WebSocket servers, custom protocols, local-first sync, edge fanout.

## Minimal Project

### Backend

**index.ts**

### Client Docs

Use the client SDK that matches your app:

- [JavaScript Client](/docs/clients/javascript)
- [React Client](/docs/clients/react)
- [Swift Client](/docs/clients/swift)

## Actor Quick Reference

### In-Memory State

Persistent data that survives restarts, crashes, and deployments. State is persisted on Rivet Cloud or Rivet self-hosted, so it survives restarts if the current process crashes or exits.

### Static Initial State

### Dynamic Initial State

[Documentation](/docs/actors/state)

### Keys

Keys uniquely identify actor instances. Use compound keys (arrays) for hierarchical addressing:

Don't build keys with string interpolation like `"org:${userId}"` when `userId` contains user data. Use arrays instead to prevent key injection attacks.

[Documentation](/docs/actors/keys)

### Input

Pass initialization data when creating actors. Input is only available in `createState` and `onCreate`, so store it in state if you need it later.

[Documentation](/docs/actors/input)

### Temporary Variables

Temporary data that doesn't survive restarts. Use for non-serializable objects (event emitters, connections, etc).

### Static Initial Vars

### Dynamic Initial Vars

[Documentation](/docs/actors/state)

### Actions

Actions are the primary way clients and other actors communicate with an actor.

[Documentation](/docs/actors/actions)

### Events & Broadcasts

Events enable real-time communication from actors to connected clients.

[Documentation](/docs/actors/events)

### Connections

Access the current connection via `c.conn` or all connected clients via `c.conns`. Use `c.conn.id` or `c.conn.state` to securely identify who is calling an action. `c.conn` is only available for actions invoked through a connected client; stateless actor-handle calls run without a connection, so guard against that. Connection state is initialized via `connState` or `createConnState`, which receives parameters passed by the client on connect.

### Static Connection Initial State

### Dynamic Connection Initial State

[Documentation](/docs/actors/connections)

### Queues

Use queues to process durable messages in order inside a `run` loop.

[Documentation](/docs/actors/queues)

### Workflows

Use workflows when your `run` logic needs durable, replayable multi-step execution.

[Documentation](/docs/actors/workflows)

### Actor-to-Actor Communication

Actors can call other actors using `c.client()`.

[Documentation](/docs/actors/communicating-between-actors)

### Scheduling

Schedule actions to run after a delay or at a specific time. Schedules persist across restarts, upgrades, and crashes.

[Documentation](/docs/actors/schedule)

### Destroying Actors

Permanently delete an actor and its state using `c.destroy()`.

[Documentation](/docs/actors/destroy)

### Lifecycle Hooks

Actors support hooks for initialization, background processing, connections, networking, and state changes. Use `run` for long-lived background loops, and use `c.aborted` or `c.abortSignal` for graceful shutdown.

[Documentation](/docs/actors/lifecycle)

### Context Types

When writing helper functions outside the actor definition, use `*ContextOf<typeof myActor>` to extract the correct context type. Helpers like `ActionContextOf`, `CreateContextOf`, `ConnContextOf`, and `ConnInitContextOf` are exported from `"rivetkit"`. Do not manually define your own context interface. Always derive it from the actor definition.

[Documentation](/docs/actors/types)

### Errors

Use `UserError` to throw errors that are safely returned to clients. Pass `metadata` to include structured data. Other errors are converted to generic "internal error" for security.

### Actor

### Client

[Documentation](/docs/actors/errors)

### Low-Level HTTP & WebSocket Handlers

For custom protocols or integrating libraries that need direct access to HTTP `Request`/`Response` or WebSocket connections, use `onRequest` and `onWebSocket`.

[HTTP Handler Documentation](/docs/actors/request-handler) · [WebSocket Handler Documentation](/docs/actors/websocket-handler)

### Icons & Names

Customize how actors appear in the UI with display names and icons. It's recommended to always provide a name and icon to actors in order to make them easier to distinguish in the dashboard.

```typescript
import { actor } from "rivetkit";

const chatRoom = actor({
	options: {
		name: "Chat Room",
		icon: "💬", // or FontAwesome: "comments", "chart-line", etc.
	},
	// ...
});
```

[Documentation](/docs/actors/appearance)

## Client Documentation

Find the full client guides here:

- [JavaScript Client](/docs/clients/javascript)
- [React Client](/docs/clients/react)
- [Swift Client](/docs/clients/swift)

## Common Patterns

Actors scale naturally through isolated state and message-passing. Structure your applications with these patterns:

[Documentation](/docs/actors/design-patterns)

### Actor Per Entity

Create one actor per user, document, or room. Use compound keys to scope entities:

### Coordinator & Data Actors

**Data actors** handle core logic (chat rooms, game sessions, user data). **Coordinator actors** track and manage collections of data actors—think of them as an index.

### Run Loop

Use a `run` loop for continuous background work inside an actor. Process queue messages in order, run logic on intervals, stream AI responses, or coordinate long-running tasks.

### Workflow Loop

Use this pattern for long-lived, durable workflows that initialize resources, process commands in a loop, then clean up.

[Documentation](/docs/actors/workflows)

### Actions vs Queues

- **Actions** are not durable. Use them for realtime reads, ephemeral data, and low-latency communication like player input.
- **Queues** are durable. Use them to serialize mutations through the run loop, avoiding race conditions with SQLite and other local state. Callers can still wait for a response from queued work.

### Authentication, Security, & CORS

- Validate credentials in `onBeforeConnect` or `createConnState` and throw an error to reject unauthorized connections.
- Use `c.conn.state` to securely identify users in actions rather than trusting action parameters.
- For cross-origin access, validate the request origin in `onBeforeConnect`.

[Authentication Documentation](/docs/actors/authentication) · [CORS Documentation](/docs/general/cors)

### Versions & Upgrades

When deploying new code, set a version number so Rivet can route new actors to the latest runner and optionally drain old ones. Use a build timestamp, git commit count, or CI build number as the version. It is very important to [configure versioning](/docs/actors/versions) before deploying to production. Without versioning, actors can regress by running on older runner versions, and existing actors will never be forced to migrate to new runners. They will continue running indefinitely on the old runners until they exit.

[Documentation](/docs/actors/versions)

### Anti-Patterns

#### Never build a "god" actor

Do not put all your logic in a single actor. A god actor serializes every operation through one bottleneck, kills parallelism, and makes the entire system fail as a unit. Split into focused actors per entity.

#### Never create an actor per request

Actors are long-lived and maintain state across requests. Creating a new actor for every incoming request throws away the core benefit of the model and wastes resources on actor creation and teardown. Use actors for persistent entities and regular functions for stateless work.

## Reference Map

### Actors

- [Access Control](reference/actors/access-control.md)
- [Actions](reference/actors/actions.md)
- [Actor Keys](reference/actors/keys.md)
- [Actor Scheduling](reference/actors/schedule.md)
- [Actor Statuses](reference/actors/statuses.md)
- [Authentication](reference/actors/authentication.md)
- [Cloudflare Workers Quickstart](reference/actors/quickstart/cloudflare.md)
- [Communicating Between Actors](reference/actors/communicating-between-actors.md)
- [Connections](reference/actors/connections.md)
- [Custom Inspector Tabs](reference/actors/inspector-tabs.md)
- [Debugging](reference/actors/debugging.md)
- [Design Patterns](reference/actors/design-patterns.md)
- [Destroying Actors](reference/actors/destroy.md)
- [Effect.ts Quickstart (Beta)](reference/actors/quickstart/effect.md)
- [Errors](reference/actors/errors.md)
- [Fetch and WebSocket Handler](reference/actors/fetch-and-websocket-handler.md)
- [Helper Types](reference/actors/helper-types.md)
- [Icons & Names](reference/actors/appearance.md)
- [In-Memory State](reference/actors/state.md)
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
- [Rust Quickstart (Beta)](reference/actors/quickstart/rust.md)
- [Scaling & Concurrency](reference/actors/scaling.md)
- [Sharing and Joining State](reference/actors/sharing-and-joining-state.md)
- [SQLite](reference/actors/sqlite.md)
- [SQLite + Drizzle](reference/actors/sqlite-drizzle.md)
- [Supabase Functions Quickstart](reference/actors/quickstart/supabase.md)
- [Testing](reference/actors/testing.md)
- [Troubleshooting](reference/actors/troubleshooting.md)
- [Types](reference/actors/types.md)
- [Vanilla HTTP API](reference/actors/http-api.md)
- [Versions & Upgrades](reference/actors/versions.md)
- [Workflows](reference/actors/workflows.md)

### Cli

- [CLI](reference/cli.md)

### Clients

- [Node.js & Bun](reference/clients/javascript.md)
- [React](reference/clients/react.md)
- [Rust (Beta)](reference/clients/rust.md)
- [Swift](reference/clients/swift.md)
- [SwiftUI](reference/clients/swiftui.md)

### Cookbook

- [AI Agent](reference/cookbook/ai-agent.md)
- [Chat Room](reference/cookbook/chat-room.md)
- [Collaborative Text Editor](reference/cookbook/collaborative-text-editor.md)
- [Cron Jobs and Scheduled Tasks](reference/cookbook/cron-jobs.md)
- [Database per Tenant](reference/cookbook/per-tenant-database.md)
- [Deploying Rivet in a VPC or Air-Gapped Network](reference/cookbook/vpc-air-gapped.md)
- [Live Cursors and Presence](reference/cookbook/live-cursors.md)
- [Multiplayer Game](reference/cookbook/multiplayer-game.md)

### Deploy

- [Container Runner](reference/deploy/container-runner.md)
- [Deploy To Amazon Web Services Lambda](reference/deploy/aws-lambda.md)
- [Deploying to AWS ECS](reference/deploy/aws-ecs.md)
- [Deploying to Cloudflare Workers](reference/deploy/cloudflare.md)
- [Deploying to Freestyle](reference/deploy/freestyle.md)
- [Deploying to Google Cloud Run](reference/deploy/gcp-cloud-run.md)
- [Deploying to Hetzner](reference/deploy/hetzner.md)
- [Deploying to Kubernetes](reference/deploy/kubernetes.md)
- [Deploying to Railway](reference/deploy/railway.md)
- [Deploying to Rivet Compute](reference/deploy/rivet-compute.md)
- [Deploying to Supabase Functions](reference/deploy/supabase.md)
- [Deploying to Vercel](reference/deploy/vercel.md)
- [Deploying to VMs & Bare Metal](reference/deploy/vm-and-bare-metal.md)

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
- [WASM vs Native SDK](reference/general/wasm-vs-native-sdk.md)

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

