# Actor Keys

> Source: `src/content/docs/actors/keys.mdx`
> Canonical URL: https://rivet.dev/docs/actors/keys
> Description: Actor keys uniquely identify actor instances within each actor type. Keys are used for addressing which specific actor to communicate with.

---
## Key Format

Actor keys can be either a string or an array of strings:

### Compound Keys & User Data

Array keys are useful when you need compound keys with user-provided data. Using arrays makes adding user data safe by preventing key injection attacks:

This allows you to create hierarchical addressing schemes and organize actors by multiple dimensions.

Don't build keys using string interpolation like `"foo:${userId}:bar"` when `userId` contains user data. If a user provides a value containing the delimiter (`:` in this example), it can break your key structure and cause key injection attacks.

### Omitting Keys

You can create actors without specifying a key in situations where there is a singleton actor (i.e. only one actor of a given type). For example:

This pattern should be avoided, since a singleton actor usually means you have a single actor serving all traffic & your application will not scale. See [scaling documentation](/docs/actors/scaling) for more information.

### Key Uniqueness

Keys are unique within each actor name. Different actor types can use the same key:

## Accessing Keys in Metadata

Access the actor's key within the actor using the [metadata](/docs/actors/metadata) API:

## Configuration Examples

### Simple Configuration with Keys

Use keys to provide basic actor configuration:

### Complex Configuration with Input

For more complex configuration, use [input parameters](/docs/actors/input):

## API Reference

- [`ActorKey`](/typedoc/types/rivetkit.mod.ActorKey.html) - Key type for actors
- [`ActorQuery`](/typedoc/types/rivetkit.mod.ActorQuery.html) - Query type using keys
- [`GetOptions`](/typedoc/interfaces/rivetkit.client_mod.GetOptions.html) - Options for getting by key
- [`QueryOptions`](/typedoc/interfaces/rivetkit.client_mod.QueryOptions.html) - Options for querying

_Source doc path: /docs/actors/keys_
