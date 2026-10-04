# AgentInstallRequest

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/agentinstallrequest.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/agentinstallrequest
> Description: HTTP API schema for AgentInstallRequest.

---
```json
{
  "type": "object",
  "properties": {
    "agentProcessVersion": {
      "type": "string",
      "nullable": true
    },
    "agentVersion": {
      "type": "string",
      "nullable": true
    },
    "reinstall": {
      "type": "boolean",
      "nullable": true
    }
  }
}
```
