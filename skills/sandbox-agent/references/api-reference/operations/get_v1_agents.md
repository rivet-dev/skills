# get_v1_agents

> Source: `sandbox-agent/docs/content/docs/api-reference/operations/get_v1_agents.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/operations/get_v1_agents
> Description: GET /v1/agents: request parameters and responses.

---
`GET /v1/agents`

## Parameters

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `config` | query | No | boolean | When true, include version/path/configOptions (slower) |
| `no_cache` | query | No | boolean | When true, bypass version cache |

### Parameter schemas

```json
[
  {
    "name": "config",
    "in": "query",
    "description": "When true, include version/path/configOptions (slower)",
    "required": false,
    "schema": {
      "type": "boolean",
      "nullable": true
    }
  },
  {
    "name": "no_cache",
    "in": "query",
    "description": "When true, bypass version cache",
    "required": false,
    "schema": {
      "type": "boolean",
      "nullable": true
    }
  }
]
```

## Responses

### 200

List of v1 agents

Content type: `application/json`

```json
{
  "schema": {
    "$ref": "#/components/schemas/AgentListResponse"
  }
}
```

Related schemas: [AgentListResponse](/sandbox-agent/docs/api-reference/schemas/agentlistresponse/).

### 401

Authentication required

Content type: `application/json`

```json
{
  "schema": {
    "$ref": "#/components/schemas/ProblemDetails"
  }
}
```

Related schemas: [ProblemDetails](/sandbox-agent/docs/api-reference/schemas/problemdetails/).
