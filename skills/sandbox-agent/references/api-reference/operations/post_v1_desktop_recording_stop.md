# Stop desktop recording.

> Source: `sandbox-agent/docs/content/docs/api-reference/operations/post_v1_desktop_recording_stop.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/operations/post_v1_desktop_recording_stop
> Description: POST /v1/desktop/recording/stop: request parameters and responses.

---
`POST /v1/desktop/recording/stop`

Stops the active desktop recording and returns the finalized recording
metadata.

## Responses

### 200

Desktop recording stopped

Content type: `application/json`

```json
{
  "schema": {
    "$ref": "#/components/schemas/DesktopRecordingInfo"
  }
}
```

Related schemas: [DesktopRecordingInfo](/sandbox-agent/docs/api-reference/schemas/desktoprecordinginfo/).

### 409

No active desktop recording

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

Desktop recording stop failed

Content type: `application/json`

```json
{
  "schema": {
    "$ref": "#/components/schemas/ProblemDetails"
  }
}
```

Related schemas: [ProblemDetails](/sandbox-agent/docs/api-reference/schemas/problemdetails/).
