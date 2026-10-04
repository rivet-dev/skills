# FsEntry

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/fsentry.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/fsentry
> Description: HTTP API schema for FsEntry.

---
```json
{
  "type": "object",
  "required": [
    "name",
    "path",
    "entryType",
    "size"
  ],
  "properties": {
    "entryType": {
      "$ref": "#/components/schemas/FsEntryType"
    },
    "modified": {
      "type": "string",
      "nullable": true
    },
    "name": {
      "type": "string"
    },
    "path": {
      "type": "string"
    },
    "size": {
      "type": "integer",
      "format": "int64",
      "minimum": 0
    }
  }
}
```

Related schemas: [FsEntryType](/sandbox-agent/docs/api-reference/schemas/fsentrytype/).
