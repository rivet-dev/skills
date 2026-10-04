# Delete a desktop recording.

> Source: `sandbox-agent/docs/content/docs/api-reference/operations/delete_v1_desktop_recording.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/operations/delete_v1_desktop_recording
> Description: DELETE /v1/desktop/recordings/{id}: request parameters and responses.

---
`DELETE /v1/desktop/recordings/{id}`

Removes a completed desktop recording and its file from disk.

## Parameters

| Name | In | Required | Type | Description |
| --- | --- | --- | --- | --- |
| `id` | path | Yes | string | Desktop recording ID |

### Parameter schemas

```json
[
  {
    "name": "id",
    "in": "path",
    "description": "Desktop recording ID",
    "required": true,
    "schema": {
      "type": "string"
    }
  }
]
```

## Responses

### 204

Desktop recording deleted

### 404

Unknown desktop recording

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

Desktop recording is still active

Content type: `application/json`

```json
{
  "schema": {
    "$ref": "#/components/schemas/ProblemDetails"
  }
}
```

Related schemas: [ProblemDetails](/sandbox-agent/docs/api-reference/schemas/problemdetails/).
