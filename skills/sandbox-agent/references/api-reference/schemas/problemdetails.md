# ProblemDetails

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/problemdetails.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/problemdetails
> Description: HTTP API schema for ProblemDetails.

---
```json
{
  "type": "object",
  "required": [
    "type",
    "title",
    "status"
  ],
  "properties": {
    "detail": {
      "type": "string",
      "nullable": true
    },
    "instance": {
      "type": "string",
      "nullable": true
    },
    "status": {
      "type": "integer",
      "format": "int32",
      "minimum": 0
    },
    "title": {
      "type": "string"
    },
    "type": {
      "type": "string"
    }
  },
  "additionalProperties": {}
}
```
