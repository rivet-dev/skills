# DesktopMouseMoveRequest

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/desktopmousemoverequest.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/desktopmousemoverequest
> Description: HTTP API schema for DesktopMouseMoveRequest.

---
```json
{
  "type": "object",
  "required": [
    "x",
    "y"
  ],
  "properties": {
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
