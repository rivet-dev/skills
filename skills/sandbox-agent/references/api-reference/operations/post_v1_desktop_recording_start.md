# Start desktop recording.

> Source: `sandbox-agent/docs/content/docs/api-reference/operations/post_v1_desktop_recording_start.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/operations/post_v1_desktop_recording_start
> Description: POST /v1/desktop/recording/start: request parameters and responses.

---
`POST /v1/desktop/recording/start`

Starts an ffmpeg x11grab recording against the managed desktop and returns
the created recording metadata.

## Request body

Required.

### application/json

```json
{
  "schema": {
    "$ref": "#/components/schemas/DesktopRecordingStartRequest"
  }
}
```

Related schemas: [DesktopRecordingStartRequest](/sandbox-agent/docs/api-reference/schemas/desktoprecordingstartrequest/).

## Responses

### 200

Desktop recording started

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

Desktop runtime is not ready or a recording is already active

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

Desktop recording failed

Content type: `application/json`

```json
{
  "schema": {
    "$ref": "#/components/schemas/ProblemDetails"
  }
}
```

Related schemas: [ProblemDetails](/sandbox-agent/docs/api-reference/schemas/problemdetails/).
