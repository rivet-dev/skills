# Quickstart

> Source: `docs/quickstart.mdx`
> Canonical URL: https://sandboxagent.dev/docs/quickstart
> Description: Get a coding agent running in a sandbox in under a minute.

---
### Install

#### npm

```bash
npm install sandbox-agent@0.3.x
```

#### bun

```bash
bun add sandbox-agent@0.3.x
# Allow Bun to run postinstall scripts for native binaries (required for SandboxAgent.start()).
bun pm trust @sandbox-agent/cli-linux-x64 @sandbox-agent/cli-linux-arm64 @sandbox-agent/cli-darwin-arm64 @sandbox-agent/cli-darwin-x64 @sandbox-agent/cli-win32-x64
```

### Start the sandbox

`SandboxAgent.start()` provisions a sandbox, starts a lightweight [Sandbox Agent server](/architecture) inside it, and connects your SDK client.

#### Local

```bash
npm install sandbox-agent@0.3.x
```

```typescript
import { SandboxAgent } from "sandbox-agent";
import { local } from "sandbox-agent/local";

// Runs on your machine. Inherits process.env automatically.
const client = await SandboxAgent.start({
  sandbox: local(),
});
```

See [Local deploy guide](/deploy/local)

#### E2B

```bash
npm install sandbox-agent@0.3.x @e2b/code-interpreter
```

```typescript
import { SandboxAgent } from "sandbox-agent";
import { e2b } from "sandbox-agent/e2b";

// Provisions a cloud sandbox on E2B, installs the server, and connects.
const client = await SandboxAgent.start({
  sandbox: e2b(),
});
```

See [E2B deploy guide](/deploy/e2b)

#### Daytona

```bash
npm install sandbox-agent@0.3.x @daytonaio/sdk
```

```typescript
import { SandboxAgent } from "sandbox-agent";
import { daytona } from "sandbox-agent/daytona";

// Provisions a Daytona workspace with the server pre-installed.
const client = await SandboxAgent.start({
  sandbox: daytona(),
});
```

See [Daytona deploy guide](/deploy/daytona)

#### Vercel

```bash
npm install sandbox-agent@0.3.x @vercel/sandbox
```

```typescript
import { SandboxAgent } from "sandbox-agent";
import { vercel } from "sandbox-agent/vercel";

// Provisions a Vercel sandbox with the server installed on boot.
const client = await SandboxAgent.start({
  sandbox: vercel(),
});
```

See [Vercel deploy guide](/deploy/vercel)

#### Modal

```bash
npm install sandbox-agent@0.3.x modal
```

```typescript
import { SandboxAgent } from "sandbox-agent";
import { modal } from "sandbox-agent/modal";

// Builds a container image with agents pre-installed (cached after first run),
// starts a Modal sandbox from that image, and connects.
const client = await SandboxAgent.start({
  sandbox: modal(),
});
```

See [Modal deploy guide](/deploy/modal)

#### Cloudflare

```bash
npm install sandbox-agent@0.3.x @cloudflare/sandbox
```

```typescript
import { SandboxAgent } from "sandbox-agent";
import { cloudflare } from "sandbox-agent/cloudflare";
import { SandboxClient } from "@cloudflare/sandbox";

// Uses the Cloudflare Sandbox SDK to provision and connect.
// The Cloudflare SDK handles server lifecycle internally.
const cfSandboxClient = new SandboxClient();
const client = await SandboxAgent.start({
  sandbox: cloudflare({ sdk: cfSandboxClient }),
});
```

See [Cloudflare deploy guide](/deploy/cloudflare)

#### Docker

```bash
npm install sandbox-agent@0.3.x dockerode get-port
```

```typescript
import { SandboxAgent } from "sandbox-agent";
import { docker } from "sandbox-agent/docker";

// Runs a Docker container locally. Good for testing.
const client = await SandboxAgent.start({
  sandbox: docker(),
});
```

See [Docker deploy guide](/deploy/docker)

<div style={{ height: "1rem" }} />

**More info:**

#### Passing LLM credentials

Agents need API keys for their LLM provider. Each provider passes credentials differently:

```typescript
// Local — inherits process.env automatically

// E2B
e2b({ create: { envs: { ANTHROPIC_API_KEY: "..." } } })

// Daytona
daytona({ create: { envVars: { ANTHROPIC_API_KEY: "..." } } })

// Vercel
vercel({ create: { env: { ANTHROPIC_API_KEY: "..." } } })

// Modal
modal({ create: { secrets: { ANTHROPIC_API_KEY: "..." } } })

// Docker
docker({ env: ["ANTHROPIC_API_KEY=..."] })
```

For multi-tenant billing, per-user keys, and gateway options, see [LLM Credentials](/llm-credentials).

