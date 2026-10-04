# ProcessRunResponse

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/processrunresponse.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/processrunresponse
> Description: HTTP API schema for ProcessRunResponse.

---
```json
{
  "type": "object",
  "required": [
    "timedOut",
    "stdout",
    "stderr",
    "stdoutTruncated",
    "stderrTruncated",
    "durationMs"
  ],
  "properties": {
    "durationMs": {
      "type": "integer",
      "format": "int64",
      "minimum": 0
    },
    "exitCode": {
      "type": "integer",
      "format": "int32",
      "nullable": true
    },
    "stderr": {
      "type": "string"
    },
    "stderrTruncated": {
      "type": "boolean"
    },
    "stdout": {
      "type": "string"
    },
    "stdoutTruncated": {
      "type": "boolean"
    },
    "timedOut": {
      "type": "boolean"
    }
  }
}
```
