# Get desktop stream status.

> Source: `sandbox-agent/docs/content/docs/api-reference/operations/get_v1_desktop_stream_status.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/operations/get_v1_desktop_stream_status
> Description: GET /v1/desktop/stream/status: request parameters and responses.

---
`GET /v1/desktop/stream/status`

Returns the current state of the desktop WebRTC streaming session.

## Responses

### 200

Desktop stream status

Content type: `application/json`

```json
{
  "schema": {
    "$ref": "#/components/schemas/DesktopStreamStatusResponse"
  }
}
```

Related schemas: [DesktopStreamStatusResponse](/sandbox-agent/docs/api-reference/schemas/desktopstreamstatusresponse/).