#### Implementing a custom provider

Implement the `SandboxProvider` interface to use any sandbox platform:

```typescript
import { SandboxAgent, type SandboxProvider } from "sandbox-agent";

const myProvider: SandboxProvider = {
  name: "my-provider",
  async create() {
    // Provision a sandbox, install & start the server, return an ID
    return "sandbox-123";
  },
  async destroy(sandboxId) {
    // Tear down the sandbox
  },
  async getUrl(sandboxId) {
    // Return the Sandbox Agent server URL
    return `https://${sandboxId}.my-platform.dev:3000`;
  },
};

const client = await SandboxAgent.start({
  sandbox: myProvider,
});
```

#### Connecting to an existing server

If you already have a Sandbox Agent server running, connect directly:

```typescript
const client = await SandboxAgent.connect({
  baseUrl: "http://127.0.0.1:2468",
});
```

#### Starting the server manually

#### curl

```bash
curl -fsSL https://releases.rivet.dev/sandbox-agent/0.3.x/install.sh | sh
sandbox-agent server --no-token --host 0.0.0.0 --port 2468
```

#### npx

```bash
npx @sandbox-agent/cli@0.3.x server --no-token --host 0.0.0.0 --port 2468
```

#### Docker

```bash
docker run -p 2468:2468 \
  -e ANTHROPIC_API_KEY="sk-ant-..." \
  -e OPENAI_API_KEY="sk-..." \
  rivetdev/sandbox-agent:0.3.2-full \
  server --no-token --host 0.0.0.0 --port 2468
```

### Create a session and send a prompt

```typescript Claude
const session = await client.createSession({
  agent: "claude",
});

session.onEvent((event) => {
  console.log(event.sender, event.payload);
});

const result = await session.prompt([
  { type: "text", text: "Summarize the repository and suggest next steps." },
]);

console.log(result.stopReason);
```

```typescript Codex
const session = await client.createSession({
  agent: "codex",
});

session.onEvent((event) => {
  console.log(event.sender, event.payload);
});

const result = await session.prompt([
  { type: "text", text: "Summarize the repository and suggest next steps." },
]);

console.log(result.stopReason);
```

```typescript OpenCode
const session = await client.createSession({
  agent: "opencode",
});

session.onEvent((event) => {
  console.log(event.sender, event.payload);
});

const result = await session.prompt([
  { type: "text", text: "Summarize the repository and suggest next steps." },
]);

console.log(result.stopReason);
```

```typescript Cursor
const session = await client.createSession({
  agent: "cursor",
});

session.onEvent((event) => {
  console.log(event.sender, event.payload);
});

const result = await session.prompt([
  { type: "text", text: "Summarize the repository and suggest next steps." },
]);

console.log(result.stopReason);
```

```typescript Amp
const session = await client.createSession({
  agent: "amp",
});

session.onEvent((event) => {
  console.log(event.sender, event.payload);
});

const result = await session.prompt([
  { type: "text", text: "Summarize the repository and suggest next steps." },
]);

console.log(result.stopReason);
```

```typescript Pi
const session = await client.createSession({
  agent: "pi",
});

session.onEvent((event) => {
  console.log(event.sender, event.payload);
});

const result = await session.prompt([
  { type: "text", text: "Summarize the repository and suggest next steps." },
]);

console.log(result.stopReason);
```

See [Agent Sessions](/agent-sessions) for the full sessions API.

### Clean up

```typescript
await client.destroySandbox(); // tears down the sandbox and disconnects
```

Use `client.dispose()` instead to disconnect without destroying the sandbox (for reconnecting later).

### Inspect with the UI

Open the Inspector at `/ui/` on your server (e.g. `http://localhost:2468/ui/`) to view sessions and events in a GUI.

![Sandbox Agent Inspector](https://sandboxagent.dev/docs/images/inspector.png)

## Full example

```typescript
import { SandboxAgent } from "sandbox-agent";
import { e2b } from "sandbox-agent/e2b";

const client = await SandboxAgent.start({
  sandbox: e2b({
    create: {
      envs: { ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY },
    },
  }),
});

try {
  const session = await client.createSession({ agent: "claude" });

  session.onEvent((event) => {
    console.log(`[${event.sender}]`, JSON.stringify(event.payload));
  });

  const result = await session.prompt([
    { type: "text", text: "Write a function that checks if a number is prime." },
  ]);

  console.log("Done:", result.stopReason);
} finally {
  await client.destroySandbox();
}
```

## Next steps

- [SDK Overview](/sdk-overview) — Full TypeScript SDK API surface.

- [Deploy to a Sandbox](/deploy/local) — Deploy to E2B, Daytona, Docker, Vercel, or Cloudflare.
