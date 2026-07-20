---
name: "cron-jobs"
description: "Patterns for durable one-shot, calendar, and fixed-interval work on Rivet Actors."
---

# Cron Jobs and Scheduled Tasks

**IMPORTANT: Before doing anything, you MUST read `BASE_SKILL.md` in this skill's directory. It contains essential guidance on debugging, error handling, state management, deployment, and project setup. Those rules and patterns apply to all RivetKit work. Everything below assumes you have already read and understood it.**

## Working Examples

If you need a reference implementation, read the raw working example code in these templates:

- [scheduling](https://github.com/rivet-dev/rivet/tree/main/examples/scheduling)


Rivet Actor schedules are durable actor-local timers. They survive actor sleep, restarts, upgrades, deploys, and crashes without a separate cron service.

## Choose a schedule type

| API | Use it for |
| --- | --- |
| `c.schedule.after(delayMs, action, ...args)` | One-time work after a relative delay. |
| `c.schedule.at(timestamp, action, ...args)` | One-time work at an exact Unix timestamp in milliseconds. |
| `c.cron.set({ ... })` | Named calendar recurrence in an IANA timezone. |
| `c.cron.every({ ... })` | Named fixed intervals of at least 5 seconds. |

All callbacks are ordinary actions on the same actor. Keep the action name fixed in your code rather than accepting an arbitrary action name from a client.

See [Schedule & Cron](/docs/actors/schedule) for the full API, history, cancellation, failure behavior, and limits.

## Calendar job

Use `cron.set` instead of manually re-arming a one-shot action:

Install fixed background jobs in `onCreate` so setup runs once per actor. The job name remains an upsert key, so a later `cron.set` call updates the existing job rather than creating a duplicate. `cron.set` also handles timezone and daylight-saving transitions.

## Fixed-interval job

Use `cron.every` for frequent work such as presence sweeps or cache refreshes:

```ts
await c.cron.every({
  name: "presence-sweep",
	interval: 15_000, // Minimum 5 seconds.
  action: "sweepPresence",
  maxHistory: 25,
});
```

Intervals remain anchored to scheduled deadlines rather than drifting by the action's runtime. If a previous run is still active, the overlapping occurrence is skipped.

## Cancellation and updates

Keep the ID returned by a one-shot schedule when it may need cancellation:

```ts
const id = await c.schedule.after(60_000, "expireSession", sessionId);
await c.schedule.cancel(id);
```

Recurring jobs are managed by name:

```ts
await c.cron.delete("presence-sweep");
```

Calling `cron.set` or `cron.every` again with the same name replaces its configuration.

## Failure and idempotency

Keep scheduled actions idempotent when duplicate work would be harmful. See [Execution behavior](/docs/actors/schedule#execution-behavior) for retry behavior and workflow guidance.

## Topology

Use a singleton actor key for one global job, such as `jobs["daily-report"]`. Use an actor per user or resource for isolated reminders, trials, billing periods, or other per-entity schedules.

## Reference Map

### Actors

- [Access Control](reference/actors/access-control.md)
- [Actions](reference/actors/actions.md)
- [Actor Keys](reference/actors/keys.md)
- [Actor Runtime Socket](reference/actors/actor-runtime-socket.md)
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
- [Schedule & Cron](reference/actors/schedule.md)
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

