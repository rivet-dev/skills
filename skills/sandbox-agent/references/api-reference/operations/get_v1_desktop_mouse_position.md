# Get the current desktop mouse position.

> Source: `sandbox-agent/docs/content/docs/api-reference/operations/get_v1_desktop_mouse_position.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/operations/get_v1_desktop_mouse_position
> Description: GET /v1/desktop/mouse/position: request parameters and responses.

---
`GET /v1/desktop/mouse/position`

Performs a health-gated mouse position query against the managed desktop.

## Responses

### 200

Desktop mouse position

Content type: `application/json`

```json
{
  "schema": {
    "$ref": "#/components/schemas/DesktopMousePositionResponse"
  }
}
```

Related schemas: [DesktopMousePositionResponse](/sandbox-agent/docs/api-reference/schemas/desktopmousepositionresponse/).

### 409

Desktop runtime is not ready

Content type: `application/json`

```json
{
  "schema": {
    "$ref": "#/components/schemas/ProblemDetails"
  }
}
```

Related schemas: [ProblemDetails](/sandbox-agent/docs/api-reference/schemas/problemdetails/).

### 502

Desktop runtime health or input check failed

Content type: `application/json`

```json
{
  "schema": {
    "$ref": "#/components/schemas/ProblemDetails"
  }
}
```

Related schemas: [ProblemDetails](/sandbox-agent/docs/api-reference/schemas/problemdetails/).
