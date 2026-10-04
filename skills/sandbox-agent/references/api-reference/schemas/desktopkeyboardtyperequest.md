# DesktopKeyboardTypeRequest

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/desktopkeyboardtyperequest.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/desktopkeyboardtyperequest
> Description: HTTP API schema for DesktopKeyboardTypeRequest.

---
```json
{
  "type": "object",
  "required": [
    "text"
  ],
  "properties": {
    "delayMs": {
      "type": "integer",
      "format": "int32",
      "nullable": true,
      "minimum": 0
    },
    "text": {
      "type": "string"
    }
  }
}
```
