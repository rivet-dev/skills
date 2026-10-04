# get_v1_health

> Source: `sandbox-agent/docs/content/docs/api-reference/operations/get_v1_health.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/operations/get_v1_health
> Description: GET /v1/health: request parameters and responses.

---
`GET /v1/health`

## Responses

### 200

Service health response

Content type: `application/json`

```json
{
  "schema": {
    "$ref": "#/components/schemas/HealthResponse"
  }
}
```

Related schemas: [HealthResponse](/sandbox-agent/docs/api-reference/schemas/healthresponse/).
