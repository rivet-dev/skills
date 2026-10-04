# DesktopWindowInfo

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/desktopwindowinfo.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/desktopwindowinfo
> Description: HTTP API schema for DesktopWindowInfo.

---
```json
{
  "type": "object",
  "required": [
    "id",
    "title",
    "x",
    "y",
    "width",
    "height",
    "isActive"
  ],
  "properties": {
    "height": {
      "type": "integer",
      "format": "int32",
      "minimum": 0
    },
    "id": {
      "type": "string"
    },
    "isActive": {
      "type": "boolean"
    },
    "title": {
      "type": "string"
    },
    "width": {
      "type": "integer",
      "format": "int32",
      "minimum": 0
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
