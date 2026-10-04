# ProcessListResponse

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/processlistresponse.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/processlistresponse
> Description: HTTP API schema for ProcessListResponse.

---
```json
{
  "type": "object",
  "required": [
    "processes"
  ],
  "properties": {
    "processes": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/ProcessInfo"
      }
    }
  }
}
```

Related schemas: [ProcessInfo](/sandbox-agent/docs/api-reference/schemas/processinfo/).
