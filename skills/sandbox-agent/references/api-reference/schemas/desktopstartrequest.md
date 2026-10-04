# DesktopStartRequest

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/desktopstartrequest.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/desktopstartrequest
> Description: HTTP API schema for DesktopStartRequest.

---
```json
{
  "type": "object",
  "properties": {
    "displayNum": {
      "type": "integer",
      "format": "int32",
      "nullable": true
    },
    "dpi": {
      "type": "integer",
      "format": "int32",
      "nullable": true,
      "minimum": 0
    },
    "height": {
      "type": "integer",
      "format": "int32",
      "nullable": true,
      "minimum": 0
    },
    "recordingFps": {
      "type": "integer",
      "format": "int32",
      "nullable": true,
      "minimum": 0
    },
    "stateDir": {
      "type": "string",
      "nullable": true
    },
    "streamAudioCodec": {
      "type": "string",
      "nullable": true
    },
    "streamFrameRate": {
      "type": "integer",
      "format": "int32",
      "nullable": true,
      "minimum": 0
    },
    "streamVideoCodec": {
      "type": "string",
      "nullable": true
    },
    "webrtcPortRange": {
      "type": "string",
      "nullable": true
    },
    "width": {
      "type": "integer",
      "format": "int32",
      "nullable": true,
      "minimum": 0
    }
  }
}
```
