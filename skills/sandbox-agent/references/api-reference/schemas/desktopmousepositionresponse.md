# DesktopMousePositionResponse

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/desktopmousepositionresponse.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/desktopmousepositionresponse
> Description: HTTP API schema for DesktopMousePositionResponse.

---
```json
{
  "type": "object",
  "required": [
    "x",
    "y"
  ],
  "properties": {
    "screen": {
      "type": "integer",
      "format": "int32",
      "nullable": true
    },
    "window": {
      "type": "string",
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
