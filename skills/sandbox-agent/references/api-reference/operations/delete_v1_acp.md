# delete_v1_acp

> Source: `sandbox-agent/docs/content/docs/api-reference/operations/delete_v1_acp.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/operations/delete_v1_acp
> Description: DELETE /v1/acp/{server_id}: request parameters and responses.

---
`DELETE /v1/acp/{server_id}`

## Parameters

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `server_id` | path | Yes | string | Client-defined ACP server id |

### Parameter schemas

```json
[
  {
    "name": "server_id",
    "in": "path",
    "description": "Client-defined ACP server id",
    "required": true,
    "schema": {
      "type": "string"
    }
  }
]
```

## Responses

### 204

ACP server closed
