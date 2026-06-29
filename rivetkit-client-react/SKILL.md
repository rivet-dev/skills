---
name: "rivetkit-client-react"
description: "RivetKit React client guidance. Use for React apps that connect to Rivet Actors with @rivetkit/react, create hooks with createRivetKit, or manage realtime state with useActor."
---

# RivetKit React Client

Use this skill when building React apps that connect to Rivet Actors with `@rivetkit/react`.

## First Steps

1. Install the React client (latest: 2.3.2)
   ```bash
   npm install @rivetkit/react@2.3.2
   ```
2. Create hooks with `createRivetKit()` and connect with `useActor()`.

## Error Handling Policy

- Prefer fail-fast behavior by default.
- Avoid `try/catch` unless absolutely needed.
- If a `catch` is used, handle the error explicitly, at minimum by logging it.

## Getting Started

See the [React quickstart guide](/docs/actors/quickstart/react) for getting started.

## Install

## Minimal Client

## Stateless vs Stateful

## Getting Actors

## Connection Parameters

## Subscribing to Events

## Connection Lifecycle

## Low-Level HTTP & WebSocket

Use the JavaScript client for raw HTTP and WebSocket access:

```tsx @nocheck
import { createClient } from "rivetkit/client";

const client = createClient();
const handle = client.chatRoom.getOrCreate(["general"]);

const response = await handle.fetch("history");
const history = await response.json();

const ws = await handle.webSocket("stream");
ws.addEventListener("message", (event) => {
  console.log("message:", event.data);
});
ws.send("hello");
```

## Calling from Backend

Use the JavaScript client on your backend (Node.js/Bun). See the [JavaScript client docs](/docs/clients/javascript).

## Error Handling

## Concepts

### Keys

Keys uniquely identify actor instances. Use compound keys (arrays) for hierarchical addressing:

Don't build keys with string interpolation like `"org:${userId}"` when `userId` contains user data. Use arrays instead to prevent key injection attacks.

### Environment Variables

`createRivetKit()` (and the underlying `createClient()` instance) automatically read:

- `RIVET_ENDPOINT`
- `RIVET_NAMESPACE`
- `RIVET_TOKEN`
- `RIVET_RUNNER`

Defaults to `http://localhost:6420` when unset. RivetKit runs on port 6420 by default.

### Endpoint Format

Endpoints support URL auth syntax:

```
https://namespace:token@api.rivet.dev
```

You can also pass the endpoint without auth and provide `RIVET_NAMESPACE` and `RIVET_TOKEN` separately. For serverless deployments, use your app's `/api/rivet` URL. See [Endpoints](/docs/general/endpoints#url-auth-syntax) for details.

## API Reference

**Package:** [@rivetkit/react](https://www.npmjs.com/package/@rivetkit/react)

- [`createRivetKit`](/docs/clients/react) - Create hooks for React
- [`useActor`](/docs/clients/react) - Hook for actor instances

## Need More Than the Client?

If you need more about Rivet Actors, registries, or server-side RivetKit, add the main skill:

```bash
npx skills add rivet-dev/skills
```

Then use the `rivetkit` skill for backend guidance.

