# Deploying to Railway

> Source: `src/content/docs/deploy/railway.mdx`
> Canonical URL: https://rivet.dev/docs/deploy/railway
> Description: Deploy your RivetKit app to Railway.

---
## Steps

### Prerequisites

- [Railway account](https://railway.app)
- Your RivetKit app
  - If you don't have one, see the [Quickstart](/docs/actors/quickstart) page or our [Examples](https://github.com/rivet-dev/rivet/tree/main/examples)
- Access to the [Rivet Cloud](https://dashboard.rivet.dev/) or a [self-hosted Rivet Engine](/docs/general/self-hosting)

### Deploy to Railway

1. Connect your GitHub account to Railway
2. Select your repository containing your RivetKit app
3. Railway will automatically detect and deploy your app

See [Railway's deployment docs](https://docs.railway.com/quick-start) for more details.

### Set Environment Variables

After creating your project on the Rivet dashboard, select Railway as your provider. You'll be provided `RIVET_ENDPOINT` and `RIVET_PUBLIC_ENDPOINT` environment variables to add to your Railway service.

See [Railway's environment variables docs](https://docs.railway.com/guides/variables#service-variables) for more details.

### Connect to Rivet

There is nothing to register in the dashboard. As a Runner, your app opens a connection out to Rivet on startup, so it does not need a public domain or a URL pasted into a connect form.

Once your Railway service is running, open the Rivet dashboard and confirm your app appears under **Runners**. It reconnects automatically if the connection drops.

### Configure Multi-Region (Optional)

[Configure Multi-Region](https://docs.railway.com/reference/deployment-regions) to deploy closer to your users.

Do not enable [App Sleeping](https://docs.railway.com/reference/app-sleeping) for a Runner. Sleeping suspends the process, which drops its connection to Rivet, and Railway only wakes on inbound HTTP. Runner traffic is outbound, so the service would never wake and actors could not be scheduled to it.

_Source doc path: /docs/deploy/railway_
