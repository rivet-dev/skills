# Attachments

> Source: `docs/attachments.mdx`
> Canonical URL: https://sandboxagent.dev/docs/attachments
> Description: Upload files into the sandbox and attach them to prompts.

---
Use the filesystem API to upload files, then reference them as attachments when sending prompts.

### Upload a file

```ts TypeScript
import { SandboxAgent } from "sandbox-agent";
import fs from "node:fs";

const client = await SandboxAgent.connect({
  baseUrl: "http://127.0.0.1:2468",
  token: process.env.SANDBOX_TOKEN,
});

const buffer = await fs.promises.readFile("./data.csv");

const upload = await client.writeFsFile(
  { path: "./uploads/data.csv", sessionId: "my-session" },
  buffer,
);

console.log(upload.path);
```

```bash cURL
curl -X PUT "http://127.0.0.1:2468/v1/fs/file?path=./uploads/data.csv&sessionId=my-session" \
  -H "Authorization: Bearer $SANDBOX_TOKEN" \
  --data-binary @./data.csv
```

The response returns the absolute path that you should use for attachments.

### Attach the file in a prompt

```ts TypeScript
import { SandboxAgent } from "sandbox-agent";

const client = await SandboxAgent.connect({
  baseUrl: "http://127.0.0.1:2468",
  token: process.env.SANDBOX_TOKEN,
});

await client.postMessage("my-session", {
  message: "Please analyze the attached CSV.",
  attachments: [
    {
      path: "/home/sandbox/uploads/data.csv",
      mime: "text/csv",
      filename: "data.csv",
    },
  ],
});
```

```bash cURL
curl -X POST "http://127.0.0.1:2468/v1/sessions/my-session/messages" \
  -H "Authorization: Bearer $SANDBOX_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Please analyze the attached CSV.",
    "attachments": [
      {
        "path": "/home/sandbox/uploads/data.csv",
        "mime": "text/csv",
        "filename": "data.csv"
      }
    ]
  }'
```

## Notes

- Use absolute paths from the upload response to avoid ambiguity.
- If `mime` is omitted, the server defaults to `application/octet-stream`.
- OpenCode receives file parts directly; other agents will see the attachment paths appended to the prompt.
