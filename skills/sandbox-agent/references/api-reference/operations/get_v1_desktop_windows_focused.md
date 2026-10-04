# Get the currently focused desktop window.

> Source: `sandbox-agent/docs/content/docs/api-reference/operations/get_v1_desktop_windows_focused.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/operations/get_v1_desktop_windows_focused
> Description: GET /v1/desktop/windows/focused: request parameters and responses.

---
`GET /v1/desktop/windows/focused`

Returns information about the window that currently has input focus.

## Responses

### 200

Focused window info

Content type: `application/json`

```json
{
  "schema": {
    "$ref": "#/components/schemas/DesktopWindowInfo"
  }
}
```

Related schemas: [DesktopWindowInfo](/sandbox-agent/docs/api-reference/schemas/desktopwindowinfo/).

### 404

No window is focused

Content type: `application/json`

```json
{
  "schema": {
    "$ref": "#/components/schemas/ProblemDetails"
  }
}
```

Related schemas: [ProblemDetails](/sandbox-agent/docs/api-reference/schemas/problemdetails/).

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
