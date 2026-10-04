# DesktopOpenResponse

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/desktopopenresponse.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/desktopopenresponse
> Description: HTTP API schema for DesktopOpenResponse.

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
    }
  }
}
```
