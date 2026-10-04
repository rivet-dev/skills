# AcpEnvelope

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/acpenvelope.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/acpenvelope
> Description: HTTP API schema for AcpEnvelope.

---
```json
{
  "type": "object",
  "required": [
    "jsonrpc"
  ],
  "properties": {
    "error": {
      "nullable": true
    },
    "id": {
      "nullable": true
    },
    "jsonrpc": {
      "type": "string"
    },
    "method": {
      "type": "string",
      "nullable": true
    },
    "params": {
      "nullable": true
    },
    "result": {
      "nullable": true
    }
  }
}
```
