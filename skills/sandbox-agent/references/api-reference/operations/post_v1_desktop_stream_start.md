# Start desktop streaming.

> Source: `sandbox-agent/docs/content/docs/api-reference/operations/post_v1_desktop_stream_start.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/operations/post_v1_desktop_stream_start
> Description: POST /v1/desktop/stream/start: request parameters and responses.

---
`POST /v1/desktop/stream/start`

Enables desktop websocket streaming for the managed desktop.

## Responses

### 200

Desktop streaming started

Content type: `application/json`

```json
{
  "schema": {
    "$ref": "#/components/schemas/DesktopStreamStatusResponse"
  }
}
```

Related schemas: [DesktopStreamStatusResponse](/sandbox-agent/docs/api-reference/schemas/desktopstreamstatusresponse/).
