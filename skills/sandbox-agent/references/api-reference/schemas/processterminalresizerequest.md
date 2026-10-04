# ProcessTerminalResizeRequest

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/processterminalresizerequest.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/processterminalresizerequest
> Description: HTTP API schema for ProcessTerminalResizeRequest.

---
```json
{
  "type": "object",
  "required": [
    "cols",
    "rows"
  ],
  "properties": {
    "cols": {
      "type": "integer",
      "format": "int32",
      "minimum": 0
    },
    "rows": {
      "type": "integer",
      "format": "int32",
      "minimum": 0
    }
  }
}
```
