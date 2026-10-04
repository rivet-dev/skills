# DesktopWindowResizeRequest

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/desktopwindowresizerequest.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/desktopwindowresizerequest
> Description: HTTP API schema for DesktopWindowResizeRequest.

---
```json
{
  "type": "object",
  "required": [
    "width",
    "height"
  ],
  "properties": {
    "height": {
      "type": "integer",
      "format": "int32",
      "minimum": 0
    },
    "width": {
      "type": "integer",
      "format": "int32",
      "minimum": 0
    }
  }
}
```
