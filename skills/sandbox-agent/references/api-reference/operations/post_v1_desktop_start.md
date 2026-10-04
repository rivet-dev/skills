# Start the private desktop runtime.

> Source: `sandbox-agent/docs/content/docs/api-reference/operations/post_v1_desktop_start.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/operations/post_v1_desktop_start
> Description: POST /v1/desktop/start: request parameters and responses.

---
`POST /v1/desktop/start`

Lazily launches the managed Xvfb/openbox stack, validates display health,
and returns the resulting desktop status snapshot.

## Request body

Required.

### application/json

```json
{
  "schema": {
    "$ref": "#/components/schemas/DesktopStartRequest"
  }
}
```

Related schemas: [DesktopStartRequest](/sandbox-agent/docs/api-reference/schemas/desktopstartrequest/).

## Responses

### 200

Desktop runtime status after start

Content type: `application/json`

```json
{
  "schema": {
    "$ref": "#/components/schemas/DesktopStatusResponse"
  }
}
```

Related schemas: [DesktopStatusResponse](/sandbox-agent/docs/api-reference/schemas/desktopstatusresponse/).

### 400

Invalid desktop start request

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

Desktop runtime is already transitioning

Content type: `application/json`

```json
{
  "schema": {
    "$ref": "#/components/schemas/ProblemDetails"
  }
}
```

Related schemas: [ProblemDetails](/sandbox-agent/docs/api-reference/schemas/problemdetails/).

### 501

Desktop API unsupported on this platform

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

Desktop runtime could not be started

Content type: `application/json`

```json
{
  "schema": {
    "$ref": "#/components/schemas/ProblemDetails"
  }
}
```

Related schemas: [ProblemDetails](/sandbox-agent/docs/api-reference/schemas/problemdetails/).
