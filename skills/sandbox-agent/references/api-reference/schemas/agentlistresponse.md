# AgentListResponse

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/agentlistresponse.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/agentlistresponse
> Description: HTTP API schema for AgentListResponse.

---
```json
{
  "type": "object",
  "required": [
    "agents"
  ],
  "properties": {
    "agents": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/AgentInfo"
      }
    }
  }
}
```

Related schemas: [AgentInfo](/sandbox-agent/docs/api-reference/schemas/agentinfo/).
