# Cross-Origin Resource Sharing

> Source: `src/content/docs/general/cors.mdx`
> Canonical URL: https://rivet.dev/docs/general/cors
> Description: Cross-Origin Resource Sharing (CORS) controls which origins (domains) can access your actors. When actors are exposed to the public internet, proper origin validation is critical to prevent security breaches and denial of service attacks.

---
Unlike stateless HTTP APIs that use CORS headers, Rivet Actors are stateful and support persistent WebSocket connections. Since WebSockets don't natively support CORS, we validate origins manually in the `onBeforeConnect` hook before connections may open.

## Implementing Origin Restrictions

To implement origin restrictions on Rivet Actors, use the `onBeforeConnect` hook to verify the request.

To catch the error on the client, use the following code:

	See tracking issue for [configuring CORS per-actor on the gateway](https://github.com/rivet-dev/rivet/issues/3539) that will remove the need to implement origin restrictions in `onBforeRequest`.

_Source doc path: /docs/general/cors_
