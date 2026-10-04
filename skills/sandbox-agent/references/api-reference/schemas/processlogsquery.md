# ProcessLogsQuery

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/processlogsquery.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/processlogsquery
> Description: HTTP API schema for ProcessLogsQuery.

---
```json
{
  "type": "object",
  "properties": {
    "follow": {
      "type": "boolean",
      "nullable": true
    },
    "since": {
      "type": "integer",
      "format": "int64",
      "nullable": true,
      "minimum": 0
    },
    "stream": {
      "allOf": [
        {
          "$ref": "#/components/schemas/ProcessLogsStream"
        }
      ],
      "nullable": true
    },
    "tail": {
      "type": "integer",
      "nullable": true,
      "minimum": 0
    }
  }
}
```

Related schemas: [ProcessLogsStream](/sandbox-agent/docs/api-reference/schemas/processlogsstream/).
