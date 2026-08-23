---
name: hermes-webui
description: >
  Lightweight dark-themed web UI for Hermes Agent — full CLI parity from a browser.
  Three-panel layout: sessions sidebar, chat center, workspace file browser. No build step,
  no framework, vanilla Python + JS. SSH tunnel for secure remote access to VPS agent.
  Use when managing the Hermes agent on VPS 146.190.78.120 from browser or phone.
  Trigger on: "hermes webui", "hermes UI", "hermes browser", "agent web interface",
  "hermes dashboard", "nesquena", "hermes control center".
source: https://github.com/nesquena/hermes-webui
author: nesquena
stack: Python + Vanilla JS (no build step, no framework)
requires: Running Hermes Agent instance
---

# Hermes WebUI — Browser Interface for Hermes Agent

> "1:1 parity with Hermes CLI from a convenient web UI."

Lightweight Python server + vanilla JS frontend. Three-panel layout. No bundler, no build step. SSH tunnel for secure access to your VPS agent from anywhere — laptop, tablet, or phone.

---

## Space Age Integration

Primary use: Control the Hermes Agent running on VPS 146.190.78.120 from browser/phone without SSH terminal access.

| Feature | Space Age Use Case |
|---|---|
| Sessions sidebar | Track all active lead gen, outreach, and build sessions |
| Chat center | Send commands to Hermes without opening terminal |
| Workspace browser | Browse /home/leads, /home/sites, /home/outreach files |
| Context ring | Monitor token usage per session |
| Hermes Control Center | Switch models, profiles, workspaces from launcher |
| Mobile access | Manage overnight builds from phone via SSH tunnel |

---

## Install

```bash
# On VPS 146.190.78.120
git clone https://github.com/nesquena/hermes-webui.git
cd hermes-webui
pip install -r requirements.txt
cp .env.example .env    # configure HERMES_PATH, PORT, etc

# Start the server
python bootstrap.py     # or: ./ctl.sh start

# Docker option
docker-compose -f docker-compose.three-container.yml up
```

---

## Secure Remote Access (SSH Tunnel)

```bash
# From your local machine — creates secure tunnel to VPS
ssh -L 8080:localhost:8080 root@146.190.78.120

# Then open in browser:
http://localhost:8080

# For mobile access (same WiFi):
ssh -L 0.0.0.0:8080:localhost:8080 root@146.190.78.120
# Open http://[your-laptop-ip]:8080 on phone
```

---

## UI Layout

```
┌─────────────┬──────────────────────────┬─────────────┐
│  Sessions   │      Chat Center         │  Workspace  │
│  Sidebar    │                          │  Browser    │
│             │  [message history]       │             │
│ • Session 1 │                          │ /home/leads │
│ • Session 2 │  [context ring: 45%]     │ /home/sites │
│ • Session 3 │                          │ /home/logs  │
│             │  [composer footer]       │             │
│ [+ New]     │  Model | Profile | WS    │ [preview]   │
│             │                          │             │
│ [⚙ Control] │  [Send]                  │             │
└─────────────┴──────────────────────────┴─────────────┘
```

**Composer footer** (always visible): Model selector | Profile | Workspace controls  
**Context ring**: Circular token usage indicator at a glance  
**Hermes Control Center**: Full settings launcher at sidebar bottom

---

## Key Features

### Sessions Management
- Create, name, tag, and archive sessions
- Projects grouping for related sessions
- Tool call cards — visual representation of each agent action

### Workspace File Browser
- Browse any directory on the VPS
- Inline preview for text, code, images
- Direct file access without SSH terminal

### Streaming
```python
# api/streaming.py handles real-time response streaming
# Full streaming parity with CLI — no buffering delay
```

### Profiles
- Multiple Hermes profiles (lead gen, outreach, build, research)
- Switch profiles from composer footer without restarting

### Light + Dark Mode
- Dark default (Space Age compatible)
- Light mode available
- Themes: see THEMES.md

---

## API Architecture

```
api/
  streaming.py       Real-time response streaming
  session_ops.py     Session CRUD + state management
  workspace.py       File browser + preview
  profiles.py        Profile switching
  providers.py       Model provider routing
  agent_sessions.py  Hermes agent session bridge
  auth.py            Password protection (optional)
  terminal.py        Terminal passthrough (advanced)
  goals.py           Goal tracking across sessions
  kanban_bridge.py   Kanban view for task tracking
```

---

## VPS Setup (146.190.78.120)

```bash
# Full production setup
cd /home && git clone https://github.com/nesquena/hermes-webui.git
cd hermes-webui

# Configure
cat > .env << EOF
HERMES_PATH=/home/hermes
PORT=8080
REQUIRE_PASSWORD=true
PASSWORD=your-secure-password
WORKSPACE_ROOT=/home/spaceage
EOF

# Start with PM2
pm2 start "python bootstrap.py" --name hermes-webui
pm2 save

# Verify
curl http://localhost:8080/api/system_health
```

---

## Telegram Bot → WebUI Bridge

Since you control Hermes via Telegram, WebUI provides the complementary visual layer:

```
Telegram → Quick commands (on the go)
WebUI    → Full session management + file browser + streaming view
```

Both connect to the same Hermes instance — use whichever fits the context.

---

## Session Recovery

```python
# api/session_recovery.py
# Hermes WebUI auto-recovers interrupted sessions
# Reconnects to running Hermes processes after network drops
# Critical for overnight unattended runs
```

---

## Trigger This Skill When
- Setting up browser access to Hermes Agent on VPS
- User says: "hermes webui", "hermes browser", "hermes UI", "hermes dashboard"
- Need to manage overnight builds from phone/tablet
- Setting up SSH tunnel for remote agent access
- Replacing terminal-only Hermes access with visual interface
