# Common Software

> Source: `docs/common-software.mdx`
> Canonical URL: https://sandboxagent.dev/docs/common-software
> Description: Install browsers, languages, databases, and other tools inside the sandbox.

---
The sandbox runs a Debian/Ubuntu base image. You can install software with `apt-get` via the [Process API](/processes) or by customizing your Docker image. This page covers commonly needed packages and how to install them.

## Browsers

### Chromium

```ts TypeScript
await sdk.runProcess({
  command: "apt-get",
  args: ["install", "-y", "chromium", "chromium-sandbox"],
});

// Launch headless
await sdk.runProcess({
  command: "chromium",
  args: ["--headless", "--no-sandbox", "--disable-gpu", "https://example.com"],
});
```

```bash cURL
curl -X POST "http://127.0.0.1:2468/v1/processes/run" \
  -H "Content-Type: application/json" \
  -d '{"command":"apt-get","args":["install","-y","chromium","chromium-sandbox"]}'
```

Use `--no-sandbox` when running Chromium inside a container. The container itself provides isolation.

### Firefox

```ts TypeScript
await sdk.runProcess({
  command: "apt-get",
  args: ["install", "-y", "firefox-esr"],
});
```

```bash cURL
curl -X POST "http://127.0.0.1:2468/v1/processes/run" \
  -H "Content-Type: application/json" \
  -d '{"command":"apt-get","args":["install","-y","firefox-esr"]}'
```

### Playwright browsers

Playwright bundles its own browser binaries. Install the Playwright CLI and let it download browsers for you.

```ts TypeScript
await sdk.runProcess({
  command: "npx",
  args: ["playwright", "install", "--with-deps", "chromium"],
});
```

```bash cURL
curl -X POST "http://127.0.0.1:2468/v1/processes/run" \
  -H "Content-Type: application/json" \
  -d '{"command":"npx","args":["playwright","install","--with-deps","chromium"]}'
```

---

## Languages and runtimes

### Node.js

```ts TypeScript
await sdk.runProcess({
  command: "apt-get",
  args: ["install", "-y", "nodejs", "npm"],
});
```

```bash cURL
curl -X POST "http://127.0.0.1:2468/v1/processes/run" \
  -H "Content-Type: application/json" \
  -d '{"command":"apt-get","args":["install","-y","nodejs","npm"]}'
```

