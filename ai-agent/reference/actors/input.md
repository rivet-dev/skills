# Input Parameters

> Source: `src/content/docs/actors/input.mdx`
> Canonical URL: https://rivet.dev/docs/actors/input
> Description: Pass initialization data to actors when creating instances

---
Actors can receive input parameters when created, allowing for flexible initialization and configuration. Input is passed during actor creation and is available in lifecycle hooks.

## Passing Input to Actors

Input is provided when creating actor instances using the `input` property:

## Accessing Input in Lifecycle Hooks

Input is available as the second argument to the `createState` and `onCreate` lifecycle hooks:

## Input Validation

You can validate input parameters in the `createState` or `onCreate` hooks:

## Input vs Connection Parameters

Input parameters are different from connection parameters:

- **Input**:
  - Passed when creating the actor instance
  - Use for actor-wide configuration
  - Available in lifecycle hooks
- **Connection parameters**:
  - Passed when connecting to an existing actor
  - Used for connection-specific configuration
  - Available in connection hooks

## Input Best Practices

### Use Type Safety

Define input types to ensure type safety:

### Store Input in State

Input is only available in `createState` and `onCreate` lifecycle hooks. If you need to access input data later (in actions, timers, or other hooks), store it in the actor's state during creation. This is the recommended pattern because input shapes can evolve over time, and persisting input in state ensures you always have access to the values the actor was created with:

## API Reference

- [`CreateOptions`](/typedoc/interfaces/rivetkit.client_mod.CreateOptions.html) - Options for creating actors
- [`CreateRequest`](/typedoc/types/rivetkit.client_mod.CreateRequest.html) - Request type for creation
- [`ActorDefinition`](/typedoc/classes/rivetkit.mod.ActorDefinition.html) - Actor definition returned by `actor()`

_Source doc path: /docs/actors/input_
