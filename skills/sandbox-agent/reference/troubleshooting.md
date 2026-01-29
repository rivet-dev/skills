# Troubleshooting

> Source: `docs/troubleshooting.mdx`
> Canonical URL: https://sandboxagent.dev/docs/troubleshooting
> Description: Common issues and solutions when running sandbox-agent

---
## "Agent Process Exited" immediately after sending a message

This typically means the agent (Claude, Codex) crashed on startup. Common causes:

### 1. Network restrictions

The sandbox cannot reach the AI provider's API (`api.anthropic.com` or `api.openai.com`). Test connectivity with:

```bash
curl -s -o /dev/null -w '%{http_code}' --connect-timeout 5 https://api.anthropic.com/v1/messages
```

A `000` or timeout means the network is blocked. See [Daytona Network Restrictions](#daytona-network-restrictions) below.

### 2. Missing API key

Ensure `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` is set in the sandbox environment, not just locally.

### 3. Agent binary not found

Verify the agent is installed:

```bash
ls -la ~/.local/share/sandbox-agent/bin/
```

### 4. Binary libc mismatch (musl vs glibc)

Claude Code binaries are available in both musl and glibc variants. If you see errors like:

```
cannot execute: required file not found
Error loading shared library libstdc++.so.6: No such file or directory
```

This means the wrong binary variant was downloaded.

**For sandbox-agent 0.2.0+**: Platform detection is automatic. The correct binary (musl or glibc) is downloaded based on the runtime environment.

**For sandbox-agent 0.1.x**: Use Alpine Linux which has native musl support:

```dockerfile
FROM alpine:latest
RUN apk add --no-cache curl ca-certificates libstdc++ libgcc bash
```

## Daytona Network Restrictions

Daytona sandboxes have tier-based network access:

| Tier | Network Access |
|------|----------------|
| Tier 1 & 2 | Restricted. **Cannot be overridden.** AI provider APIs blocked by default. |
| Tier 3 & 4 | Full internet access. Custom allowlists supported. |

If you're on Tier 1/2 and agents fail immediately, you have two options:

1. **Upgrade to Tier 3+** for full network access
2. **Contact Daytona support** to whitelist `api.anthropic.com` and `api.openai.com` for your organization

The `networkAllowList` parameter only works on Tier 3+:

```typescript
await daytona.create({
  snapshot: "my-snapshot",
  envVars: { ANTHROPIC_API_KEY: "..." },
  networkAllowList: "api.anthropic.com,api.openai.com", // Tier 3+ only
});
```

See [Daytona Network Limits documentation](https://www.daytona.io/docs/en/network-limits/) for details.
