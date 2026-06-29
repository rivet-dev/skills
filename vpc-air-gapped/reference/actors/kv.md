# Low-Level KV Storage

> Source: `src/content/docs/actors/kv.mdx`
> Canonical URL: https://rivet.dev/docs/actors/kv
> Description: Use the built-in key-value store on ActorContext for durable string and binary data alongside actor state.

---
KV is deprecated. It is a low-level escape hatch kept for backward compatibility. For new actors, prefer [in-memory state](/docs/actors/state) for small serializable values or [SQLite](/docs/actors/sqlite) for larger or queryable data.

Every Rivet Actor includes a lightweight key-value store on `c.kv`. It is useful for dynamic keys, blobs, or data that does not fit well in structured state.

If your data has a known schema, prefer [state](/docs/actors/state). KV is best for flexible or user-defined keys.

## Basic Usage

Keys and values default to `text`, so you can use strings without extra options.

## Value Types

You can store binary values by passing `Uint8Array` or `ArrayBuffer`. Use `type` on both reads and writes to get the right value type: `binary` for `Uint8Array` and `arrayBuffer` for `ArrayBuffer`.

TypeScript returns a concrete type based on the option you pass in:

## Key Types

Keys accept either `string` or `Uint8Array`. String keys are encoded as UTF-8 by default.

When listing by prefix, you can control how keys are decoded with `keyType`. Returned keys have the prefix removed.

If you use binary keys, set `keyType: "binary"` so the returned keys stay as `Uint8Array`.

## Range Operations

Use `listRange(start, end)` to read an arbitrary half-open range `[start, end)`. Use `deleteRange(start, end)` to clear that same range efficiently.

## Batch Operations

KV supports batch operations for efficiency. `batchPut` and `batchGet` work on raw `Uint8Array` keys and values, so encode strings before passing them in.

## API Reference

- [`ActorContext`](/typedoc/interfaces/rivetkit.mod.ActorContext.html) - `c.kv` is available on the context

_Source doc path: /docs/actors/kv_
