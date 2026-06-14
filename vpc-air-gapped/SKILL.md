---
name: "vpc-air-gapped"
description: "Run Rivet entirely inside your own perimeter: single-binary or Docker Compose install, file system storage with no database infrastructure, and no outbound telemetry by default."
---

# Deploying Rivet in a VPC or Air-Gapped Network

**IMPORTANT: Before doing anything, you MUST read `BASE_SKILL.md` in this skill's directory. It contains essential guidance on debugging, error handling, state management, deployment, and project setup. Those rules and patterns apply to all RivetKit work. Everything below assumes you have already read and understood it.**

Patterns for running self-hosted Rivet inside a private network: a VPC without internet egress, an on-premises rack, or a fully air-gapped environment. The engine is one service, the recommended single-node storage backend is the local file system, and the engine makes no outbound connections by default. Self-hosting is the only Rivet deployment model that supports air-gapped networks; see the [Self-Hosting Overview](/docs/self-hosting) for the full comparison with BYOC.

## What Runs Inside the Perimeter

A self-hosted deployment has three components, all of which live inside your network:

| Component | Role | Inside the perimeter |
| --- | --- | --- |
| Your backend | Your application server, including the runner that executes actor code | Yes |
| Rivet Engine | Orchestration service that manages actor lifecycle, routes messages, and serves the dashboard and APIs | Yes |
| Storage | Persistence for actor state. Local file system for single-node, PostgreSQL or FoundationDB for multi-node | Yes |

There is no license server, no Rivet Cloud account, and no callback to `rivet.dev`. Clients inside the perimeter reach actors through the engine's gateway over your private network. See [Architecture](/docs/self-hosting#architecture).

## Single-Binary Install

The engine compiles to a single `rivet-engine` binary. Build it from source outside the perimeter, then copy the binary across the boundary:

```bash
git clone https://github.com/rivet-dev/rivet.git
cd rivet
cargo build --release -p rivet-engine
# Copy target/release/rivet-engine into the perimeter.
```

Prebuilt binaries are coming soon; see [Installing Rivet Engine](/docs/self-hosting/install) for current options.

Run it with the file system backend, which stores everything on local disk and is the production-ready choice for single-node deployments. The [File System](/docs/self-hosting/filesystem) docs list air-gapped environments as a primary use case because it needs no database infrastructure:

```bash
RIVET__database__file_system__path="/var/lib/rivet/data" ./rivet-engine
```

Configuration can also come from files. The engine discovers config at `/etc/rivet/config.json` on Linux (JSON, JSON5, JSONC, YAML, and YML are all supported), and `--config` overrides the path. Environment variables use the `RIVET__` prefix with `__` as the separator. See [Configuration](/docs/self-hosting/configuration).

The engine serves its own dashboard on port `6420`, so inspection and namespace management work with nothing but a browser inside the perimeter.

## Docker Compose Deployment

For Docker hosts without registry access, move the engine image across the boundary the standard way:

```bash
# Outside the perimeter.
docker pull rivetdev/engine:latest
docker save rivetdev/engine:latest -o rivet-engine.tar
# Inside the perimeter.
docker load -i rivet-engine.tar
```

Then run the engine and your app together in one Compose file:

```yaml
services:
  rivet-engine:
    image: rivetdev/engine:latest
    ports:
      - "6420:6420"
    volumes:
      - rivet-data:/data
    environment:
      RIVET__FILE_SYSTEM__PATH: "/data"
    restart: unless-stopped

  my-app:
    build: .
    environment:
      RIVET_ENDPOINT: "http://default:admin@rivet-engine:6420"
    depends_on:
      - rivet-engine
    restart: unless-stopped

volumes:
  rivet-data:
```

`RIVET_ENDPOINT` uses the format `http://namespace:token@host:port` and tells your app to connect to the engine as a runner instead of running standalone. After both services start, register your runner with the engine through the dashboard or its API. The full walkthrough, including PostgreSQL setup for multi-node deployments, is in [Docker Compose](/docs/self-hosting/docker-compose).

