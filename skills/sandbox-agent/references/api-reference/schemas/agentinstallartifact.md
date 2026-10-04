# AgentInstallArtifact

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/agentinstallartifact.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/agentinstallartifact
> Description: HTTP API schema for AgentInstallArtifact.

---
```json
{
  "type": "object",
  "required": [
    "kind",
    "path",
    "source"
  ],
  "properties": {
    "kind": {
      "type": "string"
    },
    "path": {
      "type": "string"
    },
    "source": {
      "type": "string"
    },
    "version": {
      "type": "string",
      "nullable": true
    }
  }
}
```
