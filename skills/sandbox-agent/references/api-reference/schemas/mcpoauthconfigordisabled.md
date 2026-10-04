# McpOAuthConfigOrDisabled

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/mcpoauthconfigordisabled.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/mcpoauthconfigordisabled
> Description: HTTP API schema for McpOAuthConfigOrDisabled.

---
```json
{
  "oneOf": [
    {
      "$ref": "#/components/schemas/McpOAuthConfig"
    },
    {
      "type": "boolean"
    }
  ]
}
```

Related schemas: [McpOAuthConfig](/sandbox-agent/docs/api-reference/schemas/mcpoauthconfig/).