## No Outbound Telemetry

The engine exports traces and metrics only when you opt in with OpenTelemetry. Export is disabled unless `RIVET_OTEL_ENABLED=1` is set, and the export target defaults to a local collector at `http://localhost:4317`. With no configuration, nothing crosses the perimeter.

When you want observability, keep it inside the network:

- Set `RIVET_OTEL_ENABLED=1` and point `RIVET_OTEL_GRPC_ENDPOINT` at a collector you run inside the perimeter.
- Adjust `RIVET_OTEL_SAMPLER_RATIO` to control trace sampling.
- Use the engine's health endpoint for liveness and readiness probes.

See the [Production Checklist](/docs/self-hosting/production-checklist) for monitoring guidance.

## Embedding Rivet in a Customer's Environment

If you ship software that runs inside your customers' VPCs, the same setup turns Rivet into an internal component of your product rather than a service your customers must reach over the internet:

- **Ship the engine next to your app.** Add `rivetdev/engine` to the Compose file or chart you already deliver. Your app finds it over the private network via `RIVET_ENDPOINT`, so one artifact deploys the whole stack.
- **One namespace per install.** The endpoint URL carries the namespace and token (`http://namespace:token@host:port`), so a single image works across customer deployments. See [Endpoints](/docs/general/endpoints).
- **Generate a strong admin token per install.** Replace the default token and keep it server-side. Never include the admin token in `RIVET_PUBLIC_ENDPOINT` or anywhere clients can read it.
- **Public endpoint only when needed.** `RIVET_PUBLIC_ENDPOINT` with a public (`pk_`) token is only required when browser clients connect to actors in [serverless runtime mode](/docs/general/runtime-modes). Backend-only deployments can skip it entirely.
- **TLS at the customer's edge.** Terminate TLS with the customer's reverse proxy or load balancer in front of the engine.

## Scaling Past One Node

| Backend | Use when | Status |
| --- | --- | --- |
| [File System](/docs/self-hosting/filesystem) (RocksDB-based) | Single-node deployments, including air-gapped installs | Production-ready, single node only |
| [PostgreSQL](/docs/self-hosting/postgres) | Multi-node deployments | Recommended for multi-node today, but experimental |
| FoundationDB | Largest production deployments | [Enterprise](/sales) |

For multi-node deployments, run two or more engine nodes behind a load balancer and add NATS for pub/sub, which replaces the default PostgreSQL `LISTEN`/`NOTIFY` path at high throughput. Neither is needed for a single-node file system install. See the [Production Checklist](/docs/self-hosting/production-checklist).

## Perimeter Checklist

- **Admin token**: Generate a strong, random token for engine authentication and verify it is not exposed to clients.
- **TLS termination**: Encrypt connections to the engine via a reverse proxy or load balancer.
- **No public exposure**: Keep port `6420` reachable only from inside the perimeter unless clients outside it genuinely need access.
- **Health checks**: Configure liveness and readiness probes against the engine health endpoint.
- **Telemetry**: Leave OpenTelemetry export off, or point it at a collector inside the network.
- **Backups**: With the file system backend, back up the data directory. With PostgreSQL, configure automated backups and failover.

## Full Configuration

- [Self-Hosting Overview](/docs/self-hosting) for architecture and the self-host vs BYOC comparison
- [Installing Rivet Engine](/docs/self-hosting/install) for Docker, binary, and source installs
- [Docker Container](/docs/self-hosting/docker-container) and [Docker Compose](/docs/self-hosting/docker-compose) for container deployments
- [Kubernetes](/docs/self-hosting/kubernetes) for cluster deployments
- [Configuration](/docs/self-hosting/configuration) for every option and the full JSON schema
- [Endpoints](/docs/general/endpoints) for connecting your backend and clients
- [Production Checklist](/docs/self-hosting/production-checklist) before going live

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

