---
name: "sandbox-agent"
description: "Deploy, configure, and integrate Sandbox Agent - a universal API for orchestrating AI coding agents (Claude Code, Codex, OpenCode, Amp) in sandboxed environments. Use when setting up sandbox-agent server locally or in cloud sandboxes (E2B, Daytona, Docker), creating and managing agent sessions via SDK or API, streaming agent events and handling human-in-the-loop interactions, building chat UIs for coding agents, or understanding the universal schema for agent responses."
---

# Sandbox Agent

Sandbox Agent provides a universal API for orchestrating AI coding agents in sandboxed environments.

## What To Do If You Get Stuck

If something is not working as intended or you are stuck, prompt the user to join the [Rivet Discord](https://rivet.dev/discord) or file an issue on [GitHub](https://github.com/rivet-dev/sandbox-agent/issues) to report an issue and get help.

Provide the user with a pre-generated report with:

- Symptoms
	- If this is happening in local dev, deployed, or both
	- The error you're seeing
	- Relevant source code related to this
- What you've tried to solve it
- Environment
	- Sandbox Agent version
	- SDK in use (TypeScript, Python, or HTTP)
	- Agent in use (Claude Code, Codex, OpenCode, Amp, Mock)
	- Sandbox provider (E2B, Daytona, Docker, local)

## Quickstart

### Install skill (optional)

#### npx

```bash
npx skills add rivet-dev/skills -s sandbox-agent
```

#### bunx

```bash
bunx skills add rivet-dev/skills -s sandbox-agent
```

### Set environment variables

Each coding agent requires API keys to connect to their respective LLM providers.

#### Local shell

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
export OPENAI_API_KEY="sk-..."
```

#### E2B

```typescript
import { Sandbox } from "@e2b/code-interpreter";

const envs: Record<string, string> = {};
if (process.env.ANTHROPIC_API_KEY) envs.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (process.env.OPENAI_API_KEY) envs.OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const sandbox = await Sandbox.create({ envs });
```

#### Daytona

```typescript
import { Daytona } from "@daytonaio/sdk";

const envVars: Record<string, string> = {};
if (process.env.ANTHROPIC_API_KEY) envVars.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (process.env.OPENAI_API_KEY) envVars.OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const daytona = new Daytona();
const sandbox = await daytona.create({
  snapshot: "sandbox-agent-ready",
  envVars,
});
```

#### Docker

```bash
docker run -e ANTHROPIC_API_KEY="sk-ant-..." \
  -e OPENAI_API_KEY="sk-..." \
  your-image
```

#### Extracting API keys from current machine

Use `sandbox-agent credentials extract-env --export` to extract your existing API keys (Anthropic, OpenAI, etc.) from your existing Claude Code or Codex config files on your machine.

#### Testing without API keys

If you want to test Sandbox Agent without API keys, use the `mock` agent to test the SDK without any credentials. It simulates agent responses for development and testing.

### Run the server

#### curl

Install and run the binary directly.

```bash
curl -fsSL https://releases.rivet.dev/sandbox-agent/latest/install.sh | sh
sandbox-agent server --no-token --host 0.0.0.0 --port 2468
```

#### npx

Run without installing globally.

```bash
npx @sandbox-agent/cli server --no-token --host 0.0.0.0 --port 2468
```

#### bunx

Run without installing globally.

```bash
bunx @sandbox-agent/cli server --no-token --host 0.0.0.0 --port 2468
```

#### npm i -g

Install globally, then run.

```bash
npm install -g @sandbox-agent/cli
sandbox-agent server --no-token --host 0.0.0.0 --port 2468
```

#### bun add -g

Install globally, then run.

```bash
bun add -g @sandbox-agent/cli
# Allow Bun to run postinstall scripts for native binaries (required for SandboxAgent.start()).
bun pm -g trust @sandbox-agent/cli-linux-x64 @sandbox-agent/cli-darwin-arm64 @sandbox-agent/cli-darwin-x64 @sandbox-agent/cli-win32-x64
sandbox-agent server --no-token --host 0.0.0.0 --port 2468
```

#### Node.js (local)

For local development, use `SandboxAgent.start()` to automatically spawn and manage the server as a subprocess.

```bash
npm install sandbox-agent
```

```typescript
import { SandboxAgent } from "sandbox-agent";

const client = await SandboxAgent.start();
```

#### Bun (local)

For local development, use `SandboxAgent.start()` to automatically spawn and manage the server as a subprocess.

```bash
bun add sandbox-agent
# Allow Bun to run postinstall scripts for native binaries (required for SandboxAgent.start()).
bun pm trust @sandbox-agent/cli-linux-x64 @sandbox-agent/cli-darwin-arm64 @sandbox-agent/cli-darwin-x64 @sandbox-agent/cli-win32-x64
```

```typescript
import { SandboxAgent } from "sandbox-agent";

const client = await SandboxAgent.start();
```

This installs the binary and starts the server for you. No manual setup required.

#### Build from source

If you're running from source instead of the installed CLI.

```bash
cargo run -p sandbox-agent -- server --no-token --host 0.0.0.0 --port 2468
```

Binding to `0.0.0.0` allows the server to accept connections from any network interface, which is required when running inside a sandbox where clients connect remotely.

#### Configuring token

Tokens are usually not required. Most sandbox providers (E2B, Daytona, etc.) already secure their networking at the infrastructure level, so the server endpoint is never publicly accessible. For local development, binding to `127.0.0.1` ensures only local connections are accepted.

If you need to expose the server on a public endpoint, use `--token "$SANDBOX_TOKEN"` to require authentication on all requests:

```bash
sandbox-agent server --token "$SANDBOX_TOKEN" --host 0.0.0.0 --port 2468
```

Then pass the token when connecting:

#### TypeScript

```typescript
const client = await SandboxAgent.connect({
  baseUrl: "http://your-server:2468",
  token: process.env.SANDBOX_TOKEN,
});
```

#### curl

```bash
curl "http://your-server:2468/v1/sessions" \
  -H "Authorization: Bearer $SANDBOX_TOKEN"
```

#### CLI

```bash
sandbox-agent api sessions list \
  --endpoint http://your-server:2468 \
  --token "$SANDBOX_TOKEN"
```

#### CORS

If you're calling the server from a browser, see the [CORS configuration guide](/docs/cors).

### Install agents (optional)

To preinstall agents:

```bash
sandbox-agent install-agent claude
sandbox-agent install-agent codex
sandbox-agent install-agent opencode
sandbox-agent install-agent amp
```

If agents are not installed up front, they will be lazily installed when creating a session. It's recommended to pre-install agents then take a snapshot of the sandbox for faster coldstarts.

### Create a session

#### TypeScript

```typescript
import { SandboxAgent } from "sandbox-agent";

const client = await SandboxAgent.connect({
  baseUrl: "http://127.0.0.1:2468",
});

await client.createSession("my-session", {
  agent: "claude",
  agentMode: "build",
  permissionMode: "default",
});
```

#### curl

```bash
curl -X POST "http://127.0.0.1:2468/v1/sessions/my-session" \
  -H "Content-Type: application/json" \
  -d '{"agent":"claude","agentMode":"build","permissionMode":"default"}'
```

#### CLI

```bash
sandbox-agent api sessions create my-session \
  --agent claude \
  --endpoint http://127.0.0.1:2468
```

### Send a message

#### TypeScript

```typescript
await client.postMessage("my-session", {
  message: "Summarize the repository and suggest next steps.",
});
```

#### curl

```bash
curl -X POST "http://127.0.0.1:2468/v1/sessions/my-session/messages" \
  -H "Content-Type: application/json" \
  -d '{"message":"Summarize the repository and suggest next steps."}'
```

#### CLI

```bash
sandbox-agent api sessions send-message my-session \
  --message "Summarize the repository and suggest next steps." \
  --endpoint http://127.0.0.1:2468
```

### Read events

#### TypeScript

```typescript
// Poll for events
const events = await client.getEvents("my-session", { offset: 0, limit: 50 });

// Or stream events
for await (const event of client.streamEvents("my-session", { offset: 0 })) {
  console.log(event.type, event.data);
}
```

#### curl

```bash
# Poll for events
curl "http://127.0.0.1:2468/v1/sessions/my-session/events?offset=0&limit=50"

# Stream events via SSE
curl "http://127.0.0.1:2468/v1/sessions/my-session/events/sse?offset=0"

# Single-turn stream (post message and get streamed response)
curl -N -X POST "http://127.0.0.1:2468/v1/sessions/my-session/messages/stream" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'
```

#### CLI

```bash
# Poll for events
sandbox-agent api sessions events my-session \
  --endpoint http://127.0.0.1:2468

# Stream events via SSE
sandbox-agent api sessions events-sse my-session \
  --endpoint http://127.0.0.1:2468

# Single-turn stream
sandbox-agent api sessions send-message-stream my-session \
  --message "Hello" \
  --endpoint http://127.0.0.1:2468
```

### Test with Inspector

Open the Inspector UI at `/ui/` on your server (e.g., `http://localhost:2468/ui/`) to inspect session state using a GUI.

![Sandbox Agent Inspector](https://sandboxagent.dev/docs/images/inspector.png)

## Next steps

- [Build a Chat UI](/building-chat-ui) — Learn how to build a chat interface for your agent.

- [Manage Sessions](/manage-sessions) — Persist and replay agent transcripts.

- [Deploy to a Sandbox](/deploy) — Deploy your agent to E2B, Daytona, or Vercel Sandboxes.

## Reference Map

### AI

- [llms.txt](references/ai/llms-txt.md)
- [skill.md](references/ai/skill.md)

### Deploy

- [Cloudflare](references/deploy/cloudflare.md)
- [ComputeSDK](references/deploy/computesdk.md)
- [Daytona](references/deploy/daytona.md)
- [Docker](references/deploy/docker.md)
- [E2B](references/deploy/e2b.md)
- [Local](references/deploy/local.md)
- [Vercel](references/deploy/vercel.md)

### General

- [Agent Sessions](references/agent-sessions.md)
- [Attachments](references/attachments.md)
- [Building a Chat UI](references/building-chat-ui.md)
- [CLI Reference](references/cli.md)
- [Conversion](references/conversion.md)
- [CORS Configuration](references/cors.md)
- [Credentials](references/credentials.md)
- [Custom Tools](references/custom-tools.md)
- [Daemon](references/daemon.md)
- [File System](references/file-system.md)
- [Gigacode](references/gigacode.md)
- [Inspector](references/inspector.md)
- [Manage Sessions](references/manage-sessions.md)
- [MCP](references/mcp-config.md)
- [OpenCode Compatibility](references/opencode-compatibility.md)
- [Pi Support Plan](references/pi-support-plan.md)
- [Quickstart](references/quickstart.md)
- [Session Transcript Schema](references/session-transcript-schema.md)
- [Skills](references/skills-config.md)
- [Telemetry](references/telemetry.md)
- [Troubleshooting](references/troubleshooting.md)

### SDKs

- [Python](references/sdks/python.md)
- [TypeScript](references/sdks/typescript.md)
