# Deploying to Supabase Functions

> Source: `src/content/docs/deploy/supabase.mdx`
> Canonical URL: https://rivet.dev/docs/deploy/supabase
> Description: Deploy an existing Rivet project to Supabase Edge Functions.

---
This guide covers deploying an existing Rivet project to Supabase Edge Functions.

## Prerequisites

- [Supabase project](https://supabase.com/)
- [Supabase CLI](https://supabase.com/docs/guides/cli) configured for your project
- A Rivet namespace from the [Rivet Dashboard](https://dashboard.rivet.dev/) or a self-hosted Rivet Engine

## Steps

### Set up your project

Follow the [Supabase Functions Quickstart](/docs/actors/quickstart/supabase) to set up your project locally.

### Set Secrets

Set your Rivet connection values as Supabase secrets. Find `RIVET_ENDPOINT` and `RIVET_PUBLIC_ENDPOINT` in the [Rivet Dashboard](https://dashboard.rivet.dev/) under **Settings → Namespace → Advanced → Backend Configuration** and copy them in.

```sh
npx supabase secrets set \
  RIVET_ENDPOINT=https://your-namespace:sk_...@api.rivet.dev \
  RIVET_PUBLIC_ENDPOINT=https://your-namespace@api.rivet.dev
```

### Deploy

```sh
npx supabase functions deploy rivet
```

### Register the Serverless Runner URL

After deploy, set the function URL with the `/api/rivet` path as the serverless runner URL in Rivet. For a function named `rivet`, this is usually `https://your-project.functions.supabase.co/functions/v1/rivet/api/rivet`.

## Related

- [Supabase Functions Quickstart](/docs/actors/quickstart/supabase)
- [Deploying to Cloudflare Workers](/docs/deploy/cloudflare)
- [SQLite](/docs/actors/sqlite)

_Source doc path: /docs/deploy/supabase_
