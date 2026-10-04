# ProcessConfig

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/processconfig.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/processconfig
> Description: HTTP API schema for ProcessConfig.

---
```json
{
  "type": "object",
  "required": [
    "maxConcurrentProcesses",
    "defaultRunTimeoutMs",
    "maxRunTimeoutMs",
    "maxOutputBytes",
    "maxLogBytesPerProcess",
    "maxInputBytesPerRequest"
  ],
  "properties": {
    "defaultRunTimeoutMs": {
      "type": "integer",
      "format": "int64",
      "minimum": 0
    },
    "maxConcurrentProcesses": {
      "type": "integer",
      "minimum": 0
    },
    "maxInputBytesPerRequest": {
      "type": "integer",
      "minimum": 0
    },
    "maxLogBytesPerProcess": {
      "type": "integer",
      "minimum": 0
    },
    "maxOutputBytes": {
      "type": "integer",
      "minimum": 0
    },
    "maxRunTimeoutMs": {
      "type": "integer",
      "format": "int64",
      "minimum": 0
    }
  }
}
```
