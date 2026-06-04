# Hermes Web UI — Project Breakdown

## What It Is
A self-hosted, browser-based chat interface for the **Hermes Agent** by NousResearch.
No Node.js, no build step, no frontend framework — pure Python + vanilla JS.

## Architecture

### Backend
- `server.py` — ThreadingHTTPServer, routes to api/routes.py
- `api/routes.py` — main routing (~600KB, ~15k LOC)
- `api/config.py` — env-var config, global state
- `api/models.py` — session/project CRUD (JSON file persistence)
- `api/streaming.py` — SSE streaming of agent responses
- `api/auth.py` — bcrypt password, session cookies, WebAuthn
- `api/profiles.py` — multi-user profile isolation
- `api/terminal.py` — embedded PTY terminal
- `api/workspace.py` — file browser + git integration
- `api/providers.py` — LLM provider abstraction

### Frontend (static/)
- Pure vanilla JS, no build step
- `static/ui.js` (430KB) — main UI controller
- `static/panels.js` (375KB) — three-panel layout
- `static/sessions.js` — session list, projects, drag-drop
- `static/messages.js` — markdown, KaTeX, code highlighting
- `static/terminal.js` — xterm.js terminal panel
- `static/style.css` (350KB) — dark/light themes, Catppuccin
- `static/sw.js` — PWA service worker

### MCP Server (mcp_server.py)
Exposes WebUI as an MCP server. Tools:
- `list_projects`, `create_project`, `rename_project`, `delete_project`
- `list_sessions`, `rename_session`, `move_session`

## Key Features
1. Three-panel layout: Sessions | Chat | Workspace
2. Real-time SSE streaming with circular token usage ring
3. Multi-profile isolation
4. Embedded browser terminal (PTY)
5. Workspace file browser with Git status
6. PWA — installable, offline-capable
7. Optional TLS/HTTPS
8. WebAuthn/passkeys
9. Edge TTS (optional)
10. KaTeX math rendering
11. i18n multi-language
12. Docker support

## Config (env vars)
| Var | Default | Purpose |
|-----|---------|--------|
| HERMES_WEBUI_HOST | 127.0.0.1 | Bind address |
| HERMES_WEBUI_PORT | 8787 | Port |
| HERMES_WEBUI_PASSWORD | (none) | Auth password |
| HERMES_WEBUI_STATE_DIR | ~/.hermes/webui | Storage |
| HERMES_WEBUI_TLS_CERT/KEY | (none) | TLS |

## Stack
- Python 3.10+, Vanilla JS ES2020
- Only 2 pip deps: pyyaml, cryptography
- JSON file storage in ~/.hermes/webui/
- Default port: 8787
