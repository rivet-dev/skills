# AcpServerListResponse

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/acpserverlistresponse.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/acpserverlistresponse
> Description: HTTP API schema for AcpServerListResponse.

---
```json
{
  "type": "object",
  "required": [
    "servers"
  ],
  "properties": {
    "servers": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/AcpServerInfo"
      }
    }
  }
}
```

Related schemas: [AcpServerInfo](/sandbox-agent/docs/api-reference/schemas/acpserverinfo/).
