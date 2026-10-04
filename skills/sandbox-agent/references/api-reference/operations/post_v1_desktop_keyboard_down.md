# Press and hold a desktop keyboard key.

> Source: `sandbox-agent/docs/content/docs/api-reference/operations/post_v1_desktop_keyboard_down.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/operations/post_v1_desktop_keyboard_down
> Description: POST /v1/desktop/keyboard/down: request parameters and responses.

---
`POST /v1/desktop/keyboard/down`

Performs a health-gated `xdotool keydown` operation against the managed
desktop.

## Request body

Required.

### application/json

```json
{
  "schema": {
    "$ref": "#/components/schemas/DesktopKeyboardDownRequest"
  }
}
```

Related schemas: [DesktopKeyboardDownRequest](/sandbox-agent/docs/api-reference/schemas/desktopkeyboarddownrequest/).

## Responses

### 200

Desktop keyboard action result

Content type: `application/json`

```json
{
  "schema": {
    "$ref": "#/components/schemas/DesktopActionResponse"
  }
}
```

Related schemas: [DesktopActionResponse](/sandbox-agent/docs/api-reference/schemas/desktopactionresponse/).

### 400

Invalid keyboard down request

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
