# DesktopProcessInfo

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/desktopprocessinfo.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/desktopprocessinfo
> Description: HTTP API schema for DesktopProcessInfo.

---
```json
{
  "type": "object",
  "required": [
    "name",
    "running"
  ],
  "properties": {
    "logPath": {
      "type": "string",
      "nullable": true
    },
    "name": {
      "type": "string"
    },
    "pid": {
      "type": "integer",
      "format": "int32",
      "nullable": true,
      "minimum": 0
    },
    "running": {
      "type": "boolean"
    }
  }
}
```
