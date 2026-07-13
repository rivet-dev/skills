# Container Runner

> Source: `src/content/docs/deploy/container-runner.mdx`
> Canonical URL: https://rivet.dev/docs/deploy/container-runner
> Description: Run any containerized server as a Rivet Actor.

---
The container runner (`rivet-container-runner`) turns any container into a Rivet Actor host: as the entrypoint, it spawns your server as a child process and proxies HTTP and WebSocket traffic from the Rivet gateway to it. It is the recommended way to run non-RivetKit software behind Rivet, such as a Unity or Godot dedicated game server. Each actor gets its own child process on its own port; how many actors share a container is decided by the pool's request concurrency, and the recommended game-server setup is one actor per container.

## Install in Your Container

Download the static binary from Rivet's release artifacts in your Dockerfile and set it as the entrypoint, passing your server's launch command after `--`:

```dockerfile @nocheck
FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl && rm -rf /var/lib/apt/lists/*

# Install the Rivet container runner.
RUN curl -fsSL https://releases.rivet.dev/rivet/latest/container-runner/rivet-container-runner-x86_64-unknown-linux-musl \
        -o /usr/local/bin/rivet-container-runner \
    && chmod +x /usr/local/bin/rivet-container-runner

# Your server binary and assets.
COPY build/ /game/
WORKDIR /game

ENTRYPOINT ["rivet-container-runner", "--", "./GameServer", "-batchmode", "-nographics", "-logFile", "-"]
```

Artifacts are published for `x86_64-unknown-linux-musl` and `aarch64-unknown-linux-musl`. The binaries are fully static, so they run in any Linux base image, including `scratch`. Pin a version by replacing `latest` with a release version, for example `https://releases.rivet.dev/rivet/2.3.3/container-runner/rivet-container-runner-x86_64-unknown-linux-musl`.

## How It Works

1. The engine cold-starts your container and calls `POST /api/rivet/start` on the port it injects as `RIVET_PORT`.
2. The runner spawns your server as a child process with `PORT` set to the child port, waits for the port to open, and reports the actor as running.
3. Gateway traffic for the actor arrives over Rivet's tunnel and is proxied to `127.0.0.1:<child port>`. WebSocket clients connect at the bare gateway URL with the `rivet` WebSocket subprotocol. Raw HTTP reaches the child under the `/request/*` prefix on the actor surface (the prefix is stripped before proxying); other paths are reserved for the runtime's own endpoints.
4. Child stdout and stderr are re-emitted with an `[actorId=... key=...]` prefix so actor logs are attributed in the dashboard.
5. When an actor stops, the runner sends its child `SIGTERM`, escalates to `SIGKILL` after a grace period, and exits the process once no actors remain.

## Configuration

All flags can also be set through environment variables:

| Flag | Environment variable | Default | Description |
| --- | --- | --- | --- |
| `--port` | `RIVET_PORT` / `PORT` | `8080` | Serverless front-door HTTP port. Rivet Compute injects `RIVET_PORT` automatically. |
| `--child-port` | `CHILD_PORT` | `7770` | First local child port; each actor's child gets the next free port at or above this, exported to the child as `PORT`. |
| `--actor-name` | `RIVET_ACTOR_NAME` | `game` | Actor name this runner serves. |
| `--runner-version` | `RIVET_RUNNER_VERSION` | `1` | Version reported to the engine, used to drain old runners on deploy. |
| `--base-path` | `RIVET_SERVERLESS_BASE_PATH` | `/api/rivet` | Base path the engine calls for serverless start. |
| `--stop-grace-secs` | `RIVET_STOP_GRACE_SECS` | `25` | `SIGTERM` to `SIGKILL` grace period when stopping the child. Capped to a few seconds when the platform itself is reclaiming the instance, so shutdown fits inside the platform's own kill window. |
| `--readiness-timeout-secs` | `RIVET_READINESS_TIMEOUT_SECS` | `30` | How long to wait for the child's port to open before failing the start. |

### Per-Actor Input

The actor's `input` payload can override the launch spec per actor. All fields are optional and fall back to the entrypoint command. RivetKit clients pass this object directly; when creating actors through the raw engine API, encode it as CBOR before base64-encoding the `input` field:

```json
{
	"command": ["./GameServer", "-batchmode"],
	"args": ["-extra-flag"],
	"env": { "MATCH_MODE": "ranked" },
	"port": 7777
}
```

`command` replaces the entrypoint command template, `args` are appended to it, `env` adds environment variables for the child, and `port` overrides the child port.

## Deploy

Deploy the image to [Rivet Compute](/docs/deploy/rivet-compute) with the CLI. For game servers, configure the pool with one actor per instance:

```bash
npx @rivetkit/cli deploy \
	--token "$RIVET_CLOUD_TOKEN" \
	--instance-request-concurrency 1 \
	--dockerfile Dockerfile
```

Then create actors against the pool's runner (`default`) and connect clients through the gateway URL shown in the dashboard.

## Source and Examples

The runner and a full end-to-end example, including a Unity FishNet demo project and a local test harness, live in the Rivet repository under [`container-runner/`](https://github.com/rivet-dev/rivet/tree/main/container-runner).

_Source doc path: /docs/deploy/container-runner_
