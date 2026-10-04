# DesktopLaunchResponse

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/desktoplaunchresponse.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/desktoplaunchresponse
> Description: HTTP API schema for DesktopLaunchResponse.

---
```json
{
  "type": "object",
  "required": [
    "processId"
  ],
  "properties": {
    "pid": {
      "type": "integer",
      "format": "int32",
      "nullable": true,
      "minimum": 0
    },
    "processId": {
      "type": "string"
    },
    "windowId": {
      "type": "string",
      "nullable": true
    }
  }
}
```
