# get_v1_fs_file

> Source: `sandbox-agent/docs/content/docs/api-reference/operations/get_v1_fs_file.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/operations/get_v1_fs_file
> Description: GET /v1/fs/file: request parameters and responses.

---
`GET /v1/fs/file`

## Parameters

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `path` | query | Yes | string | File path |

### Parameter schemas

```json
[
  {
    "name": "path",
    "in": "query",
    "description": "File path",
    "required": true,
    "schema": {
      "type": "string"
    }
  }
]
```

## Responses

### 200

File content
