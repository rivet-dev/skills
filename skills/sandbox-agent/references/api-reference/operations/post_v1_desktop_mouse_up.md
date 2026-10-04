# Release a desktop mouse button.

> Source: `sandbox-agent/docs/content/docs/api-reference/operations/post_v1_desktop_mouse_up.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/operations/post_v1_desktop_mouse_up
> Description: POST /v1/desktop/mouse/up: request parameters and responses.

---
`POST /v1/desktop/mouse/up`

Performs a health-gated optional pointer move followed by `xdotool mouseup`
and returns the resulting mouse position.

## Request body

Required.

### application/json

```json
{
  "schema": {
    "$ref": "#/components/schemas/DesktopMouseUpRequest"
  }
}
```

Related schemas: [DesktopMouseUpRequest](/sandbox-agent/docs/api-reference/schemas/desktopmouseuprequest/).

## Responses

### 200

Desktop mouse position after button release

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

Invalid mouse up request

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
