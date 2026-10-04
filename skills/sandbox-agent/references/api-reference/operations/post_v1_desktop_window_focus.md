# Focus a desktop window.

> Source: `sandbox-agent/docs/content/docs/api-reference/operations/post_v1_desktop_window_focus.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/operations/post_v1_desktop_window_focus
> Description: POST /v1/desktop/windows/{id}/focus: request parameters and responses.

---
`POST /v1/desktop/windows/{id}/focus`

Brings the specified window to the foreground and gives it input focus.

## Parameters

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `id` | path | Yes | string | X11 window ID |

### Parameter schemas

```json
[
  {
    "name": "id",
    "in": "path",
    "description": "X11 window ID",
    "required": true,
    "schema": {
      "type": "string"
    }
  }
]
```

## Responses

### 200

Window info after focus

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

Window not found

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
