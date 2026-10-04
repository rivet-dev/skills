# DesktopScreenshotQuery

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/desktopscreenshotquery.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/desktopscreenshotquery
> Description: HTTP API schema for DesktopScreenshotQuery.

---
```json
{
  "type": "object",
  "properties": {
    "format": {
      "allOf": [
        {
          "$ref": "#/components/schemas/DesktopScreenshotFormat"
        }
      ],
      "nullable": true
    },
    "quality": {
      "type": "integer",
      "format": "int32",
      "nullable": true,
      "minimum": 0
    },
    "scale": {
      "type": "number",
      "format": "float",
      "nullable": true
    },
    "showCursor": {
      "type": "boolean",
      "nullable": true
    }
  }
}
```

Related schemas: [DesktopScreenshotFormat](/sandbox-agent/docs/api-reference/schemas/desktopscreenshotformat/).
