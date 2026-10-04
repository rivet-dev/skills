# Delete a process record.

> Source: `sandbox-agent/docs/content/docs/api-reference/operations/delete_v1_process.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/operations/delete_v1_process
> Description: DELETE /v1/processes/{id}: request parameters and responses.

---
`DELETE /v1/processes/{id}`

Removes a stopped process from the runtime. Returns 409 if the process
is still running; stop or kill it first.

## Parameters

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `id` | path | Yes | string | Process ID |

### Parameter schemas

```json
[
  {
    "name": "id",
    "in": "path",
    "description": "Process ID",
    "required": true,
    "schema": {
      "type": "string"
    }
  }
]
```

## Responses

### 204

Process deleted

### 404

Unknown process

Content type: `application/json`

```json
{
  "schema": {
    "$ref": "#/components/schemas/ProblemDetails"
  }
}
```

Related schemas: [ProblemDetails](/sandbox-agent/docs/api-reference/schemas/problemdetails/).

### 409

Process is still running

Content type: `application/json`

```json
{
  "schema": {
    "$ref": "#/components/schemas/ProblemDetails"
  }
}
```

Related schemas: [ProblemDetails](/sandbox-agent/docs/api-reference/schemas/problemdetails/).

### 501

Process API unsupported on this platform

Content type: `application/json`

```json
{
  "schema": {
    "$ref": "#/components/schemas/ProblemDetails"
  }
}
```

Related schemas: [ProblemDetails](/sandbox-agent/docs/api-reference/schemas/problemdetails/).