For a specific version, use [nvm](https://github.com/nvm-sh/nvm):

```ts TypeScript
await sdk.runProcess({
  command: "bash",
  args: ["-c", "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash && . ~/.nvm/nvm.sh && nvm install 22"],
});
```

### Python

Python 3 is typically pre-installed. To add pip and common packages:

```ts TypeScript
await sdk.runProcess({
  command: "apt-get",
  args: ["install", "-y", "python3", "python3-pip", "python3-venv"],
});

await sdk.runProcess({
  command: "pip3",
  args: ["install", "numpy", "pandas", "matplotlib"],
});
```

```bash cURL
curl -X POST "http://127.0.0.1:2468/v1/processes/run" \
  -H "Content-Type: application/json" \
  -d '{"command":"apt-get","args":["install","-y","python3","python3-pip","python3-venv"]}'

curl -X POST "http://127.0.0.1:2468/v1/processes/run" \
  -H "Content-Type: application/json" \
  -d '{"command":"pip3","args":["install","numpy","pandas","matplotlib"]}'
```

### Go

```ts TypeScript
await sdk.runProcess({
  command: "bash",
  args: ["-c", "curl -fsSL https://go.dev/dl/go1.23.6.linux-amd64.tar.gz | tar -C /usr/local -xz"],
});

// Add to PATH for subsequent commands
await sdk.runProcess({
  command: "bash",
  args: ["-c", "export PATH=$PATH:/usr/local/go/bin && go version"],
});
```

```bash cURL
curl -X POST "http://127.0.0.1:2468/v1/processes/run" \
  -H "Content-Type: application/json" \
  -d '{"command":"bash","args":["-c","curl -fsSL https://go.dev/dl/go1.23.6.linux-amd64.tar.gz | tar -C /usr/local -xz"]}'
```

### Rust

```ts TypeScript
await sdk.runProcess({
  command: "bash",
  args: ["-c", "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y"],
});
```

```bash cURL
curl -X POST "http://127.0.0.1:2468/v1/processes/run" \
  -H "Content-Type: application/json" \
  -d '{"command":"bash","args":["-c","curl --proto =https --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y"]}'
```

### Java (OpenJDK)

```ts TypeScript
await sdk.runProcess({
  command: "apt-get",
  args: ["install", "-y", "default-jdk"],
});
```

```bash cURL
curl -X POST "http://127.0.0.1:2468/v1/processes/run" \
  -H "Content-Type: application/json" \
  -d '{"command":"apt-get","args":["install","-y","default-jdk"]}'
```

### Ruby

```ts TypeScript
await sdk.runProcess({
  command: "apt-get",
  args: ["install", "-y", "ruby-full"],
});
```

```bash cURL
curl -X POST "http://127.0.0.1:2468/v1/processes/run" \
  -H "Content-Type: application/json" \
  -d '{"command":"apt-get","args":["install","-y","ruby-full"]}'
```

---

## Databases

### PostgreSQL

```ts TypeScript
await sdk.runProcess({
  command: "apt-get",
  args: ["install", "-y", "postgresql", "postgresql-client"],
});

// Start the service
const proc = await sdk.createProcess({
  command: "bash",
  args: ["-c", "su - postgres -c 'pg_ctlcluster 15 main start'"],
});
```

```bash cURL
curl -X POST "http://127.0.0.1:2468/v1/processes/run" \
  -H "Content-Type: application/json" \
  -d '{"command":"apt-get","args":["install","-y","postgresql","postgresql-client"]}'
```

### SQLite

```ts TypeScript
await sdk.runProcess({
  command: "apt-get",
  args: ["install", "-y", "sqlite3"],
});
```

```bash cURL
curl -X POST "http://127.0.0.1:2468/v1/processes/run" \
  -H "Content-Type: application/json" \
  -d '{"command":"apt-get","args":["install","-y","sqlite3"]}'
```

### Redis

```ts TypeScript
await sdk.runProcess({
  command: "apt-get",
  args: ["install", "-y", "redis-server"],
});

const proc = await sdk.createProcess({
  command: "redis-server",
  args: ["--daemonize", "no"],
});
```

```bash cURL
curl -X POST "http://127.0.0.1:2468/v1/processes/run" \
  -H "Content-Type: application/json" \
  -d '{"command":"apt-get","args":["install","-y","redis-server"]}'

curl -X POST "http://127.0.0.1:2468/v1/processes" \
  -H "Content-Type: application/json" \
  -d '{"command":"redis-server","args":["--daemonize","no"]}'
```

### MySQL / MariaDB

```ts TypeScript
await sdk.runProcess({
  command: "apt-get",
  args: ["install", "-y", "mariadb-server", "mariadb-client"],
});
```

```bash cURL
curl -X POST "http://127.0.0.1:2468/v1/processes/run" \
  -H "Content-Type: application/json" \
  -d '{"command":"apt-get","args":["install","-y","mariadb-server","mariadb-client"]}'
```

---

## Build tools

### Essential build toolchain

Most compiled software needs the standard build toolchain:

```ts TypeScript
await sdk.runProcess({
  command: "apt-get",
  args: ["install", "-y", "build-essential", "cmake", "pkg-config"],
});
```

```bash cURL
curl -X POST "http://127.0.0.1:2468/v1/processes/run" \
  -H "Content-Type: application/json" \
  -d '{"command":"apt-get","args":["install","-y","build-essential","cmake","pkg-config"]}'
```

This installs `gcc`, `g++`, `make`, `cmake`, and related tools.

---

## Desktop applications

These require the [Computer Use](/computer-use) desktop to be started first.

### LibreOffice

```ts TypeScript
await sdk.runProcess({
  command: "apt-get",
  args: ["install", "-y", "libreoffice"],
});
```

```bash cURL
curl -X POST "http://127.0.0.1:2468/v1/processes/run" \
  -H "Content-Type: application/json" \
  -d '{"command":"apt-get","args":["install","-y","libreoffice"]}'
```

### GIMP

```ts TypeScript
await sdk.runProcess({
  command: "apt-get",
  args: ["install", "-y", "gimp"],
});
```

```bash cURL
curl -X POST "http://127.0.0.1:2468/v1/processes/run" \
  -H "Content-Type: application/json" \
  -d '{"command":"apt-get","args":["install","-y","gimp"]}'
```

### VLC

```ts TypeScript
await sdk.runProcess({
  command: "apt-get",
  args: ["install", "-y", "vlc"],
});
```

```bash cURL
curl -X POST "http://127.0.0.1:2468/v1/processes/run" \
  -H "Content-Type: application/json" \
  -d '{"command":"apt-get","args":["install","-y","vlc"]}'
```

### VS Code (code-server)

```ts TypeScript
await sdk.runProcess({
  command: "bash",
  args: ["-c", "curl -fsSL https://code-server.dev/install.sh | sh"],
});

const proc = await sdk.createProcess({
  command: "code-server",
  args: ["--bind-addr", "0.0.0.0:8080", "--auth", "none"],
});
```

```bash cURL
curl -X POST "http://127.0.0.1:2468/v1/processes/run" \
  -H "Content-Type: application/json" \
  -d '{"command":"bash","args":["-c","curl -fsSL https://code-server.dev/install.sh | sh"]}'

curl -X POST "http://127.0.0.1:2468/v1/processes" \
  -H "Content-Type: application/json" \
  -d '{"command":"code-server","args":["--bind-addr","0.0.0.0:8080","--auth","none"]}'
```

---

## CLI tools

### Git

```ts TypeScript
await sdk.runProcess({
  command: "apt-get",
  args: ["install", "-y", "git"],
});
```

```bash cURL
curl -X POST "http://127.0.0.1:2468/v1/processes/run" \
  -H "Content-Type: application/json" \
  -d '{"command":"apt-get","args":["install","-y","git"]}'
```

### Docker

```ts TypeScript
await sdk.runProcess({
  command: "bash",
  args: ["-c", "curl -fsSL https://get.docker.com | sh"],
});
```

```bash cURL
curl -X POST "http://127.0.0.1:2468/v1/processes/run" \
  -H "Content-Type: application/json" \
  -d '{"command":"bash","args":["-c","curl -fsSL https://get.docker.com | sh"]}'
```

### jq

```ts TypeScript
await sdk.runProcess({
  command: "apt-get",
  args: ["install", "-y", "jq"],
});
```

```bash cURL
curl -X POST "http://127.0.0.1:2468/v1/processes/run" \
  -H "Content-Type: application/json" \
  -d '{"command":"apt-get","args":["install","-y","jq"]}'
```

### tmux

```ts TypeScript
await sdk.runProcess({
  command: "apt-get",
  args: ["install", "-y", "tmux"],
});
```

```bash cURL
curl -X POST "http://127.0.0.1:2468/v1/processes/run" \
  -H "Content-Type: application/json" \
  -d '{"command":"apt-get","args":["install","-y","tmux"]}'
```

---

## Media and graphics

### FFmpeg

```ts TypeScript
await sdk.runProcess({
  command: "apt-get",
  args: ["install", "-y", "ffmpeg"],
});
```

```bash cURL
curl -X POST "http://127.0.0.1:2468/v1/processes/run" \
  -H "Content-Type: application/json" \
  -d '{"command":"apt-get","args":["install","-y","ffmpeg"]}'
```

### ImageMagick

```ts TypeScript
await sdk.runProcess({
  command: "apt-get",
  args: ["install", "-y", "imagemagick"],
});
```

```bash cURL
curl -X POST "http://127.0.0.1:2468/v1/processes/run" \
  -H "Content-Type: application/json" \
  -d '{"command":"apt-get","args":["install","-y","imagemagick"]}'
```

### Poppler (PDF utilities)

```ts TypeScript
await sdk.runProcess({
  command: "apt-get",
  args: ["install", "-y", "poppler-utils"],
});

// Convert PDF to images
await sdk.runProcess({
  command: "pdftoppm",
  args: ["-png", "document.pdf", "output"],
});
```

```bash cURL
curl -X POST "http://127.0.0.1:2468/v1/processes/run" \
  -H "Content-Type: application/json" \
  -d '{"command":"apt-get","args":["install","-y","poppler-utils"]}'
```

---

## Pre-installing in a Docker image

For production use, install software in your Dockerfile instead of at runtime. This avoids repeated downloads and makes startup faster.

```dockerfile
FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    chromium \
    firefox-esr \
    nodejs npm \
    python3 python3-pip \
    git curl wget \
    build-essential \
    sqlite3 \
    ffmpeg \
    imagemagick \
    jq \
    && rm -rf /var/lib/apt/lists/*

RUN pip3 install numpy pandas matplotlib
```

See [Docker deployment](/deploy/docker) for how to use custom images with Sandbox Agent.
