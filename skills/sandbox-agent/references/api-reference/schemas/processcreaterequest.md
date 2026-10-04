# ProcessCreateRequest

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/processcreaterequest.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/processcreaterequest
> Description: HTTP API schema for ProcessCreateRequest.

---
```json
{
  "type": "object",
  "required": [
    "command"
  ],
  "properties": {
    "args": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "command": {
      "type": "string"
    },
    "cwd": {
      "type": "string",
      "nullable": true
    },
    "env": {
      "type": "object",
      "additionalProperties": {
        "type": "string"
      }
    },
    "interactive": {
      "type": "boolean"
    },
    "tty": {
      "type": "boolean"
    }
  }
}
```
