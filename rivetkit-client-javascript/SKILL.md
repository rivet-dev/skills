---
name: "rivetkit-client-javascript"
description: "RivetKit JavaScript client guidance. Use for browser, Node.js, or Bun clients that connect to Rivet Actors with rivetkit/client, create clients, call actions, or manage connections."
---

# RivetKit JavaScript Client

Use this skill when building JavaScript clients (browser, Node.js, or Bun) that connect to Rivet Actors with `rivetkit/client`.

## First Steps

1. Install the client (latest: 2.3.2)
   ```bash
   npm install rivetkit@2.3.2
   ```
2. Create a client with `createClient()` and call actor actions.

## Error Handling Policy

- Prefer fail-fast behavior by default.
- Avoid `try/catch` unless absolutely needed.
- If a `catch` is used, handle the error explicitly, at minimum by logging it.

## Getting Started

See the [backend quickstart guide](/docs/actors/quickstart/backend) for getting started.

## Minimal Client

## Stateless vs Stateful

## Getting Actors

## Connection Parameters

Use `params` for static connection parameters. Use `getParams` when the value can change between connection attempts, such as refreshing a JWT before each `.connect()` or reconnect.

## Subscribing to Events

## Connection Lifecycle

## Low-Level HTTP & WebSocket

For actors that implement `onRequest` or `onWebSocket`, call them directly:

```ts @nocheck
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

## Error Handling

## Concepts

### Keys

Keys uniquely identify actor instances. Use compound keys (arrays) for hierarchical addressing:

Don't build keys with string interpolation like `"org:${userId}"` when `userId` contains user data. Use arrays instead to prevent key injection attacks.

### Environment Variables

`createClient()` automatically reads:

- `RIVET_ENDPOINT` (endpoint)
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

## Advanced

### Skip Ready Wait

Requests are normally held at the gateway until the actor is ready to accept traffic. An actor is not ready while it's still starting (before `onWake` finishes) or while it's in the [sleep grace period](/docs/actors/lifecycle#shutdown-sequence) (running `onSleep`, `waitUntil`, and pending disconnects).

Pass `skipReadyWait: true` on the [low-level HTTP and WebSocket APIs](#low-level-http--websocket) to deliver immediately and reach the actor's `onRequest` / `onWebSocket` handler in either window:

```ts @nocheck
import { createClient } from "rivetkit/client";

const client = createClient();
const handle = client.chatRoom.getOrCreate(["general"]);

const response = await handle.fetch("/healthz", {
  skipReadyWait: true,
});

const ws = await handle.webSocket("probe", undefined, {
  skipReadyWait: true,
});
```

Requests can still return transient lifecycle or gateway errors. Retry once the actor is available again.

- `actor.stopping`: the actor has fully stopped, i.e. the sleep grace period has ended but it has not yet restarted.
- `guard.actor_stopped_while_waiting`: the request reached the actor tunnel, but the actor stopped before the gateway received a response.
- `guard.tunnel_request_aborted`: the actor tunnel aborted the request before a response started.
- `guard.tunnel_message_timeout`: the gateway dropped the in-flight tunnel request after its tunnel message timeout.
- `guard.tunnel_response_closed`: the actor tunnel closed before sending a response.
- `guard.gateway_response_start_timeout`: the gateway timed out waiting for the actor response to start.

## API Reference

**Package:** [rivetkit](https://www.npmjs.com/package/rivetkit)

See the [RivetKit client overview](/docs/clients).

- [`createClient`](/typedoc/functions/rivetkit.client_mod.createClient.html) - Create a client
- [`Client`](/typedoc/types/rivetkit.mod.Client.html) - Client type

## Need More Than the Client?

If you need more about Rivet Actors, registries, or server-side RivetKit, add the main skill:

```bash
npx skills add rivet-dev/skills
```

Then use the `rivetkit` skill for backend guidance.

