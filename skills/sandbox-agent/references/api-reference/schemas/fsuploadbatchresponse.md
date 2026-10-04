# FsUploadBatchResponse

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/fsuploadbatchresponse.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/fsuploadbatchresponse
> Description: HTTP API schema for FsUploadBatchResponse.

---
```json
{
  "type": "object",
  "required": [
    "paths",
    "truncated"
  ],
  "properties": {
    "paths": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "truncated": {
      "type": "boolean"
    }
  }
}
```
