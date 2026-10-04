# Get process runtime configuration.

> Source: `sandbox-agent/docs/content/docs/api-reference/operations/get_v1_processes_config.mdx`
> Canonical URL: https://rivet.dev/sandbox-agent/docs/api-reference/operations/get_v1_processes_config
> Description: GET /v1/processes/config: request parameters and responses.

---
`GET /v1/processes/config`

Returns the current runtime configuration for the process management API,
including limits for concurrency, timeouts, and buffer sizes.

## Responses

### 200

Current runtime process config

Content type: `application/json`

```json
{
  "schema": {
    "$ref": "#/components/schemas/ProcessConfig"
  }
}
```

Related schemas: [ProcessConfig](/sandbox-agent/docs/api-reference/schemas/processconfig/).

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
