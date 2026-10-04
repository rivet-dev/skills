# DesktopDisplayInfoResponse

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/desktopdisplayinforesponse.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/desktopdisplayinforesponse
> Description: HTTP API schema for DesktopDisplayInfoResponse.

---
```json
{
  "type": "object",
  "required": [
    "display",
    "resolution"
  ],
  "properties": {
    "display": {
      "type": "string"
    },
    "resolution": {
      "$ref": "#/components/schemas/DesktopResolution"
    }
  }
}
```

Related schemas: [DesktopResolution](/sandbox-agent/docs/api-reference/schemas/desktopresolution/).
