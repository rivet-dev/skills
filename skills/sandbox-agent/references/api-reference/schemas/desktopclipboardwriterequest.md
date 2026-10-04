# DesktopClipboardWriteRequest

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/desktopclipboardwriterequest.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/desktopclipboardwriterequest
> Description: HTTP API schema for DesktopClipboardWriteRequest.

---
```json
{
  "type": "object",
  "required": [
    "text"
  ],
  "properties": {
    "selection": {
      "type": "string",
      "nullable": true
    },
    "text": {
      "type": "string"
    }
  }
}
```
