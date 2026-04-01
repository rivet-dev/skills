---
name: "rivetkit"
description: "RivetKit backend and Rivet Actor runtime guidance. Use for building, modifying, debugging, or testing Rivet Actors, registries, serverless/runner modes, deployment, or actor-based workflows."
---

# Rivet Actors

Build high-performance, long-lived, in-memory processes on Rivet's actor runtime. Use this skill whenever HTTP endpoints, databases, or queues no longer meet the requirements for AI agents, realtime collaboration, workflow orchestration, or geo-distributed data.

## What To Do If You Get Stuck

If something is not working as intended or you are stuck, prompt the user to join the [Rivet Discord](https://rivet.dev/discord) or file an issue on the [Rivet GitHub](https://github.com/rivet-dev/rivet) to report an issue and get help.

Provide the user with a pre-generated report with:

- Symptoms
	- If this is happening in local dev, deployed, or both
	- The error you're seeing
	- Relevant source code related to this
- What you've tried to solve it
- Environment
	- RivetKit version
	- Runtime (Node, Bun, etc) including version
	- If applicable, provider in use (e.g. Vercel, Railway, etc)
	- If applicable, HTTP router in use (e.g. Hono, Express, Elysia)

## Debugging Actors

Use the inspector HTTP API to examine running actors. These endpoints are accessible through the gateway at `/gateway/{actor_id}/inspector/*`. Key endpoints:

- `GET /inspector/summary` - full actor snapshot (state, connections, RPCs, queue)
- `GET /inspector/state` / `PATCH /inspector/state` - read/write actor state
- `GET /inspector/connections` - active connections
- `GET /inspector/rpcs` - available actions
- `POST /inspector/action/{name}` - execute an action with `{"args": [...]}`
- `POST /inspector/database/execute` - run SQL with `{"sql": "...", "args": [...]}` or `{"sql": "...", "properties": {...}}` for reads or mutations
- `GET /inspector/queue?limit=50` - queue status
- `GET /inspector/traces?startMs=0&endMs=...&limit=1000` - trace spans (OTLP JSON)
- `GET /inspector/workflow-history` - workflow history and status as JSON (`nameRegistry`, `entries`, `entryMetadata`)
- `POST /inspector/workflow/replay` - replay a workflow from a specific step or from the beginning
- `GET /inspector/database/schema` - SQLite tables and views exposed by `c.db`
- `GET /inspector/database/rows?table=...&limit=100&offset=0` - paged SQLite rows for a table or view
- `POST /inspector/workflow/replay` - replay a workflow from a specific step or from the beginning

In local dev, no auth token is needed. In production, pass `Authorization: Bearer <RIVET_INSPECTOR_TOKEN>`. The actor-specific inspector token used by the standalone Inspector UI is also accepted for inspector endpoints. See the [debugging docs](https://rivet.dev/docs/actors/debugging) for details.

## Citing Sources

When providing information from Rivet documentation, cite the canonical URL so users can learn more. Each reference file includes its canonical URL in the header metadata.

**How to cite:**

- Use inline links for key concepts: "Use [actor keys](https://rivet.dev/docs/actors/keys) to uniquely identify instances."
- Add a "Learn more" link after explanations for complex topics

**Finding canonical URLs:**

The Reference Map below links to reference files. Each file's header contains:

```
> Canonical URL: https://rivet.dev/docs/actors/actions
```

Use that canonical URL when citing, not the reference file path.

**Examples:**

- Actions → `https://rivet.dev/docs/actors/actions`
- React client → `https://rivet.dev/docs/clients/react`
- Self-hosting on Kubernetes → `https://rivet.dev/docs/self-hosting/kubernetes`

## Version Check

Before starting any work, check if the user's project is on the latest version of RivetKit (latest: 2.2.0). Look at the `rivetkit` version in the user's `package.json` (check both `dependencies` and `devDependencies`). If the installed version is older than 2.2.0, inform the user and suggest upgrading:

```bash
npm install rivetkit@2.2.0
```

If the user also uses `@rivetkit/react`, `@rivetkit/next-js`, or other `@rivetkit/*` client packages, suggest upgrading those too. Outdated versions may have known bugs or missing features that cause issues.

## First Steps

1. Install RivetKit (latest: 2.2.0)
   ```bash
   npm install rivetkit@2.2.0
   ```
2. Define a registry with `setup({ use: { /* actors */ } })`.
3. Call `registry.start()` to start the server. For custom HTTP server integration, use `registry.handler()` with a router like Hono. For serverless deployments, use `registry.serve()`. For runner-only mode, use `registry.startRunner()`.
4. Verify `/api/rivet/metadata` returns 200 before deploying.
5. Configure Rivet Cloud or self-hosted engine
   - You must configure versioning for production builds. This is not needed for local development. See [Versions & Upgrades](https://rivet.dev/docs/actors/versions).
6. Integrate clients (see client guides below for JavaScript, React, or Swift)
7. Prompt the user if they want to deploy. If so, go to Deploying Rivet Backends.

For more information, read the quickstart guide relevant to the user's project.

## Project Setup

### .gitignore

Every RivetKit project should have a `.gitignore`. Include at minimum:

```
node_modules/
dist/
.env
```

### .dockerignore

Every project with a Dockerfile should have a `.dockerignore` to keep the image small and avoid leaking secrets:

```
node_modules/
dist/
.env
.git/
```

### Dockerfile

Use this as a base Dockerfile for deploying a RivetKit project. The `RIVET_RUNNER_VERSION` build arg is only needed when self-hosting or using a custom runner (not needed for Rivet Compute). It lets Rivet track which version of the actor is running and drain old actors on deploy. See https://rivet.dev/docs/actors/versions for details.

```dockerfile
FROM node:24-alpine

ARG RIVET_RUNNER_VERSION
ENV RIVET_RUNNER_VERSION=$RIVET_RUNNER_VERSION

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build --if-present

CMD ["node", "dist/index.js"]
```

Build with:

```bash
docker build --build-arg RIVET_RUNNER_VERSION=$(date +%s) .
```

Adjust the `CMD` to match the project's entry point. If the project uses a different output directory or start command, update accordingly.

## Error Handling Policy

- Prefer fail-fast behavior by default.
- Avoid `try/catch` unless it is required for a real recovery path, cleanup boundary, or to add actionable context.
- Never swallow errors. If you add a `catch`, you must handle the error explicitly, at minimum by logging it.
- When you cannot recover, log context and rethrow.

## State vs Vars: Persistence Rules

**`c.vars` is ephemeral.** Data in `c.vars` is lost on every restart, crash, upgrade, or sleep/wake cycle. Only use `c.vars` for non-serializable objects (e.g., physics engines, WebSocket references, event emitters, caches) or truly transient runtime data (e.g., current input direction that doesn't matter after disconnect).

**Persistent storage options.** Any data that must survive restarts belongs in one of these, NOT in `c.vars`:

- **`c.state`** — CBOR-serializable data for small, bounded datasets. Ideal for configuration, counters, small player lists, phase flags, etc. Keep under 128 KB. Do not store unbounded or growing data here (e.g., chat logs, event histories, spawned entity lists that grow without limit). State is read/written as a single blob on every persistence cycle.
- **`c.kv`** — Key-value store for unbounded data. This is what `c.state` uses under the hood. Supports binary values. Use for larger or variable-size data like user inventories, world chunks, file blobs, or any collection that may grow over time. Keys are scoped to the actor instance.
- **`c.db`** — SQLite database for structured or complex data. Use when you need queries, indexes, joins, aggregations, or relational modeling. Ideal for leaderboards, match histories, player pools, or any data that benefits from SQL.

**Common mistake:** Storing meaningful game/application data in `c.vars` instead of persisting it. For example, if users can spawn objects in a physics simulation, the spawn definitions (position, size, type) must be persisted in `c.state` (or `c.kv` if unbounded), even though the physics engine handles (non-serializable) live in `c.vars`. On restart, `run()` should recreate the runtime objects from the persisted data.

## Deploying Rivet Backends

Assume the user is deploying to Rivet Cloud, unless otherwise specified. If user is self-hosting, read the self-hosting guides below.

1. Verify that Rivet Actors are working in local dev
2. Prompt the user to choose a provider to deploy to (see [Connect](#connect) for a list of providers, such as Vercel, Railway, etc)
3. Follow the deploy guide for that given provider. You will need to instruct the user when you need manual intervention.

## API Reference

The RivetKit OpenAPI specification is available in the skill directory at `openapi.json`. This file documents all HTTP endpoints for managing actors.

## Misc Notes

- The Rivet domain is rivet.dev, not rivet.gg

## TypeScript Caveat: Actor Client Inference

- In multi-file TypeScript projects, bidirectional actor calls can create a circular type dependency when both actors use `c.client<typeof registry>()`.
- Symptoms usually include `c.state` becoming `unknown`, actor methods becoming possibly `undefined`, or `TS2322` / `TS2722` errors after the first cross-actor call.
- If an action returns the result of another actor call, prefer an explicit return type annotation on that action instead of relying on inference through `c.client<typeof registry>()`.
- If explicit return types are not enough, use a narrower client or registry type for only the actors that action needs.
- As a last resort, pass `unknown` for the registry type and be explicit that this gives up type safety at that call site.

## Features

- **Long-Lived, Stateful Compute**: Each unit of compute is like a tiny server that remembers things between requests – no need to re-fetch data from a database or worry about timeouts. Like AWS Lambda, but with memory and no timeouts.
- **Blazing-Fast Reads & Writes**: State is stored on the same machine as your compute, so reads and writes are ultra-fast. No database round trips, no latency spikes. State is persisted to Rivet for long term storage, so it survives server restarts.
- **Realtime**: Update state and broadcast changes in realtime with WebSockets. No external pub/sub systems, no polling – just built-in low-latency events.
- **Infinitely Scalable**: Automatically scale from zero to millions of concurrent actors. Pay only for what you use with instant scaling and no cold starts.
- **Fault Tolerant**: Built-in error handling and recovery. Actors automatically restart on failure while preserving state integrity and continuing operations.

## When to Use Rivet Actors

- **AI agents & sandboxes**: multi-step toolchains, conversation memory, sandbox orchestration.
- **Multiplayer or collaborative apps**: CRDT docs, shared cursors, realtime dashboards, chat.
- **Workflow automation**: background jobs, cron, rate limiters, durable queues, backpressure control.
- **Data-intensive backends**: geo-distributed or per-tenant databases, in-memory caches, sharded SQL.
- **Networking workloads**: WebSocket servers, custom protocols, local-first sync, edge fanout.

## Minimal Project

### Backend

**index.ts**

```ts
import { actor, event, setup } from "rivetkit";

const counter = actor({
	state: { count: 0 },
	events: {
		count: event<number>(),
	},
	actions: {
		increment: (c, amount: number) => {
			c.state.count += amount;
			c.broadcast("count", c.state.count);
			return c.state.count;
		},
	},
});

export const registry = setup({
	use: { counter },
});

registry.start();
```

### Client Docs

Use the client SDK that matches your app:

- [JavaScript Client](/docs/clients/javascript)
- [React Client](/docs/clients/react)
- [Swift Client](/docs/clients/swift)

## Actor Quick Reference

### In-Memory State

Persistent data that survives restarts, crashes, and deployments. State is persisted on Rivet Cloud or Rivet self-hosted, so it survives restarts if the current process crashes or exits.

### Static Initial State

```ts
import { actor } from "rivetkit";

const counter = actor({
state: { count: 0 },
actions: {
increment: (c) => c.state.count += 1,
},
});

````

### Dynamic Initial State

```ts
import { actor } from "rivetkit";

interface CounterState {
  count: number;
}

const counter = actor({
  state: { count: 0 } as CounterState,
  createState: (c, input: { start?: number }): CounterState => ({
    count: input.start ?? 0,
  }),
  actions: {
    increment: (c) => c.state.count += 1,
  },
});
````

[Documentation](/docs/actors/state)

### Keys

Keys uniquely identify actor instances. Use compound keys (arrays) for hierarchical addressing:

```ts
import { actor, setup } from "rivetkit";
import { createClient } from "rivetkit/client";

const chatRoom = actor({
	state: { messages: [] as string[] },
	actions: {
		getRoomInfo: (c) => ({ org: c.key[0], room: c.key[1] }),
	},
});

const registry = setup({ use: { chatRoom } });
const client = createClient<typeof registry>("http://localhost:6420");

// Compound key: [org, room]
client.chatRoom.getOrCreate(["org-acme", "general"]);

// Access key inside actor via c.key
```

Don't build keys with string interpolation like `"org:${userId}"` when `userId` contains user data. Use arrays instead to prevent key injection attacks.

[Documentation](/docs/actors/keys)

### Input

Pass initialization data when creating actors. Input is only available in `createState` and `onCreate`, so store it in state if you need it later.

```ts
import { actor, setup } from "rivetkit";
import { createClient } from "rivetkit/client";

const game = actor({
	state: { mode: "" },
	createState: (c, input: { mode: string }) => ({
		mode: input.mode, // Store input in state for later access
	}),
	actions: {
		getMode: (c) => c.state.mode,
	},
});

const registry = setup({ use: { game } });
const client = createClient<typeof registry>("http://localhost:6420");

// Client usage
const gameHandle = client.game.getOrCreate(["game-1"], {
	createWithInput: { mode: "ranked" },
});
```

[Documentation](/docs/actors/input)

### Temporary Variables

Temporary data that doesn't survive restarts. Use for non-serializable objects (event emitters, connections, etc).

### Static Initial Vars

```ts
import { actor } from "rivetkit";

const counter = actor({
state: { count: 0 },
vars: { lastAccess: 0 },
actions: {
increment: (c) => {
c.vars.lastAccess = Date.now();
return c.state.count += 1;
},
},
});

````

### Dynamic Initial Vars

```ts
import { actor } from "rivetkit";

const counter = actor({
  state: { count: 0 },
  createVars: () => ({
    emitter: new EventTarget(),
  }),
  actions: {
    increment: (c) => {
      c.vars.emitter.dispatchEvent(new Event("change"));
      return c.state.count += 1;
    },
  },
});
````

[Documentation](/docs/actors/ephemeral-variables)

### Actions

Actions are the primary way clients and other actors communicate with an actor.

```ts
import { actor } from "rivetkit";

const counter = actor({
	state: { count: 0 },
	actions: {
		increment: (c, amount: number) => (c.state.count += amount),
		getCount: (c) => c.state.count,
	},
});
```

[Documentation](/docs/actors/actions)

### Events & Broadcasts

Events enable real-time communication from actors to connected clients.

```ts
import { actor, event } from "rivetkit";

const chatRoom = actor({
	state: { messages: [] as string[] },
	events: {
		newMessage: event<{ text: string }>(),
	},
	actions: {
		sendMessage: (c, text: string) => {
			// Broadcast to ALL connected clients
			c.broadcast("newMessage", { text });
		},
	},
});
```

[Documentation](/docs/actors/events)

### Connections

Access the current connection via `c.conn` or all connected clients via `c.conns`. Use `c.conn.id` or `c.conn.state` to securely identify who is calling an action. Connection state is initialized via `connState` or `createConnState`, which receives parameters passed by the client on connect.

### Static Connection Initial State

```ts
import { actor } from "rivetkit";

const chatRoom = actor({
state: {},
connState: { visitorId: 0 },
onConnect: (c, conn) => {
conn.state.visitorId = Math.random();
},
actions: {
whoAmI: (c) => c.conn.state.visitorId,
},
});

````

### Dynamic Connection Initial State

```ts
import { actor } from "rivetkit";

const chatRoom = actor({
  state: {},
  // params passed from client
  createConnState: (c, params: { userId: string }) => ({
    userId: params.userId,
  }),
  actions: {
    // Access current connection's state and params
    whoAmI: (c) => ({
      state: c.conn.state,
      params: c.conn.params,
    }),
    // Iterate all connections with c.conns
    notifyOthers: (c, text: string) => {
      for (const conn of c.conns.values()) {
        if (conn !== c.conn) conn.send("notification", { text });
      }
    },
  },
});
````

[Documentation](/docs/actors/connections)

### Queues

Use queues to process durable messages in order inside a `run` loop.

```ts
import { actor, queue } from "rivetkit";

const counter = actor({
	state: { value: 0 },
	queues: {
		increment: queue<{ amount: number }>(),
	},
	run: async (c) => {
		for await (const message of c.queue.iter()) {
			c.state.value += message.body.amount;
		}
	},
});
```

[Documentation](/docs/actors/queues)

### Workflows

Use workflows when your `run` logic needs durable, replayable multi-step execution.

```ts
import { actor, queue } from "rivetkit";
import { workflow } from "rivetkit/workflow";

const worker = actor({
	state: { processed: 0 },
	queues: {
		tasks: queue<{ url: string }>(),
	},
	run: workflow(async (ctx) => {
		await ctx.loop("task-loop", async (loopCtx) => {
			const message = await loopCtx.queue.next("wait-task");

			await loopCtx.step("process-task", async () => {
				await processTask(message.body.url);
				loopCtx.state.processed += 1;
			});
		});
	}),
});

async function processTask(url: string): Promise<void> {
	const res = await fetch(url, { method: "POST" });
	if (!res.ok) throw new Error(`Task failed: ${res.status}`);
}
```

[Documentation](/docs/actors/workflows)

### Actor-to-Actor Communication

Actors can call other actors using `c.client()`.

```ts
import { actor, setup } from "rivetkit";

const inventory = actor({
	state: { stock: 100 },
	actions: {
		reserve: (c, amount: number) => {
			c.state.stock -= amount;
		},
	},
});

const order = actor({
	state: {},
	actions: {
		process: async (c) => {
			const client = c.client<typeof registry>();
			await client.inventory.getOrCreate(["main"]).reserve(1);
		},
	},
});

const registry = setup({ use: { inventory, order } });
```

[Documentation](/docs/actors/communicating-between-actors)

### Scheduling

Schedule actions to run after a delay or at a specific time. Schedules persist across restarts, upgrades, and crashes.

```ts
import { actor, event } from "rivetkit";

const reminder = actor({
	state: { message: "" },
	events: {
		reminder: event<{ message: string }>(),
	},
	actions: {
		// Schedule action to run after delay (ms)
		setReminder: (c, message: string, delayMs: number) => {
			c.state.message = message;
			c.schedule.after(delayMs, "sendReminder");
		},
		// Schedule action to run at specific timestamp
		setReminderAt: (c, message: string, timestamp: number) => {
			c.state.message = message;
			c.schedule.at(timestamp, "sendReminder");
		},
		sendReminder: (c) => {
			c.broadcast("reminder", { message: c.state.message });
		},
	},
});
```

[Documentation](/docs/actors/schedule)

### Destroying Actors

Permanently delete an actor and its state using `c.destroy()`.

```ts
import { actor } from "rivetkit";

const userAccount = actor({
	state: { email: "", name: "" },
	onDestroy: (c) => {
		console.log(`Account ${c.state.email} deleted`);
	},
	actions: {
		deleteAccount: (c) => {
			c.destroy();
		},
	},
});
```

[Documentation](/docs/actors/destroy)

### Lifecycle Hooks

Actors support hooks for initialization, background processing, connections, networking, and state changes. Use `run` for long-lived background loops, and exit cleanly on shutdown with `c.aborted` or `c.abortSignal`.

```ts
import { actor, event, queue } from "rivetkit";

interface RoomState {
	users: Record<string, boolean>;
	name?: string;
}

interface RoomInput {
	roomName: string;
}

interface ConnState {
	userId: string;
	joinedAt: number;
}

const chatRoom = actor({
	state: { users: {} } as RoomState,
	vars: { startTime: 0 },
	connState: { userId: "", joinedAt: 0 } as ConnState,
	events: {
		stateChanged: event<RoomState>(),
	},
	queues: {
		work: queue<{ task: string }>(),
	},

	// State & vars initialization
	createState: (c, input: RoomInput): RoomState => ({
		users: {},
		name: input.roomName,
	}),
	createVars: () => ({ startTime: Date.now() }),

	// Actor lifecycle
	onCreate: (c) => console.log("created", c.key),
	onDestroy: (c) => console.log("destroyed"),
	onWake: (c) => console.log("actor started"),
	onSleep: (c) => console.log("actor sleeping"),
	run: async (c) => {
		for await (const message of c.queue.iter()) {
			console.log("processing", message.body.task);
		}
	},
	onStateChange: (c, newState) => c.broadcast("stateChanged", newState),

	// Connection lifecycle
	createConnState: (c, params): ConnState => ({
		userId: (params as { userId: string }).userId,
		joinedAt: Date.now(),
	}),
	onBeforeConnect: (c, params) => {
		/* validate auth */
	},
	onConnect: (c, conn) => console.log("connected:", conn.state.userId),
	onDisconnect: (c, conn) => console.log("disconnected:", conn.state.userId),

	// Networking
	onRequest: (c, req) => new Response(JSON.stringify(c.state)),
	onWebSocket: (c, socket) => socket.addEventListener("message", console.log),

	// Response transformation
	onBeforeActionResponse: <Out>(
		c: unknown,
		name: string,
		args: unknown[],
		output: Out,
	): Out => output,

	actions: {},
});
```

[Documentation](/docs/actors/lifecycle)

### Context Types

When writing helper functions outside the actor definition, use `*ContextOf<typeof myActor>` to extract the correct context type. Do not manually define your own context interface — always derive it from the actor definition.

```ts
import { actor, ActionContextOf } from "rivetkit";

const gameRoom = actor({
	state: { players: [] as string[], score: 0 },
	actions: {
		addPlayer: (c, playerId: string) => {
			validatePlayer(c, playerId);
			c.state.players.push(playerId);
		},
	},
});

// Good: derive context type from actor definition
function validatePlayer(c: ActionContextOf<typeof gameRoom>, playerId: string) {
	if (c.state.players.includes(playerId)) {
		throw new Error("Player already in room");
	}
}

// Bad: don't manually define context types like this
// type MyContext = { state: { players: string[] }; ... };
```

[Documentation](/docs/actors/types)

### Errors

Use `UserError` to throw errors that are safely returned to clients. Pass `metadata` to include structured data. Other errors are converted to generic "internal error" for security.

### Actor

```ts
import { actor, UserError } from "rivetkit";

const user = actor({
state: { username: "" },
actions: {
updateUsername: (c, username: string) => {
if (username.length < 3) {
throw new UserError("Username too short", {
code: "username_too_short",
metadata: { minLength: 3, actual: username.length },
});
}
c.state.username = username;
},
},
});

````

### Client

```ts
import { actor, setup } from "rivetkit";
import { createClient, ActorError } from "rivetkit/client";

const user = actor({
  state: { username: "" },
  actions: { updateUsername: (c, username: string) => { c.state.username = username; } }
});

const registry = setup({ use: { user } });
const client = createClient<typeof registry>("http://localhost:6420");

try {
  await client.user.getOrCreate([]).updateUsername("ab");
} catch (error) {
  if (error instanceof ActorError) {
    console.log(error.code);     // "username_too_short"
    console.log(error.metadata); // { minLength: 3, actual: 2 }
  }
}
````

[Documentation](/docs/actors/errors)

### Low-Level HTTP & WebSocket Handlers

For custom protocols or integrating libraries that need direct access to HTTP `Request`/`Response` or WebSocket connections, use `onRequest` and `onWebSocket`.

[HTTP Handler Documentation](/docs/actors/request-handler) · [WebSocket Handler Documentation](/docs/actors/websocket-handler)

### Icons & Names

Customize how actors appear in the UI with display names and icons. It's recommended to always provide a name and icon to actors in order to make them easier to distinguish in the dashboard.

```typescript
import { actor } from "rivetkit";

const chatRoom = actor({
	options: {
		name: "Chat Room",
		icon: "💬", // or FontAwesome: "comments", "chart-line", etc.
	},
	// ...
});
```

[Documentation](/docs/actors/appearance)

## Client Documentation

Find the full client guides here:

- [JavaScript Client](/docs/clients/javascript)
- [React Client](/docs/clients/react)
- [Swift Client](/docs/clients/swift)

## Common Patterns

Actors scale naturally through isolated state and message-passing. Structure your applications with these patterns:

[Documentation](/docs/actors/design-patterns)

### Actor Per Entity

Create one actor per user, document, or room. Use compound keys to scope entities:

```ts client.ts
import { createClient } from "rivetkit/client";
import type { registry } from "./index";

const client = createClient<typeof registry>("http://localhost:6420");

// Single key: one actor per user
client.user.getOrCreate(["user-123"]);

// Compound key: document scoped to an organization
client.document.getOrCreate(["org-acme", "doc-456"]);

````

```ts index.ts
import { actor, setup } from "rivetkit";

export const user = actor({
  state: { name: "" },
  actions: {},
});

export const document = actor({
  state: { content: "" },
  actions: {},
});

export const registry = setup({ use: { user, document } });

registry.start();
````

### Coordinator & Data Actors

**Data actors** handle core logic (chat rooms, game sessions, user data). **Coordinator actors** track and manage collections of data actors—think of them as an index.

```ts index.ts
import { actor, setup } from "rivetkit";

// Coordinator: tracks chat rooms within an organization
export const chatRoomList = actor({
state: { rooms: [] as string[] },
actions: {
addRoom: async (c, name: string) => {
// Create the chat room actor
const client = c.client<typeof registry>();
await client.chatRoom.create([c.key[0], name]);
c.state.rooms.push(name);
},
listRooms: (c) => c.state.rooms,
},
});

// Data actor: handles a single chat room
export const chatRoom = actor({
state: { messages: [] as string[] },
actions: {
send: (c, msg: string) => { c.state.messages.push(msg); },
},
});

export const registry = setup({ use: { chatRoomList, chatRoom } });

registry.start();

````

```ts client.ts
import { createClient } from "rivetkit/client";
import type { registry } from "./index";

const client = createClient<typeof registry>("http://localhost:6420");

// Coordinator per org
const coordinator = client.chatRoomList.getOrCreate(["org-acme"]);
await coordinator.addRoom("general");
await coordinator.addRoom("random");

// Access chat rooms created by coordinator
client.chatRoom.get(["org-acme", "general"]);
````

### Run Loop

Use a `run` loop for continuous background work inside an actor. Process queue messages in order, run logic on intervals, stream AI responses, or coordinate long-running tasks.

```ts
import { actor, queue, setup } from "rivetkit";

const counterWorker = actor({
	state: { value: 0 },
	queues: {
		mutate: queue<{ delta: number }>(),
	},
	run: async (c) => {
		for await (const message of c.queue.iter()) {
			c.state.value += message.body.delta;
		}
	},
	actions: {
		getValue: (c) => c.state.value,
	},
});

const registry = setup({ use: { counterWorker } });
```

### Workflow Loop

Use this pattern for long-lived, durable workflows that initialize resources, process commands in a loop, then clean up.

```ts
import { actor, queue, setup } from "rivetkit";
import { Loop, workflow } from "rivetkit/workflow";

type WorkMessage = { amount: number };
type ControlMessage = { type: "stop"; reason: string };

const worker = actor({
	state: {
		phase: "idle" as "idle" | "running" | "stopped",
		processed: 0,
		total: 0,
		stopReason: null as string | null,
	},
	queues: {
		work: queue<WorkMessage>(),
		control: queue<ControlMessage>(),
	},
	run: workflow(async (ctx) => {
		await ctx.step("setup", async () => {
			await fetch("https://api.example.com/workers/init", {
				method: "POST",
			});
			ctx.state.phase = "running";
			ctx.state.stopReason = null;
		});

		const stopReason = await ctx.loop("worker-loop", async (loopCtx) => {
			const message = await loopCtx.queue.next("wait-command", {
				names: ["work", "control"],
			});

			if (message.name === "work") {
				await loopCtx.step("apply-work", async () => {
					await fetch("https://api.example.com/workers/process", {
						method: "POST",
						body: JSON.stringify({ amount: message.body.amount }),
					});
					loopCtx.state.processed += 1;
					loopCtx.state.total += message.body.amount;
				});
				return;
			}

			return Loop.break((message.body as ControlMessage).reason);
		});

		await ctx.step("teardown", async () => {
			await fetch("https://api.example.com/workers/shutdown", {
				method: "POST",
			});
			ctx.state.phase = "stopped";
			ctx.state.stopReason = stopReason;
		});
	}),
});

const registry = setup({ use: { worker } });
```

[Documentation](/docs/actors/workflows)

### Actions vs Queues

- **Actions** are not durable. Use them for realtime reads, ephemeral data, and low-latency communication like player input.
- **Queues** are durable. Use them to serialize mutations through the run loop, avoiding race conditions with SQLite and other local state. Callers can still wait for a response from queued work.

### Authentication, Security, & CORS

- Validate credentials in `onBeforeConnect` or `createConnState` and throw an error to reject unauthorized connections.
- Use `c.conn.state` to securely identify users in actions rather than trusting action parameters.
- For cross-origin access, validate the request origin in `onBeforeConnect`.

[Authentication Documentation](/docs/actors/authentication) · [CORS Documentation](/docs/general/cors)

### Versions & Upgrades

When deploying new code, set a version number so Rivet can route new actors to the latest runner and optionally drain old ones. Use a build timestamp, git commit count, or CI build number as the version. It is very important to [configure versioning](/docs/actors/versions) before deploying to production. Without versioning, actors can regress by running on older runner versions, and existing actors will never be forced to migrate to new runners. They will continue running indefinitely on the old runners until they exit.

[Documentation](/docs/actors/versions)

### Anti-Patterns

#### Never build a "god" actor

Do not put all your logic in a single actor. A god actor serializes every operation through one bottleneck, kills parallelism, and makes the entire system fail as a unit. Split into focused actors per entity.

#### Never create an actor per request

Actors are long-lived and maintain state across requests. Creating a new actor for every incoming request throws away the core benefit of the model and wastes resources on actor creation and teardown. Use actors for persistent entities and regular functions for stateless work.

## Reference Map

### Actors

- [Access Control](reference/actors/access-control.md)
- [Actions](reference/actors/actions.md)
- [Actor Keys](reference/actors/keys.md)
- [Actor Scheduling](reference/actors/schedule.md)
- [Actor Statuses](reference/actors/statuses.md)
- [AI and User-Generated Rivet Actors](reference/actors/ai-and-user-generated-actors.md)
- [Authentication](reference/actors/authentication.md)
- [Cloudflare Workers Quickstart](reference/actors/quickstart/cloudflare-workers.md)
- [Communicating Between Actors](reference/actors/communicating-between-actors.md)
- [Connections](reference/actors/connections.md)
- [Debugging](reference/actors/debugging.md)
- [Design Patterns](reference/actors/design-patterns.md)
- [Destroying Actors](reference/actors/destroy.md)
- [Ephemeral Variables](reference/actors/ephemeral-variables.md)
- [Errors](reference/actors/errors.md)
- [External SQL Database](reference/actors/postgres.md)
- [Fetch and WebSocket Handler](reference/actors/fetch-and-websocket-handler.md)
- [Helper Types](reference/actors/helper-types.md)
- [Icons & Names](reference/actors/appearance.md)
- [In-Memory State](reference/actors/state.md)
- [Input Parameters](reference/actors/input.md)
- [Lifecycle](reference/actors/lifecycle.md)
- [Limits](reference/actors/limits.md)
- [Low-Level HTTP Request Handler](reference/actors/request-handler.md)
- [Low-Level KV Storage](reference/actors/kv.md)
- [Low-Level WebSocket Handler](reference/actors/websocket-handler.md)
- [Metadata](reference/actors/metadata.md)
- [Next.js Quickstart](reference/actors/quickstart/next-js.md)
- [Node.js & Bun Quickstart](reference/actors/quickstart/backend.md)
- [Queues & Run Loops](reference/actors/queues.md)
- [React Quickstart](reference/actors/quickstart/react.md)
- [Realtime](reference/actors/events.md)
- [Sandbox Actor](reference/actors/sandbox.md)
- [Scaling & Concurrency](reference/actors/scaling.md)
- [Sharing and Joining State](reference/actors/sharing-and-joining-state.md)
- [SQLite](reference/actors/sqlite.md)
- [SQLite + Drizzle](reference/actors/sqlite-drizzle.md)
- [Testing](reference/actors/testing.md)
- [Troubleshooting](reference/actors/troubleshooting.md)
- [Types](reference/actors/types.md)
- [Vanilla HTTP API](reference/actors/http-api.md)
- [Versions & Upgrades](reference/actors/versions.md)
- [Workflows](reference/actors/workflows.md)

### Agent Os

- [Agent-to-Agent Communication](reference/agent-os/agent-to-agent.md)
- [agentOS vs Sandbox](reference/agent-os/versus-sandbox.md)
- [Authentication](reference/agent-os/authentication.md)
- [Benchmarks](reference/agent-os/benchmarks.md)
- [Configuration](reference/agent-os/configuration.md)
- [Core Package](reference/agent-os/core.md)
- [Cron Jobs](reference/agent-os/cron.md)
- [Deployment](reference/agent-os/deployment.md)
- [Embedded LLM Gateway](reference/agent-os/llm-gateway.md)
- [Events](reference/agent-os/events.md)
- [Filesystem](reference/agent-os/filesystem.md)
- [Limitations](reference/agent-os/limitations.md)
- [LLM Credentials](reference/agent-os/llm-credentials.md)
- [Multiplayer](reference/agent-os/multiplayer.md)
- [Networking & Previews](reference/agent-os/networking.md)
- [Overview](reference/agent-os.md)
- [Permissions](reference/agent-os/permissions.md)
- [Persistence & Sleep](reference/agent-os/persistence.md)
- [Processes & Shell](reference/agent-os/processes.md)
- [Queues](reference/agent-os/queues.md)
- [Quickstart](reference/agent-os/quickstart.md)
- [Sandbox Mounting](reference/agent-os/sandbox.md)
- [Security & Auth](reference/agent-os/security.md)
- [Security Model](reference/agent-os/security-model.md)
- [Sessions](reference/agent-os/sessions.md)
- [Software](reference/agent-os/software.md)
- [SQLite](reference/agent-os/sqlite.md)
- [System Prompt](reference/agent-os/system-prompt.md)
- [Tools](reference/agent-os/tools.md)
- [Webhooks](reference/agent-os/webhooks.md)
- [Workflow Automation](reference/agent-os/workflows.md)

### Clients

- [Node.js & Bun](reference/clients/javascript.md)
- [React](reference/clients/react.md)
- [Swift](reference/clients/swift.md)
- [SwiftUI](reference/clients/swiftui.md)

### Connect

- [Deploy To Amazon Web Services Lambda](reference/connect/aws-lambda.md)
- [Deploying to AWS ECS](reference/connect/aws-ecs.md)
- [Deploying to Cloudflare Workers](reference/connect/cloudflare-workers.md)
- [Deploying to Freestyle](reference/connect/freestyle.md)
- [Deploying to Google Cloud Run](reference/connect/gcp-cloud-run.md)
- [Deploying to Hetzner](reference/connect/hetzner.md)
- [Deploying to Kubernetes](reference/connect/kubernetes.md)
- [Deploying to Railway](reference/connect/railway.md)
- [Deploying to Rivet Compute](reference/connect/_rivet-compute.md)
- [Deploying to Vercel](reference/connect/vercel.md)
- [Deploying to VMs & Bare Metal](reference/connect/vm-and-bare-metal.md)
- [Supabase](reference/connect/supabase.md)

### Cookbook

- [Multiplayer Game](reference/cookbook/multiplayer-game.md)

### General

- [Actor Configuration](reference/general/actor-configuration.md)
- [Architecture](reference/general/architecture.md)
- [Cross-Origin Resource Sharing](reference/general/cors.md)
- [Documentation for LLMs & AI](reference/general/docs-for-llms.md)
- [Edge Networking](reference/general/edge.md)
- [Endpoints](reference/general/endpoints.md)
- [Environment Variables](reference/general/environment-variables.md)
- [HTTP Server](reference/general/http-server.md)
- [Logging](reference/general/logging.md)
- [Production Checklist](reference/general/production-checklist.md)
- [Registry Configuration](reference/general/registry-configuration.md)
- [Runtime Modes](reference/general/runtime-modes.md)

### Self Hosting

- [Configuration](reference/self-hosting/configuration.md)
- [Docker Compose](reference/self-hosting/docker-compose.md)
- [Docker Container](reference/self-hosting/docker-container.md)
- [File System](reference/self-hosting/filesystem.md)
- [FoundationDB (Enterprise)](reference/self-hosting/foundationdb.md)
- [Installing Rivet Engine](reference/self-hosting/install.md)
- [Kubernetes](reference/self-hosting/kubernetes.md)
- [Multi-Region](reference/self-hosting/multi-region.md)
- [PostgreSQL](reference/self-hosting/postgres.md)
- [Production Checklist](reference/self-hosting/production-checklist.md)
- [Railway Deployment](reference/self-hosting/railway.md)
- [Render Deployment](reference/self-hosting/render.md)

