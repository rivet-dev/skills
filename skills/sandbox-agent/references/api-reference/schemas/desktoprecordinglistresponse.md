# DesktopRecordingListResponse

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/desktoprecordinglistresponse.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/desktoprecordinglistresponse
> Description: HTTP API schema for DesktopRecordingListResponse.

---
```json
{
  "type": "object",
  "required": [
    "recordings"
  ],
  "properties": {
    "recordings": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/DesktopRecordingInfo"
      }
    }
  }
}
```

Related schemas: [DesktopRecordingInfo](/sandbox-agent/docs/api-reference/schemas/desktoprecordinginfo/).
