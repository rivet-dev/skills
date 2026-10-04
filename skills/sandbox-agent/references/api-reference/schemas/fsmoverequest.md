# FsMoveRequest

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/fsmoverequest.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/fsmoverequest
> Description: HTTP API schema for FsMoveRequest.

---
```json
{
  "type": "object",
  "required": [
    "from",
    "to"
  ],
  "properties": {
    "from": {
      "type": "string"
    },
    "overwrite": {
      "type": "boolean",
      "nullable": true
    },
    "to": {
      "type": "string"
    }
  }
}
```
