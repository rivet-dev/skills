# Quickstart

> Source: `docs/quickstart.mdx`
> Canonical URL: https://sandboxagent.dev/docs/quickstart
> Description: Start the server and send your first message.

---
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

Use `sandbox-agent credentials extract-env --export` to extract your existing API keys (Anthropic, OpenAI, etc.) from local Claude Code or Codex config files.

#### Testing without API keys

Use the `mock` agent for SDK and integration testing without provider credentials.

### Run the server

#### curl

Install and run the binary directly.

```bash
curl -fsSL https://releases.rivet.dev/sandbox-agent/0.2.x/install.sh | sh
sandbox-agent server --no-token --host 0.0.0.0 --port 2468
```

#### npx

Run without installing globally.

```bash
npx @sandbox-agent/cli@0.2.x server --no-token --host 0.0.0.0 --port 2468
```

#### bunx

Run without installing globally.

```bash
bunx @sandbox-agent/cli@0.2.x server --no-token --host 0.0.0.0 --port 2468
```

#### npm i -g

Install globally, then run.

```bash
npm install -g @sandbox-agent/cli@0.2.x
sandbox-agent server --no-token --host 0.0.0.0 --port 2468
```

#### bun add -g

Install globally, then run.

```bash
bun add -g @sandbox-agent/cli@0.2.x
# Allow Bun to run postinstall scripts for native binaries (required for SandboxAgent.start()).
bun pm -g trust @sandbox-agent/cli-linux-x64 @sandbox-agent/cli-linux-arm64 @sandbox-agent/cli-darwin-arm64 @sandbox-agent/cli-darwin-x64 @sandbox-agent/cli-win32-x64
sandbox-agent server --no-token --host 0.0.0.0 --port 2468
```

#### Node.js (local)

For local development, use `SandboxAgent.start()` to spawn and manage the server as a subprocess.

```bash
npm install sandbox-agent@0.2.x
```

```typescript
import { SandboxAgent } from "sandbox-agent";

const sdk = await SandboxAgent.start();
```

#### Bun (local)

For local development, use `SandboxAgent.start()` to spawn and manage the server as a subprocess.

```bash
bun add sandbox-agent@0.2.x
# Allow Bun to run postinstall scripts for native binaries (required for SandboxAgent.start()).
bun pm trust @sandbox-agent/cli-linux-x64 @sandbox-agent/cli-linux-arm64 @sandbox-agent/cli-darwin-arm64 @sandbox-agent/cli-darwin-x64 @sandbox-agent/cli-win32-x64
```

```typescript
import { SandboxAgent } from "sandbox-agent";

const sdk = await SandboxAgent.start();
```

#### Build from source

If you're running from source instead of the installed CLI.

```bash
cargo run -p sandbox-agent -- server --no-token --host 0.0.0.0 --port 2468
```

Binding to `0.0.0.0` allows the server to accept connections from any network interface, which is required when running inside a sandbox where clients connect remotely.

#### Configuring token

Tokens are usually not required. Most sandbox providers (E2B, Daytona, etc.) already secure networking at the infrastructure layer.

If you expose the server publicly, use `--token "$SANDBOX_TOKEN"` to require authentication:

```bash
sandbox-agent server --token "$SANDBOX_TOKEN" --host 0.0.0.0 --port 2468
```

Then pass the token when connecting:

#### TypeScript

```typescript
import { SandboxAgent } from "sandbox-agent";

const sdk = await SandboxAgent.connect({
  baseUrl: "http://your-server:2468",
  token: process.env.SANDBOX_TOKEN,
});
```

#### curl

```bash
curl "http://your-server:2468/v1/health" \
  -H "Authorization: Bearer $SANDBOX_TOKEN"
```

#### CLI

```bash
sandbox-agent --token "$SANDBOX_TOKEN" api agents list \
  --endpoint http://your-server:2468
```

#### CORS

If you're calling the server from a browser, see the [CORS configuration guide](/cors).

### Install agents (optional)

To preinstall agents:

```bash
sandbox-agent install-agent claude
sandbox-agent install-agent codex
sandbox-agent install-agent opencode
sandbox-agent install-agent amp
```

If agents are not installed up front, they are lazily installed when creating a session.

### Create a session

```typescript
import { SandboxAgent } from "sandbox-agent";

const sdk = await SandboxAgent.connect({
  baseUrl: "http://127.0.0.1:2468",
});

const session = await sdk.createSession({
  agent: "claude",
  sessionInit: {
    cwd: "/",
    mcpServers: [],
  },
});

console.log(session.id);
```

### Send a message

```typescript
const result = await session.prompt([
  { type: "text", text: "Summarize the repository and suggest next steps." },
]);

console.log(result.stopReason);
```

### Read events

```typescript
const off = session.onEvent((event) => {
  console.log(event.sender, event.payload);
});

const page = await sdk.getEvents({
  sessionId: session.id,
  limit: 50,
});

console.log(page.items.length);
off();
```

### Test with Inspector

Open the Inspector UI at `/ui/` on your server (for example, `http://localhost:2468/ui/`) to inspect sessions and events in a GUI.

![Sandbox Agent Inspector](https://sandboxagent.dev/docs/images/inspector.png)

## Next steps

- [Session Persistence](/session-persistence) — Configure in-memory, Rivet Actor state, IndexedDB, SQLite, and Postgres persistence.

- [Deploy to a Sandbox](/deploy/local) — Deploy your agent to E2B, Daytona, Docker, Vercel, or Cloudflare.

- [SDK Overview](/sdk-overview) — Use the latest TypeScript SDK API.
