# post_v1_fs_upload_batch

> Source: `sandbox-agent/docs/content/docs/api-reference/operations/post_v1_fs_upload_batch.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/operations/post_v1_fs_upload_batch
> Description: POST /v1/fs/upload-batch: request parameters and responses.

---
`POST /v1/fs/upload-batch`

## Parameters

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `path` | query | No | string | Destination path |

### Parameter schemas

```json
[
  {
    "name": "path",
    "in": "query",
    "description": "Destination path",
    "required": false,
    "schema": {
      "type": "string",
      "nullable": true
    }
  }
]
```

## Request body

tar archive body

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

Upload/extract result

Content type: `application/json`

```json
{
  "schema": {
    "$ref": "#/components/schemas/FsUploadBatchResponse"
  }
}
```

Related schemas: [FsUploadBatchResponse](/sandbox-agent/docs/api-reference/schemas/fsuploadbatchresponse/).
