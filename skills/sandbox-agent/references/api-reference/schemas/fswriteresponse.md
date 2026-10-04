# FsWriteResponse

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/fswriteresponse.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/fswriteresponse
> Description: HTTP API schema for FsWriteResponse.

---
```json
{
  "type": "object",
  "required": [
    "path",
    "bytesWritten"
  ],
  "properties": {
    "bytesWritten": {
      "type": "integer",
      "format": "int64",
      "minimum": 0
    },
    "path": {
      "type": "string"
    }
  }
}
```
