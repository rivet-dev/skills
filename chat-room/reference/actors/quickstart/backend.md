# Node.js & Bun Quickstart

> Source: `src/content/docs/actors/quickstart/backend.mdx`
> Canonical URL: https://rivet.dev/docs/actors/quickstart/backend
> Description: Get started with Rivet Actors in Node.js and Bun

---
Prefer to start from a complete project? See the runnable [`hello-world`](https://github.com/rivet-dev/rivet/tree/main/examples/hello-world) example.

## Steps

### Add Rivet Skill to Coding Agent (Optional)

If you're using an AI coding assistant (like Claude Code, Cursor, Windsurf, etc.), add Rivet skills for enhanced development assistance:

```sh
npx skills add rivet-dev/skills
```

### Install Rivet

```sh
npm install rivetkit
```

### Create Actors and Start Server

Create a file with your actors, set up the registry, and start the server:

### Run Server

```sh Node.js
npx tsx --watch index.ts
```

```sh Bun
bun --watch index.ts
```

```sh Deno
deno run --allow-net --allow-read --allow-env --watch index.ts
```

Your server is now running on `http://localhost:6420`. Clients connect directly to the Rivet Engine on this port.

Visit [http://localhost:6420](http://localhost:6420) in your browser (or point your AI agent at it) to open the Rivet developer tools and inspect your actors live.

### Connect To The Rivet Actor

This code can run either in your frontend or within your backend:

### TypeScript

See the [JavaScript client documentation](/docs/clients/javascript) for more information.

### React

See the [React documentation](/docs/clients/react) for more information.

### Deploy

## Configuration Options

_Source doc path: /docs/actors/quickstart/backend_
