# The runner image

A cluster runs the app's Rivet Actors on its `default` runner pool, from a Docker image of the app. The image runs a RivetKit registry as a runner.

## Registry

- Configure the registry with `setup({ startEngine: false, startServices: false, runtime: "native", use: { ... } })` and call `registry.start()`.
- Do not set `envoy.poolName`. The cluster sets `RIVET_POOL` to the runner pool's name.
- Do not set `RIVET_ENDPOINT`, `RIVET_TOKEN` or `RIVET_ENVOY_VERSION` in the image. The cluster connects the runner to its engine and sets its version on every deploy, so the engine drains the old runners.

## HTTP

- `registry.start()` serves no HTTP. Start the app's own HTTP server on the port in the `PORT` environment variable, which is 8080. The pool's public URL forwards there, and without a listener it returns 521.
- Serve the runner's metrics from a second HTTP server on `127.0.0.1` at the port in the `RIVETKIT_METRICS_PORT` environment variable, which is 9464. Answer `GET /metrics` with `registry.routes.prometheusMetrics()`. The cluster ships them with the runner's logs. Keep this server off the public one.
- The pool's public URL serves the app's own HTTP server, not the Rivet API. Never use it as `RIVET_ENDPOINT`.

## Dockerfile

Build for `linux/amd64`. The saved image tarball must be 5 GiB or smaller.

Use this shape. The `rm -rf` drops parts of RivetKit's install a runner never uses, which otherwise make the image several GB and the deploy slow.

```dockerfile
FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund \
	&& rm -rf node_modules/@rivet-dev/agentos-* node_modules/@rivet-dev/agent-os-* node_modules/@agentos-software node_modules/@rivetkit/engine-cli-* \
	&& npm cache clean --force
COPY . .
ENV NODE_ENV=production
CMD ["node", "server.js"]
```

Run `npm install` once so `package-lock.json` exists. Adjust `COPY` and `CMD` to the app, and add a `.dockerignore` with `node_modules`, `*.tar` and `.env*`.
