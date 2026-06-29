# Communicating Between Actors

> Source: `src/content/docs/actors/communicating-between-actors.mdx`
> Canonical URL: https://rivet.dev/docs/actors/communicating-between-actors
> Description: Learn how actors can call other actors and share data

---
Actors can communicate with each other using the server-side actor client, enabling complex workflows and data sharing between different actor instances.

We recommend reading the [clients documentation](/docs/clients) first. This guide focuses specifically on communication between actors.

## Using the Server-Side Actor Client

The server-side actor client allows actors to call other actors within the same registry. Access it via `c.client()` in your actor context:

If two actors call each other and their return types are inferred from the other actor's response, you may hit circular type errors (`TS2322`, `TS2722`, or `c.state` becoming `unknown`). Fix this by writing explicit return types on those actions.

## Use Cases and Patterns

### Actor Orchestration

Use a coordinator actor to manage complex workflows:

### Data Aggregation

Collect data from multiple actors:

### Event-Driven Architecture

Use connections to listen for events from other actors:

### Batch Operations

Process multiple items in parallel:

## API Reference

- [`ActorHandle`](/typedoc/types/rivetkit.client_mod.ActorHandle.html) - Handle for calling other actors
- [`Client`](/typedoc/types/rivetkit.mod.Client.html) - Client type for actor communication
- [`ActorAccessor`](/typedoc/interfaces/rivetkit.client_mod.ActorAccessor.html) - Accessor for getting actor handles

_Source doc path: /docs/actors/communicating-between-actors_
