# Stop the private desktop runtime.

> Source: `sandbox-agent/docs/content/docs/api-reference/operations/post_v1_desktop_stop.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/operations/post_v1_desktop_stop
> Description: POST /v1/desktop/stop: request parameters and responses.

---
`POST /v1/desktop/stop`

Terminates the managed openbox/Xvfb/dbus processes owned by the desktop
runtime and returns the resulting status snapshot.

## Responses

### 200

Desktop runtime status after stop

Content type: `application/json`

```json
{
  "schema": {
    "$ref": "#/components/schemas/DesktopStatusResponse"
  }
}
```

Related schemas: [DesktopStatusResponse](/sandbox-agent/docs/api-reference/schemas/desktopstatusresponse/).

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
