# Get desktop runtime status.

> Source: `sandbox-agent/docs/content/docs/api-reference/operations/get_v1_desktop_status.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/operations/get_v1_desktop_status
> Description: GET /v1/desktop/status: request parameters and responses.

---
`GET /v1/desktop/status`

Returns the current desktop runtime state, dependency status, active
display metadata, and supervised process information.

## Responses

### 200

Desktop runtime status

Content type: `application/json`

```json
{
  "schema": {
    "$ref": "#/components/schemas/DesktopStatusResponse"
  }
}
```

Related schemas: [DesktopStatusResponse](/sandbox-agent/docs/api-reference/schemas/desktopstatusresponse/).

### 401

Authentication required

Content type: `application/json`

```json
{
  "schema": {
    "$ref": "#/components/schemas/ProblemDetails"
  }
}
```

Related schemas: [ProblemDetails](/sandbox-agent/docs/api-reference/schemas/problemdetails/).
