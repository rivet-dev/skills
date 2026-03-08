# React Components

> Source: `docs/react-components.mdx`
> Canonical URL: https://sandboxagent.dev/docs/react-components
> Description: Drop-in React components for Sandbox Agent frontends.

---
`@sandbox-agent/react` exposes small React components built on top of the `sandbox-agent` SDK.

## Install

```bash
npm install @sandbox-agent/react@0.3.x
```

## Full example

This example connects to a running Sandbox Agent server, starts a tty shell, renders `ProcessTerminal`, and cleans up the process when the component unmounts.

```tsx TerminalPane.tsx expandable highlight={5,32-36,71}
"use client";

import { useEffect, useState } from "react";
import { SandboxAgent } from "sandbox-agent";
import { ProcessTerminal } from "@sandbox-agent/react";

export default function TerminalPane() {
  const [client, setClient] = useState<SandboxAgent | null>(null);
  const [processId, setProcessId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let sdk: SandboxAgent | null = null;
    let createdProcessId: string | null = null;

    const cleanup = async () => {
      if (!sdk || !createdProcessId) {
        return;
      }

      await sdk.killProcess(createdProcessId, { waitMs: 1_000 }).catch(() => {});
      await sdk.deleteProcess(createdProcessId).catch(() => {});
    };

    const start = async () => {
      try {
        sdk = await SandboxAgent.connect({
          baseUrl: "http://127.0.0.1:2468",
        });

        const process = await sdk.createProcess({
          command: "sh",
          interactive: true,
          tty: true,
        });

        if (cancelled) {
          createdProcessId = process.id;
          await cleanup();
          await sdk.dispose();
          return;
        }

        createdProcessId = process.id;
        setClient(sdk);
        setProcessId(process.id);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to start terminal.";
        setError(message);
      }
    };

    void start();

    return () => {
      cancelled = true;
      void cleanup();
      void sdk?.dispose();
    };
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  if (!client || !processId) {
    return <div>Starting terminal...</div>;
  }

  return <ProcessTerminal client={client} processId={processId} height={480} />;
}
```

## Component

`ProcessTerminal` attaches to a running tty process.

- `client`: a `SandboxAgent` client
- `processId`: the process to attach to
- `height`, `style`, `terminalStyle`: optional layout overrides
- `onExit`, `onError`: optional lifecycle callbacks

See [Processes](/processes) for the lower-level terminal APIs.
