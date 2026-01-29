# CORS Configuration

> Source: `docs/cors.mdx`
> Canonical URL: https://sandboxagent.dev/docs/cors
> Description: Configure CORS for browser-based applications.

---
When calling the Sandbox Agent server from a browser, CORS (Cross-Origin Resource Sharing) controls which origins can make requests.

## Default Behavior

By default, the server allows CORS requests from the [Inspector](https://inspect.sandboxagent.dev):

```bash
# Inspector CORS is enabled by default
sandbox-agent server --token "$SANDBOX_TOKEN"
```

This allows you to use the hosted Inspector to connect to any running Sandbox Agent server without additional configuration.

## Adding Origins

Use `--cors-allow-origin` to allow additional origins. These are **cumulative** with the default Inspector origin:

```bash
# Allows both Inspector AND localhost:5173
sandbox-agent server \
  --token "$SANDBOX_TOKEN" \
  --cors-allow-origin "http://localhost:5173"
```

## Options

| Flag | Description |
|------|-------------|
| `--cors-allow-origin` | Additional origins to allow (cumulative with Inspector) |
| `--cors-allow-method` | HTTP methods to allow (defaults to all if not specified) |
| `--cors-allow-header` | Headers to allow (defaults to all if not specified) |
| `--cors-allow-credentials` | Allow credentials (cookies, authorization headers) |
| `--no-inspector-cors` | Disable the default Inspector origin |

## Disabling Inspector CORS

To disable the default Inspector origin and only allow explicitly specified origins:

```bash
# Only allows localhost:5173, not Inspector
sandbox-agent server \
  --token "$SANDBOX_TOKEN" \
  --no-inspector-cors \
  --cors-allow-origin "http://localhost:5173"
```

## Multiple Origins

Specify the flag multiple times to allow multiple origins:

```bash
sandbox-agent server \
  --token "$SANDBOX_TOKEN" \
  --cors-allow-origin "http://localhost:5173" \
  --cors-allow-origin "http://localhost:3000"
```

## Restricting Methods and Headers

By default, all methods and headers are allowed. To restrict them:

```bash
sandbox-agent server \
  --token "$SANDBOX_TOKEN" \
  --cors-allow-origin "https://your-app.com" \
  --cors-allow-method "GET" \
  --cors-allow-method "POST" \
  --cors-allow-header "Authorization" \
  --cors-allow-header "Content-Type" \
  --cors-allow-credentials
```
