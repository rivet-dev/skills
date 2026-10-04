# DesktopRecordingInfo

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/desktoprecordinginfo.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/desktoprecordinginfo
> Description: HTTP API schema for DesktopRecordingInfo.

---
```json
{
  "type": "object",
  "required": [
    "id",
    "status",
    "fileName",
    "bytes",
    "startedAt"
  ],
  "properties": {
    "bytes": {
      "type": "integer",
      "format": "int64",
      "minimum": 0
    },
    "endedAt": {
      "type": "string",
      "nullable": true
    },
    "fileName": {
      "type": "string"
    },
    "id": {
      "type": "string"
    },
    "processId": {
      "type": "string",
      "nullable": true
    },
    "startedAt": {
      "type": "string"
    },
    "status": {
      "$ref": "#/components/schemas/DesktopRecordingStatus"
    }
  }
}
```

Related schemas: [DesktopRecordingStatus](/sandbox-agent/docs/api-reference/schemas/desktoprecordingstatus/).
