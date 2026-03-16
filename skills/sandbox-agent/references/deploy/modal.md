# Modal

> Source: `docs/deploy/modal.mdx`
> Canonical URL: https://sandboxagent.dev/docs/deploy/modal
> Description: Deploy Sandbox Agent inside a Modal sandbox.

---
## Prerequisites

- `MODAL_TOKEN_ID` and `MODAL_TOKEN_SECRET` from [modal.com/settings](https://modal.com/settings)
- `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`

## TypeScript example

```bash
npm install sandbox-agent@0.3.x modal
```

```typescript
import { SandboxAgent } from "sandbox-agent";
import { modal } from "sandbox-agent/modal";

const secrets: Record<string, string> = {};
if (process.env.ANTHROPIC_API_KEY) secrets.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (process.env.OPENAI_API_KEY) secrets.OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const sdk = await SandboxAgent.start({
  sandbox: modal({
    create: { secrets },
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

The `modal` provider handles app creation, image building, sandbox provisioning, agent installation, server startup, and tunnel networking automatically.

## Faster cold starts

Modal caches image layers, so the Dockerfile commands that install `curl` and `sandbox-agent` only run on the first build. Subsequent sandbox creates reuse the cached image.

## Notes

- Modal sandboxes use [gVisor](https://gvisor.dev/) for strong isolation.
- Ports are exposed via encrypted tunnels (`encryptedPorts`). The provider uses `sb.tunnels()` to get the public HTTPS URL.
- Environment variables (API keys) are passed as Modal [Secrets](https://modal.com/docs/guide/secrets) for security.
