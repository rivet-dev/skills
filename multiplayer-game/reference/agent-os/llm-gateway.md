# Embedded LLM Gateway

> Source: `src/content/docs/agent-os/llm-gateway.mdx`
> Canonical URL: https://rivet.dev/docs/agent-os/llm-gateway
> Description: Route, meter, and manage LLM API calls from agents.

---
The Embedded LLM Gateway runs as part of the agentOS library, not as an external service. It intercepts and manages all LLM API calls made by agents inside the VM.

- **Unified routing** for all agent LLM requests
- **API keys stay on the server** so they are never exposed to agent code inside the VM
- **Usage metering** with per-session and per-agent breakdowns
- **Rate limiting** and cost controls

Check back soon for full documentation.

_Source doc path: /docs/agent-os/llm-gateway_
