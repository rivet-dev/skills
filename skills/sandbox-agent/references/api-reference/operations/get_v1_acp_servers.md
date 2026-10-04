# get_v1_acp_servers

> Source: `sandbox-agent/docs/content/docs/api-reference/operations/get_v1_acp_servers.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/operations/get_v1_acp_servers
> Description: GET /v1/acp: request parameters and responses.

---
`GET /v1/acp`

## Responses

### 200

Active ACP server instances

Content type: `application/json`

```json
{
  "schema": {
    "$ref": "#/components/schemas/AcpServerListResponse"
  }
}
```

Related schemas: [AcpServerListResponse](/sandbox-agent/docs/api-reference/schemas/acpserverlistresponse/).
