# get_v1_fs_stat

> Source: `sandbox-agent/docs/content/docs/api-reference/operations/get_v1_fs_stat.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/operations/get_v1_fs_stat
> Description: GET /v1/fs/stat: request parameters and responses.

---
`GET /v1/fs/stat`

## Parameters

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `path` | query | Yes | string | Path to stat |

### Parameter schemas

```json
[
  {
    "name": "path",
    "in": "query",
    "description": "Path to stat",
    "required": true,
    "schema": {
      "type": "string"
    }
  }
]
```

## Responses

### 200

Path metadata

Content type: `application/json`

```json
{
  "schema": {
    "$ref": "#/components/schemas/FsStat"
  }
}
```

Related schemas: [FsStat](/sandbox-agent/docs/api-reference/schemas/fsstat/).
