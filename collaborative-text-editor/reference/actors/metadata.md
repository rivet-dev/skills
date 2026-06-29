# Metadata

> Source: `src/content/docs/actors/metadata.mdx`
> Canonical URL: https://rivet.dev/docs/actors/metadata
> Description: Metadata provides information about the currently running actor.

---
## Actor ID

Get the unique instance ID of the actor:

## Actor Name

Get the actor type name:

This is useful when you need to know which actor type is running, especially if you have generic utility functions that are shared between different actor implementations.

## Actor Key

Get the actor key used to identify this actor instance:

The key is used to route requests to the correct actor instance and can include parameters passed when creating the actor.

Learn more about using keys for actor addressing and configuration in the [keys documentation](/docs/actors/keys).

## Region

Region can be accessed from the context object via `c.region`.

`c.region` is only supported on Rivet at the moment.

## Example Usage

## API Reference

- [`ActorDefinition`](/typedoc/interfaces/rivetkit.mod.ActorDefinition.html) - Interface for defining metadata
- [`CreateOptions`](/typedoc/interfaces/rivetkit.client_mod.CreateOptions.html) - Options for creating an actor, including `region` and `input`

_Source doc path: /docs/actors/metadata_
