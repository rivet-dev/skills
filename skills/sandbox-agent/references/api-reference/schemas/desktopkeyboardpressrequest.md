# DesktopKeyboardPressRequest

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/desktopkeyboardpressrequest.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/desktopkeyboardpressrequest
> Description: HTTP API schema for DesktopKeyboardPressRequest.

---
```json
{
  "type": "object",
  "required": [
    "key"
  ],
  "properties": {
    "key": {
      "type": "string"
    },
    "modifiers": {
      "allOf": [
        {
          "$ref": "#/components/schemas/DesktopKeyModifiers"
        }
      ],
      "nullable": true
    }
  }
}
```

Related schemas: [DesktopKeyModifiers](/sandbox-agent/docs/api-reference/schemas/desktopkeymodifiers/).
