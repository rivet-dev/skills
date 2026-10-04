# post_v1_fs_move

> Source: `sandbox-agent/docs/content/docs/api-reference/operations/post_v1_fs_move.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/operations/post_v1_fs_move
> Description: POST /v1/fs/move: request parameters and responses.

---
`POST /v1/fs/move`

## Request body

Required.

### application/json

```json
{
  "schema": {
    "$ref": "#/components/schemas/FsMoveRequest"
  }
}
```

Related schemas: [FsMoveRequest](/sandbox-agent/docs/api-reference/schemas/fsmoverequest/).

## Responses

### 200

Move result

Content type: `application/json`

```json
{
  "schema": {
    "$ref": "#/components/schemas/FsMoveResponse"
  }
}
```

Related schemas: [FsMoveResponse](/sandbox-agent/docs/api-reference/schemas/fsmoveresponse/).
