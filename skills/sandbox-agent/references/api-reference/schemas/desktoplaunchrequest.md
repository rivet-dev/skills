# DesktopLaunchRequest

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/desktoplaunchrequest.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/desktoplaunchrequest
> Description: HTTP API schema for DesktopLaunchRequest.

---
```json
{
  "type": "object",
  "required": [
    "app"
  ],
  "properties": {
    "app": {
      "type": "string"
    },
    "args": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "nullable": true
    },
    "wait": {
      "type": "boolean",
      "nullable": true
    }
  }
}
```
