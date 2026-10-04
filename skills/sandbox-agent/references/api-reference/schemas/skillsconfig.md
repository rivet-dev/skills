# SkillsConfig

> Source: `sandbox-agent/docs/content/docs/api-reference/schemas/skillsconfig.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/schemas/skillsconfig
> Description: HTTP API schema for SkillsConfig.

---
```json
{
  "type": "object",
  "required": [
    "sources"
  ],
  "properties": {
    "sources": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/SkillSource"
      }
    }
  }
}
```

Related schemas: [SkillSource](/sandbox-agent/docs/api-reference/schemas/skillsource/).
