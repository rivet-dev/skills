---
name: "sandbox-agent"
description: "Deploy, configure, and integrate Sandbox Agent - a universal API for orchestrating AI coding agents (Claude Code, Codex, OpenCode, Amp) in sandboxed environments. Use when setting up sandbox-agent server locally or in cloud sandboxes (E2B, Daytona, Docker), creating and managing agent sessions via SDK or API, streaming agent events and handling human-in-the-loop interactions, building chat UIs for coding agents, or understanding the universal schema for agent responses."
---

# Sandbox Agent

Sandbox Agent provides a universal API for orchestrating AI coding agents in sandboxed environments.

## What To Do If You Get Stuck

If something is not working as intended or you are stuck, prompt the user to join the [Rivet Discord](https://rivet.dev/discord) or file an issue on [GitHub](https://github.com/rivet-dev/sandbox-agent/issues) to report an issue and get help.

Provide the user with a pre-generated report with:

- Symptoms
	- If this is happening in local dev, deployed, or both
	- The error you're seeing
	- Relevant source code related to this
- What you've tried to solve it
- Environment
	- Sandbox Agent version
	- SDK in use (TypeScript, Python, or HTTP)
	- Agent in use (Claude Code, Codex, OpenCode, Amp, Mock)
	- Sandbox provider (E2B, Daytona, Docker, local)

## Quickstart

### Install skill (optional)

#### npx

```bash
npx skills add rivet-dev/skills -s sandbox-agent
```

#### bunx

```bash
bunx skills add rivet-dev/skills -s sandbox-agent
```

### Set environment variables

Each coding agent requires API keys to connect to their respective LLM providers.

#### Local shell

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
export OPENAI_API_KEY="sk-..."
```

#### E2B

```typescript
import { Sandbox } from "@e2b/code-interpreter";

const envs: Record<string, string> = {};
if (process.env.ANTHROPIC_API_KEY) envs.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (process.env.OPENAI_API_KEY) envs.OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const sandbox = await Sandbox.create({ envs });
```

#### Daytona

```typescript
import { Daytona } from "@daytonaio/sdk";

const envVars: Record<string, string> = {};
if (process.env.ANTHROPIC_API_KEY) envVars.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (process.env.OPENAI_API_KEY) envVars.OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const daytona = new Daytona();
const sandbox = await daytona.create({
  snapshot: "sandbox-agent-ready",
  envVars,
});
```

#### Docker

```bash
docker run -p 2468:2468 \
  -e ANTHROPIC_API_KEY="sk-ant-..." \
  -e OPENAI_API_KEY="sk-..." \
  rivetdev/sandbox-agent:0.5.2-full \
  server --no-token --host 0.0.0.0 --port 2468
```

#### Extracting API keys from current machine

Use `sandbox-agent credentials extract-env --export` to extract your existing API keys (Anthropic, OpenAI, etc.) from local Claude Code or Codex config files.

#### Testing without API keys

Use the `mock` agent for SDK and integration testing without provider credentials.

#### Multi-tenant and per-user billing

For per-tenant token tracking, budget enforcement, or usage-based billing, see [LLM Credentials](/sandbox-agent/docs/llm-credentials) for gateway options like OpenRouter, LiteLLM, and Portkey.

### Run the server

#### curl

Install and run the binary directly.

```bash
curl -fsSL https://releases.rivet.dev/sandbox-agent/0.5.x/install.sh | sh
sandbox-agent server --no-token --host 0.0.0.0 --port 2468
```

#### npx

Run without installing globally.

```bash
npx @sandbox-agent/cli@0.5.x server --no-token --host 0.0.0.0 --port 2468
```

#### bunx

Run without installing globally.

```bash
bunx @sandbox-agent/cli@0.5.x server --no-token --host 0.0.0.0 --port 2468
```

#### npm i -g

Install globally, then run.

```bash
npm install -g @sandbox-agent/cli@0.5.x
sandbox-agent server --no-token --host 0.0.0.0 --port 2468
```

#### bun add -g

Install globally, then run.

```bash
bun add -g @sandbox-agent/cli@0.5.x
# Allow Bun to run postinstall scripts for native binaries (required for SandboxAgent.start()).
bun pm -g trust @sandbox-agent/cli-linux-x64 @sandbox-agent/cli-linux-arm64 @sandbox-agent/cli-darwin-arm64 @sandbox-agent/cli-darwin-x64 @sandbox-agent/cli-win32-x64
sandbox-agent server --no-token --host 0.0.0.0 --port 2468
```

#### Node.js (local)

For local development, use `SandboxAgent.start()` to spawn and manage the server as a subprocess.

```bash
npm install sandbox-agent@0.5.x
```

```typescript
import { SandboxAgent } from "sandbox-agent";

const sdk = await SandboxAgent.start();
```

#### Bun (local)

For local development, use `SandboxAgent.start()` to spawn and manage the server as a subprocess.

```bash
bun add sandbox-agent@0.5.x
# Allow Bun to run postinstall scripts for native binaries (required for SandboxAgent.start()).
bun pm trust @sandbox-agent/cli-linux-x64 @sandbox-agent/cli-linux-arm64 @sandbox-agent/cli-darwin-arm64 @sandbox-agent/cli-darwin-x64 @sandbox-agent/cli-win32-x64
```

```typescript
import { SandboxAgent } from "sandbox-agent";

const sdk = await SandboxAgent.start();
```

#### Build from source

If you're running from source instead of the installed CLI.

```bash
cargo run -p sandbox-agent -- server --no-token --host 0.0.0.0 --port 2468
```

Binding to `0.0.0.0` allows the server to accept connections from any network interface, which is required when running inside a sandbox where clients connect remotely.

#### Configuring token

Tokens are usually not required. Most sandbox providers (E2B, Daytona, etc.) already secure networking at the infrastructure layer.

If you expose the server publicly, use `--token "$SANDBOX_TOKEN"` to require authentication:

```bash
sandbox-agent server --token "$SANDBOX_TOKEN" --host 0.0.0.0 --port 2468
```

Then pass the token when connecting:

#### TypeScript

```typescript
import { SandboxAgent } from "sandbox-agent";

const sdk = await SandboxAgent.connect({
  baseUrl: "http://your-server:2468",
  token: process.env.SANDBOX_TOKEN,
});
```

#### curl

```bash
curl "http://your-server:2468/v1/health" \
  -H "Authorization: Bearer $SANDBOX_TOKEN"
```

#### CLI

```bash
sandbox-agent --token "$SANDBOX_TOKEN" api agents list \
  --endpoint http://your-server:2468
```

#### CORS

If you're calling the server from a browser, see the [CORS configuration guide](/sandbox-agent/docs/cors).

### Install agents (optional)

To preinstall agents:

```bash
sandbox-agent install-agent --all
```

If agents are not installed up front, they are lazily installed when creating a session.

### Install desktop dependencies (optional, Linux only)

If you want to use `/v1/desktop/*`, install the desktop runtime packages first:

```bash
sandbox-agent install desktop --yes
```

Then use `GET /v1/desktop/status` or `sdk.getDesktopStatus()` to verify the runtime is ready before calling desktop screenshot or input APIs.

### Create a session

```typescript
import { SandboxAgent } from "sandbox-agent";

const sdk = await SandboxAgent.connect({
  baseUrl: "http://127.0.0.1:2468",
});

const session = await sdk.createSession({
  agent: "claude",
  sessionInit: {
    cwd: "/",
    mcpServers: [],
  },
});

console.log(session.id);
```

### Send a message

```typescript
const result = await session.prompt([
  { type: "text", text: "Summarize the repository and suggest next steps." },
]);

console.log(result.stopReason);
```

### Read events

```typescript
const off = session.onEvent((event) => {
  console.log(event.sender, event.payload);
});

const page = await sdk.getEvents({
  sessionId: session.id,
  limit: 50,
});

console.log(page.items.length);
off();
```

### Test with Inspector

Open the Inspector UI at `/ui/` on your server (for example, `http://localhost:2468/ui/`) to inspect sessions and events in a GUI.

![Sandbox Agent Inspector](https://rivet.dev/sandbox-agent/docs/sandbox-agent/images/inspector.png)

## Next steps

- [Session Persistence](/sandbox-agent/docs/session-persistence) — Configure in-memory, Rivet Actor state, IndexedDB, SQLite, and Postgres persistence.

- [Deploy to a Sandbox](/sandbox-agent/docs/deploy/local) — Deploy your agent to E2B, Daytona, Docker, Vercel, or Cloudflare.

- [SDK Overview](/sandbox-agent/docs/sdk-overview) — Use the latest TypeScript SDK API.

## Reference Map

### Agents

- [Amp](references/agents/amp.md)
- [Claude](references/agents/claude.md)
- [Codex](references/agents/codex.md)
- [Cursor](references/agents/cursor.md)
- [OpenCode](references/agents/opencode.md)
- [Pi](references/agents/pi.md)

### AI

- [llms.txt](references/ai/llms-txt.md)
- [skill.md](references/ai/skill.md)

### Api Reference

- [AcpEnvelope](references/api-reference/schemas/acpenvelope.md)
- [AcpPostQuery](references/api-reference/schemas/acppostquery.md)
- [AcpServerInfo](references/api-reference/schemas/acpserverinfo.md)
- [AcpServerListResponse](references/api-reference/schemas/acpserverlistresponse.md)
- [AgentCapabilities](references/api-reference/schemas/agentcapabilities.md)
- [AgentInfo](references/api-reference/schemas/agentinfo.md)
- [AgentInstallArtifact](references/api-reference/schemas/agentinstallartifact.md)
- [AgentInstallRequest](references/api-reference/schemas/agentinstallrequest.md)
- [AgentInstallResponse](references/api-reference/schemas/agentinstallresponse.md)
- [AgentListResponse](references/api-reference/schemas/agentlistresponse.md)
- [Authentication](references/api-reference/authentication.md)
- [Capture a desktop screenshot region.](references/api-reference/operations/get_v1_desktop_screenshot_region.md)
- [Capture a full desktop screenshot.](references/api-reference/operations/get_v1_desktop_screenshot.md)
- [Click on the desktop.](references/api-reference/operations/post_v1_desktop_mouse_click.md)
- [Create a long-lived managed process.](references/api-reference/operations/post_v1_processes.md)
- [Delete a desktop recording.](references/api-reference/operations/delete_v1_desktop_recording.md)
- [Delete a process record.](references/api-reference/operations/delete_v1_process.md)
- [delete_v1_acp](references/api-reference/operations/delete_v1_acp.md)
- [delete_v1_config_mcp](references/api-reference/operations/delete_v1_config_mcp.md)
- [delete_v1_config_skills](references/api-reference/operations/delete_v1_config_skills.md)
- [delete_v1_fs_entry](references/api-reference/operations/delete_v1_fs_entry.md)
- [DesktopActionResponse](references/api-reference/schemas/desktopactionresponse.md)
- [DesktopClipboardQuery](references/api-reference/schemas/desktopclipboardquery.md)
- [DesktopClipboardResponse](references/api-reference/schemas/desktopclipboardresponse.md)
- [DesktopClipboardWriteRequest](references/api-reference/schemas/desktopclipboardwriterequest.md)
- [DesktopDisplayInfoResponse](references/api-reference/schemas/desktopdisplayinforesponse.md)
- [DesktopErrorInfo](references/api-reference/schemas/desktoperrorinfo.md)
- [DesktopKeyboardDownRequest](references/api-reference/schemas/desktopkeyboarddownrequest.md)
- [DesktopKeyboardPressRequest](references/api-reference/schemas/desktopkeyboardpressrequest.md)
- [DesktopKeyboardTypeRequest](references/api-reference/schemas/desktopkeyboardtyperequest.md)
- [DesktopKeyboardUpRequest](references/api-reference/schemas/desktopkeyboarduprequest.md)
- [DesktopKeyModifiers](references/api-reference/schemas/desktopkeymodifiers.md)
- [DesktopLaunchRequest](references/api-reference/schemas/desktoplaunchrequest.md)
- [DesktopLaunchResponse](references/api-reference/schemas/desktoplaunchresponse.md)
- [DesktopMouseButton](references/api-reference/schemas/desktopmousebutton.md)
- [DesktopMouseClickRequest](references/api-reference/schemas/desktopmouseclickrequest.md)
- [DesktopMouseDownRequest](references/api-reference/schemas/desktopmousedownrequest.md)
- [DesktopMouseDragRequest](references/api-reference/schemas/desktopmousedragrequest.md)
- [DesktopMouseMoveRequest](references/api-reference/schemas/desktopmousemoverequest.md)
- [DesktopMousePositionResponse](references/api-reference/schemas/desktopmousepositionresponse.md)
- [DesktopMouseScrollRequest](references/api-reference/schemas/desktopmousescrollrequest.md)
- [DesktopMouseUpRequest](references/api-reference/schemas/desktopmouseuprequest.md)
- [DesktopOpenRequest](references/api-reference/schemas/desktopopenrequest.md)
- [DesktopOpenResponse](references/api-reference/schemas/desktopopenresponse.md)
- [DesktopProcessInfo](references/api-reference/schemas/desktopprocessinfo.md)
- [DesktopRecordingInfo](references/api-reference/schemas/desktoprecordinginfo.md)
- [DesktopRecordingListResponse](references/api-reference/schemas/desktoprecordinglistresponse.md)
- [DesktopRecordingStartRequest](references/api-reference/schemas/desktoprecordingstartrequest.md)
- [DesktopRecordingStatus](references/api-reference/schemas/desktoprecordingstatus.md)
- [DesktopRegionScreenshotQuery](references/api-reference/schemas/desktopregionscreenshotquery.md)
- [DesktopResolution](references/api-reference/schemas/desktopresolution.md)
- [DesktopScreenshotFormat](references/api-reference/schemas/desktopscreenshotformat.md)
- [DesktopScreenshotQuery](references/api-reference/schemas/desktopscreenshotquery.md)
- [DesktopStartRequest](references/api-reference/schemas/desktopstartrequest.md)
- [DesktopState](references/api-reference/schemas/desktopstate.md)
- [DesktopStatusResponse](references/api-reference/schemas/desktopstatusresponse.md)
- [DesktopStreamStatusResponse](references/api-reference/schemas/desktopstreamstatusresponse.md)
- [DesktopWindowInfo](references/api-reference/schemas/desktopwindowinfo.md)
- [DesktopWindowListResponse](references/api-reference/schemas/desktopwindowlistresponse.md)
- [DesktopWindowMoveRequest](references/api-reference/schemas/desktopwindowmoverequest.md)
- [DesktopWindowResizeRequest](references/api-reference/schemas/desktopwindowresizerequest.md)
- [Download a desktop recording.](references/api-reference/operations/get_v1_desktop_recording_download.md)
- [Drag the desktop mouse.](references/api-reference/operations/post_v1_desktop_mouse_drag.md)
- [ErrorType](references/api-reference/schemas/errortype.md)
- [Fetch process logs.](references/api-reference/operations/get_v1_process_logs.md)
- [Focus a desktop window.](references/api-reference/operations/post_v1_desktop_window_focus.md)
- [FsActionResponse](references/api-reference/schemas/fsactionresponse.md)
- [FsDeleteQuery](references/api-reference/schemas/fsdeletequery.md)
- [FsEntriesQuery](references/api-reference/schemas/fsentriesquery.md)
- [FsEntry](references/api-reference/schemas/fsentry.md)
- [FsEntryType](references/api-reference/schemas/fsentrytype.md)
- [FsMoveRequest](references/api-reference/schemas/fsmoverequest.md)
- [FsMoveResponse](references/api-reference/schemas/fsmoveresponse.md)
- [FsPathQuery](references/api-reference/schemas/fspathquery.md)
- [FsStat](references/api-reference/schemas/fsstat.md)
- [FsUploadBatchQuery](references/api-reference/schemas/fsuploadbatchquery.md)
- [FsUploadBatchResponse](references/api-reference/schemas/fsuploadbatchresponse.md)
- [FsWriteResponse](references/api-reference/schemas/fswriteresponse.md)
- [Get a single process by ID.](references/api-reference/operations/get_v1_process.md)
- [Get desktop display information.](references/api-reference/operations/get_v1_desktop_display_info.md)
- [Get desktop recording metadata.](references/api-reference/operations/get_v1_desktop_recording.md)
- [Get desktop runtime status.](references/api-reference/operations/get_v1_desktop_status.md)
- [Get desktop stream status.](references/api-reference/operations/get_v1_desktop_stream_status.md)
- [Get process runtime configuration.](references/api-reference/operations/get_v1_processes_config.md)
- [Get the current desktop mouse position.](references/api-reference/operations/get_v1_desktop_mouse_position.md)
- [Get the currently focused desktop window.](references/api-reference/operations/get_v1_desktop_windows_focused.md)
- [get_v1_acp](references/api-reference/operations/get_v1_acp.md)
- [get_v1_acp_servers](references/api-reference/operations/get_v1_acp_servers.md)
- [get_v1_agent](references/api-reference/operations/get_v1_agent.md)
- [get_v1_agents](references/api-reference/operations/get_v1_agents.md)
- [get_v1_config_mcp](references/api-reference/operations/get_v1_config_mcp.md)
- [get_v1_config_skills](references/api-reference/operations/get_v1_config_skills.md)
- [get_v1_fs_entries](references/api-reference/operations/get_v1_fs_entries.md)
- [get_v1_fs_file](references/api-reference/operations/get_v1_fs_file.md)
- [get_v1_fs_stat](references/api-reference/operations/get_v1_fs_stat.md)
- [get_v1_health](references/api-reference/operations/get_v1_health.md)
- [HealthResponse](references/api-reference/schemas/healthresponse.md)
- [HTTP API](references/api-reference/index.md)
- [Launch a desktop application.](references/api-reference/operations/post_v1_desktop_launch.md)
- [List all managed processes.](references/api-reference/operations/get_v1_processes.md)
- [List desktop recordings.](references/api-reference/operations/get_v1_desktop_recordings.md)
- [List visible desktop windows.](references/api-reference/operations/get_v1_desktop_windows.md)
- [McpCommand](references/api-reference/schemas/mcpcommand.md)
- [McpConfigQuery](references/api-reference/schemas/mcpconfigquery.md)
- [McpOAuthConfig](references/api-reference/schemas/mcpoauthconfig.md)
- [McpOAuthConfigOrDisabled](references/api-reference/schemas/mcpoauthconfigordisabled.md)
- [McpRemoteTransport](references/api-reference/schemas/mcpremotetransport.md)
- [McpServerConfig](references/api-reference/schemas/mcpserverconfig.md)
- [Move a desktop window.](references/api-reference/operations/post_v1_desktop_window_move.md)
- [Move the desktop mouse.](references/api-reference/operations/post_v1_desktop_mouse_move.md)
- [Open a desktop WebRTC signaling session.](references/api-reference/operations/get_v1_desktop_stream_ws.md)
- [Open a file or URL with the default handler.](references/api-reference/operations/post_v1_desktop_open.md)
- [Open an interactive WebSocket terminal session.](references/api-reference/operations/get_v1_process_terminal_ws.md)
- [post_v1_acp](references/api-reference/operations/post_v1_acp.md)
- [post_v1_agent_install](references/api-reference/operations/post_v1_agent_install.md)
- [post_v1_fs_mkdir](references/api-reference/operations/post_v1_fs_mkdir.md)
- [post_v1_fs_move](references/api-reference/operations/post_v1_fs_move.md)
- [post_v1_fs_upload_batch](references/api-reference/operations/post_v1_fs_upload_batch.md)
- [Press a desktop keyboard shortcut.](references/api-reference/operations/post_v1_desktop_keyboard_press.md)
- [Press and hold a desktop keyboard key.](references/api-reference/operations/post_v1_desktop_keyboard_down.md)
- [Press and hold a desktop mouse button.](references/api-reference/operations/post_v1_desktop_mouse_down.md)
- [ProblemDetails](references/api-reference/schemas/problemdetails.md)
- [ProcessConfig](references/api-reference/schemas/processconfig.md)
- [ProcessCreateRequest](references/api-reference/schemas/processcreaterequest.md)
- [ProcessInfo](references/api-reference/schemas/processinfo.md)
- [ProcessInputRequest](references/api-reference/schemas/processinputrequest.md)
- [ProcessInputResponse](references/api-reference/schemas/processinputresponse.md)
- [ProcessListQuery](references/api-reference/schemas/processlistquery.md)
- [ProcessListResponse](references/api-reference/schemas/processlistresponse.md)
- [ProcessLogEntry](references/api-reference/schemas/processlogentry.md)
- [ProcessLogsQuery](references/api-reference/schemas/processlogsquery.md)
- [ProcessLogsResponse](references/api-reference/schemas/processlogsresponse.md)
- [ProcessLogsStream](references/api-reference/schemas/processlogsstream.md)
- [ProcessOwner](references/api-reference/schemas/processowner.md)
- [ProcessRunRequest](references/api-reference/schemas/processrunrequest.md)
- [ProcessRunResponse](references/api-reference/schemas/processrunresponse.md)
- [ProcessSignalQuery](references/api-reference/schemas/processsignalquery.md)
- [ProcessState](references/api-reference/schemas/processstate.md)
- [ProcessTerminalResizeRequest](references/api-reference/schemas/processterminalresizerequest.md)
- [ProcessTerminalResizeResponse](references/api-reference/schemas/processterminalresizeresponse.md)
- [put_v1_config_mcp](references/api-reference/operations/put_v1_config_mcp.md)
- [put_v1_config_skills](references/api-reference/operations/put_v1_config_skills.md)
- [put_v1_fs_file](references/api-reference/operations/put_v1_fs_file.md)
- [Read the desktop clipboard.](references/api-reference/operations/get_v1_desktop_clipboard.md)
- [Release a desktop keyboard key.](references/api-reference/operations/post_v1_desktop_keyboard_up.md)
- [Release a desktop mouse button.](references/api-reference/operations/post_v1_desktop_mouse_up.md)
- [Resize a desktop window.](references/api-reference/operations/post_v1_desktop_window_resize.md)
- [Resize a process terminal.](references/api-reference/operations/post_v1_process_terminal_resize.md)
- [Run a one-shot command.](references/api-reference/operations/post_v1_processes_run.md)
- [Schemas](references/api-reference/schemas/index.md)
- [Scroll the desktop mouse wheel.](references/api-reference/operations/post_v1_desktop_mouse_scroll.md)
- [Send SIGKILL to a process.](references/api-reference/operations/post_v1_process_kill.md)
- [Send SIGTERM to a process.](references/api-reference/operations/post_v1_process_stop.md)
- [ServerStatus](references/api-reference/schemas/serverstatus.md)
- [ServerStatusInfo](references/api-reference/schemas/serverstatusinfo.md)
- [SkillsConfig](references/api-reference/schemas/skillsconfig.md)
- [SkillsConfigQuery](references/api-reference/schemas/skillsconfigquery.md)
- [SkillSource](references/api-reference/schemas/skillsource.md)
- [Start desktop recording.](references/api-reference/operations/post_v1_desktop_recording_start.md)
- [Start desktop streaming.](references/api-reference/operations/post_v1_desktop_stream_start.md)
- [Start the private desktop runtime.](references/api-reference/operations/post_v1_desktop_start.md)
- [Stop desktop recording.](references/api-reference/operations/post_v1_desktop_recording_stop.md)
- [Stop desktop streaming.](references/api-reference/operations/post_v1_desktop_stream_stop.md)
- [Stop the private desktop runtime.](references/api-reference/operations/post_v1_desktop_stop.md)
- [Type desktop keyboard text.](references/api-reference/operations/post_v1_desktop_keyboard_type.md)
- [Update process runtime configuration.](references/api-reference/operations/post_v1_processes_config.md)
- [v1](references/api-reference/tags/v1.md)
- [Write input to a process.](references/api-reference/operations/post_v1_process_input.md)
- [Write to the desktop clipboard.](references/api-reference/operations/post_v1_desktop_clipboard.md)

### Deploy

- [Agent Computer](references/deploy/agentcomputer.md)
- [BoxLite](references/deploy/boxlite.md)
- [Cloudflare](references/deploy/cloudflare.md)
- [ComputeSDK](references/deploy/computesdk.md)
- [Daytona](references/deploy/daytona.md)
- [Docker](references/deploy/docker.md)
- [E2B](references/deploy/e2b.md)
- [Local](references/deploy/local.md)
- [Modal](references/deploy/modal.md)
- [Vercel](references/deploy/vercel.md)

### General

- [Agent Sessions](references/agent-sessions.md)
- [Architecture](references/architecture.md)
- [Attachments](references/attachments.md)
- [CLI Reference](references/cli.md)
- [Common Software](references/common-software.md)
- [Computer Use](references/computer-use.md)
- [CORS Configuration](references/cors.md)
- [Custom Tools](references/custom-tools.md)
- [Daemon](references/daemon.md)
- [File System](references/file-system.md)
- [Inspector](references/inspector.md)
- [LLM Credentials](references/llm-credentials.md)
- [Manage Sessions](references/manage-sessions.md)
- [MCP](references/mcp-config.md)
- [Multiplayer](references/multiplayer.md)
- [Observability](references/observability.md)
- [OpenCode Compatibility](references/opencode-compatibility.md)
- [Orchestration Architecture](references/orchestration-architecture.md)
- [Persisting Sessions](references/session-persistence.md)
- [Processes](references/processes.md)
- [Quickstart](references/quickstart.md)
- [React Components](references/react-components.md)
- [Sandbox Agent](references/index.md)
- [SDK Overview](references/sdk-overview.md)
- [Security](references/security.md)
- [Session Restoration](references/session-restoration.md)
- [Skills](references/skills-config.md)
- [Telemetry](references/telemetry.md)
- [Troubleshooting](references/troubleshooting.md)
