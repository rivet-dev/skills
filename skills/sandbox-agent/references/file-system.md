# File System

> Source: `docs/file-system.mdx`
> Canonical URL: https://sandboxagent.dev/docs/file-system
> Description: Read, write, and manage files inside the sandbox.

---
The filesystem API lets you list, read, write, move, and delete files inside the sandbox, plus upload tar archives in batch.

## Path resolution

- Absolute paths are used as-is.
- Relative paths resolve from the server process working directory.
- Requests that attempt to escape allowed roots are rejected by the server.

## List entries

```ts TypeScript
import { SandboxAgent } from "sandbox-agent";

const sdk = await SandboxAgent.connect({
  baseUrl: "http://127.0.0.1:2468",
});

const entries = await sdk.listFsEntries({
  path: "./workspace",
});

console.log(entries);
```

```bash cURL
curl -X GET "http://127.0.0.1:2468/v1/fs/entries?path=./workspace"
```

## Read and write files

`PUT /v1/fs/file` writes raw bytes. `GET /v1/fs/file` returns raw bytes.

```ts TypeScript
import { SandboxAgent } from "sandbox-agent";

const sdk = await SandboxAgent.connect({
  baseUrl: "http://127.0.0.1:2468",
});

await sdk.writeFsFile({ path: "./notes.txt" }, "hello");

const bytes = await sdk.readFsFile({ path: "./notes.txt" });
const text = new TextDecoder().decode(bytes);

console.log(text);
```

```bash cURL
curl -X PUT "http://127.0.0.1:2468/v1/fs/file?path=./notes.txt" \
  --data-binary "hello"

curl -X GET "http://127.0.0.1:2468/v1/fs/file?path=./notes.txt" \
  --output ./notes.txt
```

## Create directories

```ts TypeScript
import { SandboxAgent } from "sandbox-agent";

const sdk = await SandboxAgent.connect({
  baseUrl: "http://127.0.0.1:2468",
});

await sdk.mkdirFs({ path: "./data" });
```

```bash cURL
curl -X POST "http://127.0.0.1:2468/v1/fs/mkdir?path=./data"
```

## Move, delete, and stat

```ts TypeScript
import { SandboxAgent } from "sandbox-agent";

const sdk = await SandboxAgent.connect({
  baseUrl: "http://127.0.0.1:2468",
});

await sdk.moveFs({
  from: "./notes.txt",
  to: "./notes-old.txt",
  overwrite: true,
});

const stat = await sdk.statFs({ path: "./notes-old.txt" });
await sdk.deleteFsEntry({ path: "./notes-old.txt" });

console.log(stat);
```

```bash cURL
curl -X POST "http://127.0.0.1:2468/v1/fs/move" \
  -H "Content-Type: application/json" \
  -d '{"from":"./notes.txt","to":"./notes-old.txt","overwrite":true}'

curl -X GET "http://127.0.0.1:2468/v1/fs/stat?path=./notes-old.txt"

curl -X DELETE "http://127.0.0.1:2468/v1/fs/entry?path=./notes-old.txt"
```

## Batch upload (tar)

Batch upload accepts `application/x-tar` and extracts into the destination directory.

```ts TypeScript
import { SandboxAgent } from "sandbox-agent";
import fs from "node:fs";
import path from "node:path";
import tar from "tar";

const sdk = await SandboxAgent.connect({
  baseUrl: "http://127.0.0.1:2468",
});

const archivePath = path.join(process.cwd(), "skills.tar");
await tar.c({
  cwd: "./skills",
  file: archivePath,
}, ["."]);

const tarBuffer = await fs.promises.readFile(archivePath);
const result = await sdk.uploadFsBatch(tarBuffer, {
  path: "./skills",
});

console.log(result);
```

```bash cURL
tar -cf skills.tar -C ./skills .

curl -X POST "http://127.0.0.1:2468/v1/fs/upload-batch?path=./skills" \
  -H "Content-Type: application/x-tar" \
  --data-binary @skills.tar
```
