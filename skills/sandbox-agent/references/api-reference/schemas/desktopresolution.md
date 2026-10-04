# DesktopResolution

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/desktopresolution.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/desktopresolution
> Description: HTTP API schema for DesktopResolution.

---
```json
{
  "type": "object",
  "required": [
    "width",
    "height"
  ],
  "properties": {
    "dpi": {
      "type": "integer",
      "format": "int32",
      "nullable": true,
      "minimum": 0
    },
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
