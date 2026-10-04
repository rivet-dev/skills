# AgentInstallResponse

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/agentinstallresponse.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/agentinstallresponse
> Description: HTTP API schema for AgentInstallResponse.

---
```json
{
  "type": "object",
  "required": [
    "already_installed",
    "artifacts"
  ],
  "properties": {
    "already_installed": {
      "type": "boolean"
    },
    "artifacts": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/AgentInstallArtifact"
      }
    }
  }
}
```

Related schemas: [AgentInstallArtifact](/sandbox-agent/docs/api-reference/schemas/agentinstallartifact/).
