# Workflows

> Source: `src/content/docs/actors/workflows.mdx`
> Canonical URL: https://rivet.dev/docs/actors/workflows
> Description: Build durable, replayable run loops in Rivet Actors with steps, queue waits, timers, and rollback.

---
Use workflows for durable, multi-step execution with replay safety.

## What are workflows?

A workflow is a durable, replayable run handler for a Rivet Actor.

- Survives restarts: workflow progress is saved automatically.
- Re-runs safely: replay follows the same recorded steps.
- Event-driven: workflows can pause for queue messages, then continue.

## Getting started

### Simple workflow

Use this when you need a short multi-step sequence.

### Loops

This is the recommended workflow shape for most actor workloads.

- Use a queue wait inside the loop to receive the next unit of work.
- Keep actor state changes in a single workflow loop.
- This gives you one durable workflow that manages all actor progress.

### Setup & teardown

Use this when the workflow should initialize resources, process queued commands, then clean up.

## Features

### Queue

Use this for fire-and-forget commands where the client does not need a reply.

Use the `Loops` example above as the baseline pattern.

### Request/response (using queue)

Use this when the caller needs a response from queued processing.

### Timers

Use queue messages as the trigger source, then sleep durably inside the workflow.

### Join

Use `join` when several independent tasks can run in parallel.

### Race

Use `race` when you need first-winner behavior.

### Timeouts

Use step timeouts and retries for slow or flaky dependencies.

Step timeouts are critical by default and fail immediately. Set `retryOnTimeout: true` if a timeout should retry like any other error using `maxRetries`.

### Handling terminal failures as data

Use `tryStep` when a step failure should produce data instead of failing the whole workflow.

Use `try` when you want to recover from terminal `step`, `join`, or `race` failures inside a named block.

```ts
async function runPaymentFlow(ctx: any) {
  return await ctx.try("payment-flow", async (blockCtx: any) => {
    const auth = await blockCtx.step("authorize", async (blockCtx) =>
      authorizeOrder("order-123"),
    );
    const capture = await blockCtx.step("capture", async (blockCtx) =>
      captureOrder("order-123"),
    );
    return { auth, capture };
  });
}

async function authorizeOrder(orderId: string): Promise<string> {
  return `auth-${orderId}`;
}

async function captureOrder(orderId: string): Promise<string> {
  return `capture-${orderId}`;
}
```

- `tryStep` and `try` only catch terminal failures. Retry backoff, sleeps, queue waits, eviction, and history divergence still rethrow.
- `RollbackError` is not caught by default. Pass `catch: ["rollback"]` when you want rollback failures returned as data.

### Error hooks

Use `onError` when you want a best-effort notification for workflow failures.

- Step failures include the attempt number, retry counts, whether the step will retry, and the next retry delay.
- Workflow failures also include terminal errors outside steps, such as rollback failures or code/history mismatches.
- The hook is observational. It is not part of workflow replay, so use it for logging, metrics, or updating non-critical actor state.
- This is also a good place to forward workflow failures to Sentry or another error reporting pipeline.

### Rollback

Use rollback checkpoints before steps that have compensating actions.

## Patterns

### Store workflow progress in state + broadcast

Store progress in `state` so replay and recovery always restore it. Broadcast state changes so clients can render progress in realtime.

### Cron (queue-driven)

Rivet scheduling triggers actions. For cron-like workflows, use a small scheduled action as a bridge that enqueues work, then process that work in the workflow loop.

These are common workflow shapes used in production systems.

### Queue-driven worker

Use this when external systems enqueue work and the actor should process each item durably.

### Setup & teardown

Use this when you need one-time initialization before a long-lived loop, plus cleanup when the actor stops sleeping or is destroyed.

### Human approval gate

Use this when an operation must pause for a user or system decision before continuing.

### Fan-out / fan-in (join)

Use this when independent work items can run in parallel and you need a single merged result.

### Batch drainer

Use this when throughput matters and handling one message at a time is too expensive.

### Coordinator -> worker RPC

Use this when one actor orchestrates work by calling actions on other actors.

### Request/response over queue (async RPC)

Use this when you want decoupled actor-to-actor communication with durable waits and explicit completion.

### Scatter-gather across actors

Use this when multiple actors can process independent parts of a request in parallel, then return a merged response.

### Timeout + fallback actor

Use this when a primary actor call might be slow or unavailable and you need a deterministic fallback path.

### Cross-actor saga (compensating actions)

Use this when a workflow spans multiple actors and each side effect may need compensation.

### Signal-driven control loop

Use this when workflow progress should be triggered by commands/events instead of fixed polling intervals.

### Poll + backoff loop

Use this when an external dependency has variable availability and retries should slow down after failures.

### Child worker orchestration

Use this when one workflow coordinates many child workers (actors or worker workflows) and manages their lifecycle.

### Bounded drain + concurrency cap

Use this when inbound work can spike and you need predictable per-iteration limits.

### Versioned workflow evolution

Use this when workflow structure changes across deployments and old histories must still replay.

### Checkpoint-friendly loop design

Use this when you need reliable replay and resume semantics across crashes and restarts.

## Migrations

- Keep workflow entry names stable once deployed.
- If an old entry was removed or renamed, call `ctx.removed(name, originalType)`.
- This keeps replay compatible across deployments.

## Step-only access to actor APIs

`state`, `vars`, `db`, `client()`, and connection/event APIs are only valid inside `ctx.step(...)` callbacks.

Use non-step workflow code for orchestration only: queue waits, sleeps, loops, joins, races, and rollback boundaries. Keep actor-local side effects in steps.

## Debugging

- `GET /inspector/workflow-history` returns workflow history status for an actor.
- Response includes `isWorkflowEnabled` and `history`.
- In non-dev mode, inspector endpoints require authorization.

## Recommendations

- Prefer queue-driven loops for long-lived workflows.
- Structure long-lived workflows with setup and teardown around the main loop.
- Keep actor state changes and side effects inside steps.
- Store workflow progress in `state` and broadcast updates as progress changes.
- Use timeouts and rollback for external side effects.

_Source doc path: /docs/actors/workflows_
