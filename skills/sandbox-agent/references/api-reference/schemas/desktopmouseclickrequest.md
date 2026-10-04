# DesktopMouseClickRequest

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/desktopmouseclickrequest.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/desktopmouseclickrequest
> Description: HTTP API schema for DesktopMouseClickRequest.

---
```json
{
  "type": "object",
  "required": [
    "x",
    "y"
  ],
  "properties": {
    "button": {
      "allOf": [
        {
          "$ref": "#/components/schemas/DesktopMouseButton"
        }
      ],
      "nullable": true
    },
    "clickCount": {
      "type": "integer",
      "format": "int32",
      "nullable": true,
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

Related schemas: [DesktopMouseButton](/sandbox-agent/docs/api-reference/schemas/desktopmousebutton/).
