# Write to the desktop clipboard.

> Source: `sandbox-agent/docs/content/docs/api-reference/operations/post_v1_desktop_clipboard.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/operations/post_v1_desktop_clipboard
> Description: POST /v1/desktop/clipboard: request parameters and responses.

---
`POST /v1/desktop/clipboard`

Sets the text content of the X11 clipboard.

## Request body

Required.

### application/json

```json
{
  "schema": {
    "$ref": "#/components/schemas/DesktopClipboardWriteRequest"
  }
}
```

Related schemas: [DesktopClipboardWriteRequest](/sandbox-agent/docs/api-reference/schemas/desktopclipboardwriterequest/).

## Responses

### 200

Clipboard updated

Content type: `application/json`

```json
{
  "schema": {
    "$ref": "#/components/schemas/DesktopActionResponse"
  }
}
```

Related schemas: [DesktopActionResponse](/sandbox-agent/docs/api-reference/schemas/desktopactionresponse/).

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

### 500

Clipboard write failed

Content type: `application/json`

```json
{
  "schema": {
    "$ref": "#/components/schemas/ProblemDetails"
  }
}
```

Related schemas: [ProblemDetails](/sandbox-agent/docs/api-reference/schemas/problemdetails/).
