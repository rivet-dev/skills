# Deploying to Vercel

> Source: `src/content/docs/deploy/vercel.mdx`
> Canonical URL: https://rivet.dev/docs/deploy/vercel
> Description: Deploy your Next.js Rivet app to Vercel.

---
This guide assumes a Next.js app.

## Prerequisites

- [Vercel account](https://vercel.com/)
- A Next.js Rivet app
- Access to the [Rivet Cloud](https://dashboard.rivet.dev/) or a [self-hosted Rivet Engine](/docs/general/self-hosting)

## Steps

### Set up your project

Follow the [Next.js Quickstart](/docs/actors/quickstart/next-js) to set up your project.

### Verify Your Project Structure

Your Next.js project should have the following structure:

- `src/app/api/rivet/[...all]/route.ts`: RivetKit route handler
- `src/rivet/registry.ts`: Actor definitions and registry

The route handler sets `maxDuration` to extend the serverless function timeout so long-lived actor requests are not cut short:

```ts src/app/api/rivet/[...all]/route.ts @nocheck
import { toNextHandler } from "@rivetkit/next-js";
import { registry } from "@/rivet/registry";

export const maxDuration = 300;

export const { GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS } = toNextHandler(registry);
```

### Set Environment Variables

Set `RIVET_ENDPOINT` and `RIVET_PUBLIC_ENDPOINT` in your Vercel project settings using the URL auth format:

```
RIVET_ENDPOINT=https://my-namespace:sk_****@api.rivet.dev
RIVET_PUBLIC_ENDPOINT=https://my-namespace:pk_****@api.rivet.dev
```

`RIVET_ENDPOINT` uses the secret token for server-side access. `RIVET_PUBLIC_ENDPOINT` uses the publishable token and tells the metadata endpoint what connection info to provide to clients.

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Vercel will deploy your app

### Configure Preview Deployments (Recommended)

Add a GitHub action to automatically create isolated Rivet namespaces for each PR:

1. Add these secrets to your GitHub repository:
   - `RIVET_CLOUD_TOKEN`: Get from [Rivet Dashboard](https://dashboard.rivet.dev) → Settings → Advanced → Cloud API Tokens
   - `VERCEL_TOKEN`: Get from [Vercel Account Settings](https://vercel.com/account/tokens)

2. Create `.github/workflows/rivet-preview.yml`:

```yaml
name: Rivet Preview

on:
  pull_request:
    types: [opened, synchronize, reopened]
  push:
    branches: [main]

concurrency:
  group: rivet-preview-${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: true

jobs:
  rivet-preview:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
    steps:
      - uses: rivet-dev/preview-namespace-action@v1
        with:
          platform: vercel
          rivet-token: ${{ secrets.RIVET_CLOUD_TOKEN }}
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

## Troubleshooting

```
Error: ENOENT: no such file or directory, mkdir '.../rivetkit/.../state'
```

**Cause:** The `RIVET_ENDPOINT` environment variable is not configured. RivetKit falls back to the file system driver, which fails in Vercel's read-only serverless environment.

**Solution:** Ensure `RIVET_ENDPOINT` is set with your Rivet endpoint using the URL auth format:

```
RIVET_ENDPOINT=https://my-namespace:sk_****@api.rivet.dev
```

If using the [preview-namespace-action](https://github.com/rivet-dev/preview-namespace-action), this is configured automatically.

The `/api/rivet/metadata` endpoint returns data but `clientEndpoint`, `clientNamespace`, and `clientToken` are missing.

**Cause:** The `RIVET_PUBLIC_ENDPOINT` environment variable is not configured. This tells the metadata endpoint what connection info to provide to clients.

**Solution:** Set `RIVET_PUBLIC_ENDPOINT` with the publishable token (for client access):

```
RIVET_PUBLIC_ENDPOINT=https://my-namespace:pk_****@api.rivet.dev
```

If using the [preview-namespace-action](https://github.com/rivet-dev/preview-namespace-action), this is configured automatically.

Rivet fails to connect to your Vercel deployment with a 401 error mentioning "Authentication Required".

**Cause:** [Vercel Deployment Protection](https://vercel.com/docs/security/deployment-protection) is blocking requests from Rivet.

**Solution:**

1. Create a bypass secret in your Vercel project settings
2. In Rivet, go to **Settings > Providers**
3. Click the three dots on your provider and select **Edit**
4. Click **Add Header** and add `x-vercel-protection-bypass` with your bypass secret

If using the [preview-namespace-action](https://github.com/rivet-dev/preview-namespace-action), this is configured automatically.

## Related

- [Next.js Quickstart](/docs/actors/quickstart/next-js)
- [Self-Hosting](/docs/general/self-hosting)

_Source doc path: /docs/deploy/vercel_
