# Docker

> Source: `docs/deploy/docker.mdx`
> Canonical URL: https://sandboxagent.dev/docs/deploy/docker
> Description: Build and run Sandbox Agent in a Docker container.

---
Docker is not recommended for production isolation of untrusted workloads. Use dedicated sandbox providers (E2B, Daytona, etc.) for stronger isolation.

## Quick start

Run the published full image with all supported agents pre-installed:

```bash
docker run --rm -p 3000:3000 \
  -e ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
  -e OPENAI_API_KEY="$OPENAI_API_KEY" \
  rivetdev/sandbox-agent:0.3.2-full \
  server --no-token --host 0.0.0.0 --port 3000
```

The `0.3.2-full` tag pins the exact version. The moving `full` tag is also published for contributors who want the latest full image.

## TypeScript with the Docker provider

```bash
npm install sandbox-agent@0.3.x dockerode get-port
```

```typescript
import { SandboxAgent } from "sandbox-agent";
import { docker } from "sandbox-agent/docker";

const sdk = await SandboxAgent.start({
  sandbox: docker({
    env: [
      `ANTHROPIC_API_KEY=${process.env.ANTHROPIC_API_KEY}`,
      `OPENAI_API_KEY=${process.env.OPENAI_API_KEY}`,
    ].filter(Boolean),
  }),
});

try {
  const session = await sdk.createSession({ agent: "codex" });
  await session.prompt([{ type: "text", text: "Summarize this repository." }]);
} finally {
  await sdk.destroySandbox();
}
```

The `docker` provider uses the `rivetdev/sandbox-agent:0.3.2-full` image by default. Override with `image`:

```typescript
docker({ image: "my-custom-image:latest" })
```

## Building a custom image with everything preinstalled

If you need to extend your own base image, install Sandbox Agent and preinstall every supported agent in one step:

```dockerfile
FROM node:22-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    bash ca-certificates curl git && \
    rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://releases.rivet.dev/sandbox-agent/0.3.x/install.sh | sh && \
    sandbox-agent install-agent --all

RUN useradd -m -s /bin/bash sandbox
USER sandbox
WORKDIR /home/sandbox

EXPOSE 2468
ENTRYPOINT ["sandbox-agent"]
CMD ["server", "--host", "0.0.0.0", "--port", "2468"]
```

## Building from source

```bash
docker build -f docker/release/linux-x86_64.Dockerfile -t sandbox-agent-build .
docker run --rm -v "$PWD/artifacts:/artifacts" sandbox-agent-build
```

Binary output: `./artifacts/sandbox-agent-x86_64-unknown-linux-musl`.
