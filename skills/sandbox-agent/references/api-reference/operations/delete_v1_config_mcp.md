# delete_v1_config_mcp

> Source: `sandbox-agent/docs/content/docs/api-reference/operations/delete_v1_config_mcp.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/operations/delete_v1_config_mcp
> Description: DELETE /v1/config/mcp: request parameters and responses.

---
`DELETE /v1/config/mcp`

## Parameters

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `directory` | query | Yes | string | Target directory |
| `mcpName` | query | Yes | string | MCP entry name |

### Parameter schemas

```json
[
  {
    "name": "directory",
    "in": "query",
    "description": "Target directory",
    "required": true,
    "schema": {
      "type": "string"
    }
  },
  {
    "name": "mcpName",
    "in": "query",
    "description": "MCP entry name",
    "required": true,
    "schema": {
      "type": "string"
    }
  }
]
```

## Responses

### 204

Deleted
