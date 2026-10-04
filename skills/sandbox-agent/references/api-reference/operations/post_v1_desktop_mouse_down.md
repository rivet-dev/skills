# Press and hold a desktop mouse button.

> Source: `sandbox-agent/docs/content/docs/api-reference/operations/post_v1_desktop_mouse_down.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/operations/post_v1_desktop_mouse_down
> Description: POST /v1/desktop/mouse/down: request parameters and responses.

---
`POST /v1/desktop/mouse/down`

Performs a health-gated optional pointer move followed by `xdotool mousedown`
and returns the resulting mouse position.

## Request body

Required.

### application/json

```json
{
  "schema": {
    "$ref": "#/components/schemas/DesktopMouseDownRequest"
  }
}
```

Related schemas: [DesktopMouseDownRequest](/sandbox-agent/docs/api-reference/schemas/desktopmousedownrequest/).

## Responses

### 200

Desktop mouse position after button press

Content type: `application/json`

```json
{
  "schema": {
    "$ref": "#/components/schemas/DesktopMousePositionResponse"
  }
}
```

Related schemas: [DesktopMousePositionResponse](/sandbox-agent/docs/api-reference/schemas/desktopmousepositionresponse/).

### 400

Invalid mouse down request

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

### 502

Desktop runtime health or input failed

Content type: `application/json`

```json
{
  "schema": {
    "$ref": "#/components/schemas/ProblemDetails"
  }
}
```

Related schemas: [ProblemDetails](/sandbox-agent/docs/api-reference/schemas/problemdetails/).
