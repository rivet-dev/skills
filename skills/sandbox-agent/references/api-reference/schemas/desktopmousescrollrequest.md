# DesktopMouseScrollRequest

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/desktopmousescrollrequest.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/desktopmousescrollrequest
> Description: HTTP API schema for DesktopMouseScrollRequest.

---
```json
{
  "type": "object",
  "required": [
    "x",
    "y"
  ],
  "properties": {
    "deltaX": {
      "type": "integer",
      "format": "int32",
      "nullable": true
    },
    "deltaY": {
      "type": "integer",
      "format": "int32",
      "nullable": true
    },
    "x": {
      "type": "integer",
      "format": "int32"
    },
    "y": {
      "type": "integer",
      "format": "int32"
    }
  }
}
```
