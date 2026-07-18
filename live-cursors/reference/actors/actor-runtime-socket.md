# Actor Runtime Socket

> Source: `src/content/docs/actors/actor-runtime-socket.mdx`
> Canonical URL: https://rivet.dev/docs/actors/actor-runtime-socket
> Description: Connect trusted local tools to a running Rivet Actor over an experimental actor-local protocol.

---
> **Experimental:** The Actor Runtime Socket protocol and API may change between releases. It is available only in the Unix native runtime and must be enabled per actor.

The **Actor Runtime Socket** is a generic, actor-local protocol for trusted tools running in the same application environment as a Rivet Actor. SQLite is its first capability; Unix domain sockets are its current transport.

Each running actor generation lazily creates its own socket. The socket is removed when that generation sleeps, stops, or is destroyed, so clients must request the current path again after the actor wakes or restarts.

## Enable the socket

Enable the feature under the actor's `options`, then provision it from the actor context:

```ts @nocheck
import { actor } from "rivetkit";
import { db } from "rivetkit/db";

export const example = actor({
	options: {
		enableActorRuntimeSocket: true,
	},
	db: db({
		onMigrate: async (db) => {
			await db.execute("CREATE TABLE IF NOT EXISTS items (value TEXT)");
		},
	}),
	run: async (c) => {
		const { path } = await c.actorRuntimeSocket();
		// Give `path` only to trusted, application-local tooling.
	},
});
```

Provisioning fails unless the actor has an enabled LocalNative SQLite database. The per-process socket directory uses mode `0700`, and each actor socket uses mode `0600`.

## Protocol

Unix `SOCK_STREAM` provides a reliable local byte stream but does not preserve message boundaries. Every frame is therefore a four-byte big-endian payload length followed by a versioned BARE (`vbare`) payload. The embedded protocol version is a two-byte little-endian prefix. Clients begin with `ClientHello`; the server returns `HelloOk` with the maximum frame size or rejects an unsupported version.

The current protocol supports:

- multi-statement SQLite scripts with `SqliteExec`;
- single-statement parameterized queries with `SqliteQuery`;
- transactions spanning requests with `SqliteBegin`, `SqliteCommit`, and `SqliteRollback`.

A transaction is identified by a client-chosen `leaseKey` scoped to one connection. Other actor SQL and other socket transactions wait in FIFO order while it runs. Transactions default to a 60-second safety timeout; `SqliteBegin.timeoutMs` may override it. If the deadline fires, RivetKit rolls the transaction back and later requests for that key receive `LeaseExpired`.

The socket is an application-local integration boundary, not a network authentication boundary. It intentionally has no bearer token. Clients must still honor framing and response limits, and should reconnect using a newly provisioned path after actor generation changes.

_Source doc path: /docs/actors/actor-runtime-socket_
