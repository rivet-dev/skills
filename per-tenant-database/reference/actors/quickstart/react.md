# React Quickstart

> Source: `src/content/docs/actors/quickstart/react.mdx`
> Canonical URL: https://rivet.dev/docs/actors/quickstart/react
> Description: Build realtime React applications with Rivet Actors

---
## Steps

### Add Rivet Skill to Coding Agent (Optional)

If you're using an AI coding assistant (like Claude Code, Cursor, Windsurf, etc.), add Rivet skills for enhanced development assistance:

```sh
npx skills add rivet-dev/skills
```

### Install Dependencies

```sh
npm install rivetkit @rivetkit/react
```

### Create Backend Actor and Start Server

Create your actor registry on the backend and start the server:

### Create React Frontend

Set up your React application:

For detailed information about the React client API, see the [React Client API Reference](/docs/clients/react).

### Setup Vite Configuration

Configure Vite for development:

```ts vite.config.ts @nocheck
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
})
```

### Run Your Application

Start both the backend and frontend:

**Terminal 1**: Start the backend

```sh Node.js
npx tsx --watch backend/index.ts
```

```sh Bun
bun --watch backend/index.ts
```

```sh Deno
deno run --allow-net --allow-read --allow-env --watch backend/index.ts
```

**Terminal 2**: Start the frontend

```sh Frontend
npx vite
```

Open `http://localhost:5173` in your browser. Try opening multiple tabs to see realtime sync in action.

Visit [http://localhost:6420](http://localhost:6420) in your browser (or point your AI agent at it) to open the Rivet developer tools and inspect your actors live.

### Deploy

## Configuration Options

_Source doc path: /docs/actors/quickstart/react_
