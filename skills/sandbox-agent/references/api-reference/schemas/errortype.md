# ErrorType

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/errortype.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/errortype
> Description: HTTP API schema for ErrorType.

---
```json
{
  "type": "string",
  "enum": [
    "invalid_request",
    "conflict",
    "unsupported_agent",
    "agent_not_installed",
    "install_failed",
    "agent_process_exited",
    "token_invalid",
    "permission_denied",
    "not_acceptable",
    "unsupported_media_type",
    "not_found",
    "session_not_found",
    "session_already_exists",
    "mode_not_supported",
    "stream_error",
    "timeout"
  ]
}
```
