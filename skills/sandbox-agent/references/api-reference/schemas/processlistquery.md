# ProcessListQuery

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/processlistquery.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/processlistquery
> Description: HTTP API schema for ProcessListQuery.

---
```json
{
  "type": "object",
  "properties": {
    "owner": {
      "allOf": [
        {
          "$ref": "#/components/schemas/ProcessOwner"
        }
      ],
      "nullable": true
    }
  }
}
```

Related schemas: [ProcessOwner](/sandbox-agent/docs/api-reference/schemas/processowner/).
