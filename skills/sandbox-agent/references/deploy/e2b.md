# E2B

> Source: `docs/deploy/e2b.mdx`
> Canonical URL: https://sandboxagent.dev/docs/deploy/e2b
> Description: Deploy Sandbox Agent inside an E2B sandbox.

---
## Prerequisites

- `E2B_API_KEY`
- `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`

## TypeScript example

```bash
npm install sandbox-agent@0.3.x @e2b/code-interpreter
```

```typescript
import { SandboxAgent } from "sandbox-agent";
import { e2b } from "sandbox-agent/e2b";

const envs: Record<string, string> = {};
if (process.env.ANTHROPIC_API_KEY) envs.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (process.env.OPENAI_API_KEY) envs.OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const sdk = await SandboxAgent.start({
  sandbox: e2b({
    create: { envs },
  }),
});

try {
  const session = await sdk.createSession({ agent: "claude" });
  const response = await session.prompt([
    { type: "text", text: "Summarize this repository" },
  ]);
  console.log(response.stopReason);
} finally {
  await sdk.destroySandbox();
}
```

The `e2b` provider handles sandbox creation, Sandbox Agent installation, agent setup, and server startup automatically.

## Faster cold starts

For faster startup, create a custom E2B template with Sandbox Agent and target agents pre-installed.
See [E2B Custom Templates](https://e2b.dev/docs/sandbox-template).
