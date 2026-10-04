# put_v1_config_skills

> Source: `sandbox-agent/docs/content/docs/api-reference/operations/put_v1_config_skills.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/operations/put_v1_config_skills
> Description: PUT /v1/config/skills: request parameters and responses.

---
`PUT /v1/config/skills`

## Parameters

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `directory` | query | Yes | string | Target directory |
| `skillName` | query | Yes | string | Skill entry name |

### Parameter schemas

```json
[
  {
    "name": "directory",
    "in": "query",
    "description": "Target directory",
    "required": true,
    "schema": {
      "type": "string"
    }
  },
  {
    "name": "skillName",
    "in": "query",
    "description": "Skill entry name",
    "required": true,
    "schema": {
      "type": "string"
    }
  }
]
```

## Request body

Required.

### application/json

```json
{
  "schema": {
    "$ref": "#/components/schemas/SkillsConfig"
  }
}
```

Related schemas: [SkillsConfig](/sandbox-agent/docs/api-reference/schemas/skillsconfig/).

## Responses

### 204

Stored
