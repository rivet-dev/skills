# DesktopWindowMoveRequest

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/desktopwindowmoverequest.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/desktopwindowmoverequest
> Description: HTTP API schema for DesktopWindowMoveRequest.

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
