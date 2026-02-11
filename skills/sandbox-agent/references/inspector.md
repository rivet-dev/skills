# Inspector

> Source: `docs/inspector.mdx`
> Canonical URL: https://sandboxagent.dev/docs/inspector
> Description: Debug and inspect agent sessions with the Inspector UI.

---
The Inspector is a web UI for inspecting Sandbox Agent sessions. Use it to view events, inspect payloads, and troubleshoot behavior.

![Sandbox Agent Inspector](https://sandboxagent.dev/docs/images/inspector.png)

## Open the Inspector

The Inspector is served at `/ui/` on your Sandbox Agent server.
For example, if your server runs at `http://localhost:2468`, open `http://localhost:2468/ui/`.

You can also generate a pre-filled Inspector URL from the SDK:

```typescript
import { buildInspectorUrl } from "sandbox-agent";

const url = buildInspectorUrl({
  baseUrl: "http://127.0.0.1:2468",
});

console.log(url);
// http://127.0.0.1:2468/ui/
```

## Features

- Session list
- Event stream view
- Event JSON inspector
- Prompt testing
- Request/response debugging

## When to use

- Development: validate session behavior quickly
- Debugging: inspect raw event payloads
- Integration work: compare UI behavior with SDK/API calls
