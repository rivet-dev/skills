# Types

> Source: `src/content/docs/actors/types.mdx`
> Canonical URL: https://rivet.dev/docs/actors/types
> Description: TypeScript types for working with Rivet Actors. This page covers context types used in lifecycle hooks and actions, as well as helper types for extracting types from actor definitions.

---
## Context Types

Context types define what properties and methods are available in different parts of the actor lifecycle.

### Extracting Context Types

When writing helper functions that work with actor contexts, use context extractor types like `CreateContextOf` or `ActionContextOf` to extract the appropriate context type from your actor definition.

### All Context Types

Each lifecycle hook and handler has a corresponding `*ContextOf` type, exported from `"rivetkit"`. Pass `typeof myActor` as the type parameter.

| Hook / Handler | Context Type |
|---|---|
| `createState` | `CreateContextOf` |
| `onCreate` | `CreateContextOf` |
| `createVars` | `CreateVarsContextOf` |
| `createConnState` | `CreateConnStateContextOf` |
| `onBeforeConnect` | `BeforeConnectContextOf` |
| `onConnect` | `ConnectContextOf` |
| `onDisconnect` | `DisconnectContextOf` |
| `onDestroy` | `DestroyContextOf` |
| `onMigrate` | `MigrateContextOf` |
| `onWake` | `WakeContextOf` |
| `onSleep` | `SleepContextOf` |
| `onStateChange` | `StateChangeContextOf` |
| `onBeforeActionResponse` | `BeforeActionResponseContextOf` |
| `actions.*` | `ActionContextOf` |
| `run` | `RunContextOf` |
| `workflow` orchestration helpers (root, `loop`, `try`, `race`, `join` branches) | `WorkflowContextOf` |
| `workflow` `step` / `tryStep` run + rollback helpers | `WorkflowStepContextOf` |
| `onRequest` | `RequestContextOf` |
| `onWebSocket` | `WebSocketContextOf` |

`ActorContextOf`, `ConnContextOf`, and `ConnInitContextOf` are general-purpose base context types useful for helper functions that don't correspond to a specific hook.

Workflow context extractors are exported from both `"rivetkit"` and `"rivetkit/workflow"`.

_Source doc path: /docs/actors/types_
