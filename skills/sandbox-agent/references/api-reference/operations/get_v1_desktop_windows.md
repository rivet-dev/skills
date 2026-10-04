# List visible desktop windows.

> Source: `sandbox-agent/docs/content/docs/api-reference/operations/get_v1_desktop_windows.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/operations/get_v1_desktop_windows
> Description: GET /v1/desktop/windows: request parameters and responses.

---
`GET /v1/desktop/windows`

Performs a health-gated visible-window enumeration against the managed
desktop and returns the current window metadata.

## Responses

### 200

Visible desktop windows

Content type: `application/json`

```json
{
  "schema": {
    "$ref": "#/components/schemas/DesktopWindowListResponse"
  }
}
```

Related schemas: [DesktopWindowListResponse](/sandbox-agent/docs/api-reference/schemas/desktopwindowlistresponse/).

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

### 503

Desktop runtime health or window query failed

Content type: `application/json`

```json
{
  "schema": {
    "$ref": "#/components/schemas/ProblemDetails"
  }
}
```

Related schemas: [ProblemDetails](/sandbox-agent/docs/api-reference/schemas/problemdetails/).
