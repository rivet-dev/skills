# FsDeleteQuery

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/fsdeletequery.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/fsdeletequery
> Description: HTTP API schema for FsDeleteQuery.

---
```json
{
  "type": "object",
  "required": [
    "path"
  ],
  "properties": {
    "path": {
      "type": "string"
    },
    "recursive": {
      "type": "boolean",
      "nullable": true
    }
  }
}
```
