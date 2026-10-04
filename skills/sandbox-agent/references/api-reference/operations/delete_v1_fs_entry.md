# delete_v1_fs_entry

> Source: `sandbox-agent/docs/content/docs/api-reference/operations/delete_v1_fs_entry.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/operations/delete_v1_fs_entry
> Description: DELETE /v1/fs/entry: request parameters and responses.

---
`DELETE /v1/fs/entry`

## Parameters

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `path` | query | Yes | string | File or directory path |
| `recursive` | query | No | boolean | Delete directory recursively |

### Parameter schemas

```json
[
  {
    "name": "path",
    "in": "query",
    "description": "File or directory path",
    "required": true,
    "schema": {
      "type": "string"
    }
  },
  {
    "name": "recursive",
    "in": "query",
    "description": "Delete directory recursively",
    "required": false,
    "schema": {
      "type": "boolean",
      "nullable": true
    }
  }
]
```

## Responses

### 200

Delete result

Content type: `application/json`

```json
{
  "schema": {
    "$ref": "#/components/schemas/FsActionResponse"
  }
}
```

Related schemas: [FsActionResponse](/sandbox-agent/docs/api-reference/schemas/fsactionresponse/).
