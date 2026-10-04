# AcpServerInfo

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/acpserverinfo.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/acpserverinfo
> Description: HTTP API schema for AcpServerInfo.

---
```json
{
  "type": "object",
  "required": [
    "serverId",
    "agent",
    "createdAtMs"
  ],
  "properties": {
    "agent": {
      "type": "string"
    },
    "createdAtMs": {
      "type": "integer",
      "format": "int64"
    },
    "serverId": {
      "type": "string"
    }
  }
}
```
