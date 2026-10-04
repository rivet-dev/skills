# put_v1_fs_file

> Source: `sandbox-agent/docs/content/docs/api-reference/operations/put_v1_fs_file.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/operations/put_v1_fs_file
> Description: PUT /v1/fs/file: request parameters and responses.

---
`PUT /v1/fs/file`

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

## Request body

Raw file bytes

Required.

### text/plain

```json
{
  "schema": {
    "type": "string"
  }
}
```

## Responses

### 200

Write result

Content type: `application/json`

```json
{
  "schema": {
    "$ref": "#/components/schemas/FsWriteResponse"
  }
}
```

Related schemas: [FsWriteResponse](/sandbox-agent/docs/api-reference/schemas/fswriteresponse/).
