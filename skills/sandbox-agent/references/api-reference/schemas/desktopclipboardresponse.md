# DesktopClipboardResponse

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/desktopclipboardresponse.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/desktopclipboardresponse
> Description: HTTP API schema for DesktopClipboardResponse.

---
```json
{
  "type": "object",
  "required": [
    "text",
    "selection"
  ],
  "properties": {
    "selection": {
      "type": "string"
    },
    "text": {
      "type": "string"
    }
  }
}
```
