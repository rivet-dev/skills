# Open a file or URL with the default handler.

> Source: `sandbox-agent/docs/content/docs/api-reference/operations/post_v1_desktop_open.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/operations/post_v1_desktop_open
> Description: POST /v1/desktop/open: request parameters and responses.

---
`POST /v1/desktop/open`

Opens a file path or URL using xdg-open on the managed desktop.

## Request body

Required.

### application/json

```json
{
  "schema": {
    "$ref": "#/components/schemas/DesktopOpenRequest"
  }
}
```

Related schemas: [DesktopOpenRequest](/sandbox-agent/docs/api-reference/schemas/desktopopenrequest/).

## Responses

### 200

Target opened

Content type: `application/json`

```json
{
  "schema": {
    "$ref": "#/components/schemas/DesktopOpenResponse"
  }
}
```

Related schemas: [DesktopOpenResponse](/sandbox-agent/docs/api-reference/schemas/desktopopenresponse/).

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
