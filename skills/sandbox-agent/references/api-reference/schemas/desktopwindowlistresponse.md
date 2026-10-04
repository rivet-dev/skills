# DesktopWindowListResponse

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/desktopwindowlistresponse.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/desktopwindowlistresponse
> Description: HTTP API schema for DesktopWindowListResponse.

---
```json
{
  "type": "object",
  "required": [
    "windows"
  ],
  "properties": {
    "windows": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/DesktopWindowInfo"
      }
    }
  }
}
```

Related schemas: [DesktopWindowInfo](/sandbox-agent/docs/api-reference/schemas/desktopwindowinfo/).
