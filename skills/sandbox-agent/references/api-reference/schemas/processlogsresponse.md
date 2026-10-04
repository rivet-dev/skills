# ProcessLogsResponse

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/processlogsresponse.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/processlogsresponse
> Description: HTTP API schema for ProcessLogsResponse.

---
```json
{
  "type": "object",
  "required": [
    "processId",
    "stream",
    "entries"
  ],
  "properties": {
    "entries": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/ProcessLogEntry"
      }
    },
    "processId": {
      "type": "string"
    },
    "stream": {
      "$ref": "#/components/schemas/ProcessLogsStream"
    }
  }
}
```

Related schemas: [ProcessLogEntry](/sandbox-agent/docs/api-reference/schemas/processlogentry/), [ProcessLogsStream](/sandbox-agent/docs/api-reference/schemas/processlogsstream/).
