# Deploying to Cloudflare Workers

> Source: `src/content/docs/deploy/cloudflare.mdx`
> Canonical URL: https://rivet.dev/docs/deploy/cloudflare
> Description: Deploy an existing Rivet project to Cloudflare Workers.

---
This guide covers deploying an existing Rivet project to Cloudflare Workers.

## Prerequisites

- [Cloudflare account](https://dash.cloudflare.com/)
- [`wrangler`](https://developers.cloudflare.com/workers/wrangler/) configured for your account
- A Rivet namespace from the [Rivet Dashboard](https://dashboard.rivet.dev/) or a self-hosted Rivet Engine

## Steps

### Set up your project

Follow the [Cloudflare Workers Quickstart](/docs/actors/quickstart/cloudflare) to set up your project locally.

### Configure Wrangler

Set your Rivet connection values as Worker variables. Find `RIVET_ENDPOINT` and `RIVET_PUBLIC_ENDPOINT` in the [Rivet Dashboard](https://dashboard.rivet.dev/) under **Settings → Namespace → Advanced → Backend Configuration** and copy them in.

```toml wrangler.toml
name = "rivetkit-cloudflare"
main = "src/index.ts"
compatibility_date = "2025-04-01"
compatibility_flags = ["nodejs_compat"]

[vars]
RIVET_ENDPOINT = "https://your-namespace:sk_...@api.rivet.dev"
RIVET_PUBLIC_ENDPOINT = "https://your-namespace@api.rivet.dev"
```

### Deploy

```sh
npx wrangler deploy
```

### Register the Serverless Runner URL

After deploy, set the Worker URL with the `/api/rivet` path as the serverless runner URL in Rivet.

## Related

- [Cloudflare Workers Quickstart](/docs/actors/quickstart/cloudflare)
- [Deploying to Supabase Functions](/docs/deploy/supabase)
- [SQLite](/docs/actors/sqlite)

_Source doc path: /docs/deploy/cloudflare_
