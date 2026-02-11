# Attachments

> Source: `docs/attachments.mdx`
> Canonical URL: https://sandboxagent.dev/docs/attachments
> Description: Upload files into the sandbox and reference them in prompts.

---
Use the filesystem API to upload files, then include file references in prompt content.

### Upload a file

```ts TypeScript
import { SandboxAgent } from "sandbox-agent";
import fs from "node:fs";

const sdk = await SandboxAgent.connect({
  baseUrl: "http://127.0.0.1:2468",
});

const buffer = await fs.promises.readFile("./data.csv");

const upload = await sdk.writeFsFile(
  { path: "./uploads/data.csv" },
  buffer,
);

console.log(upload.path);
```

```bash cURL
curl -X PUT "http://127.0.0.1:2468/v1/fs/file?path=./uploads/data.csv" \
  --data-binary @./data.csv
```

The upload response returns the absolute path.

### Reference the file in a prompt

```ts TypeScript
const session = await sdk.createSession({ agent: "mock" });

await session.prompt([
  { type: "text", text: "Please analyze the attached CSV." },
  {
    type: "resource_link",
    name: "data.csv",
    uri: "file:///home/sandbox/uploads/data.csv",
    mimeType: "text/csv",
  },
]);
```

## Notes

- Use absolute file URIs in `resource_link` blocks.
- If `mimeType` is omitted, the agent/runtime may infer a default.
- Support for non-text resources depends on each agent's ACP prompt capabilities.
