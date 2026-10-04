# DesktopStreamStatusResponse

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/desktopstreamstatusresponse.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/desktopstreamstatusresponse
> Description: HTTP API schema for DesktopStreamStatusResponse.

---
```json
{
  "type": "object",
  "required": [
    "active"
  ],
  "properties": {
    "active": {
      "type": "boolean"
    },
    "processId": {
      "type": "string",
      "nullable": true
    },
    "windowId": {
      "type": "string",
      "nullable": true
    }
  }
}
```
