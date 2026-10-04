# ProcessLogEntry

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/processlogentry.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/processlogentry
> Description: HTTP API schema for ProcessLogEntry.

---
```json
{
  "type": "object",
  "required": [
    "sequence",
    "stream",
    "timestampMs",
    "data",
    "encoding"
  ],
  "properties": {
    "data": {
      "type": "string"
    },
    "encoding": {
      "type": "string"
    },
    "sequence": {
      "type": "integer",
      "format": "int64",
      "minimum": 0
    },
    "stream": {
      "$ref": "#/components/schemas/ProcessLogsStream"
    },
    "timestampMs": {
      "type": "integer",
      "format": "int64"
    }
  }
}
```

Related schemas: [ProcessLogsStream](/sandbox-agent/docs/api-reference/schemas/processlogsstream/).
