---
name: open-design-openrouter
description: >
  Runbook for connecting a local Open Design install to OpenRouter instead of
  Claude/OpenAI directly. Installs and authenticates the OpenCode CLI against
  OpenRouter, smoke-tests the connection, restarts the Open Design daemon so it
  detects OpenCode on $PATH, and switches the agent dropdown in the Open Design
  UI to OpenCode. Covers the free-vs-paid OpenRouter model choice, API key setup,
  troubleshooting (401s, rate limits, missing PATH), and a Codex + env-redirect
  fallback for the known OpenCode adapter regression (Open Design issue #163).
  Use when a user wants to run Open Design against OpenRouter models (free or
  paid/BYOC), stop burning their Anthropic weekly cap on design generation, or
  troubleshoot the Open Design agent dropdown not showing OpenCode/Codex.
source: https://openrouter.ai/keys
requires: Open Design cloned locally (default ~/Desktop/open-design), Node 20+, npm, macOS/Linux/WSL
---

## Overview

Open Design's local daemon scans `$PATH` at startup to detect which coding CLIs
are available, and lists them in an agent dropdown. This skill wires in
[OpenCode](https://github.com/opencode-ai/opencode) configured to talk to
[OpenRouter](https://openrouter.ai) instead of a provider talking directly to
Anthropic/OpenAI, so Open Design can drive design generation through any
OpenRouter model — including free-tier ones — instead of the default Claude
agent. Total setup time is about 10 minutes.

**Always ask the user the free-vs-paid question (Step 1) before writing any
config, and always wait for their OpenRouter key (Step 2) before proceeding.
Don't push through a failed smoke test (Step 5) — stop and surface the error.**
This is idempotent: if a step is already done (OpenCode already installed,
Open Design already cloned), skip ahead rather than redoing it.

## Step 0 — Pre-flight

```bash
node --version
npm --version
which open-design 2>/dev/null || ls ~/Desktop/open-design 2>/dev/null
echo $SHELL
```

Expect Node ≥ v20.0.0, npm available, an Open Design folder somewhere, and a
shell of `/bin/zsh` or `/bin/bash`. If anything fails, stop and tell the user
what's missing before proceeding.

## Step 1 — Ask the user: free or paid OpenRouter?

Don't assume — ask, and save the answer as `PATH_CHOICE` (`free` or `paid`).

**Path A — Free models** (no card needed): models tagged `:free` (DeepSeek
V3.1, Llama 3.3 70B, Qwen Coder 32B, Gemini 2.0 Flash exp, Mistral Small 24B).
Rate-limited (~20 req/min, ~200/day per model); solid for testing, hobby
builds, and occasional design work, but some free models throttle hard
mid-session.

**Path B — Paid (BYOC, fractional cents per call)**: same models without the
`:free` suffix, plus paid-only ones (Claude Sonnet 4.7, GPT-5.5, DeepSeek V3
Pro). A one-time $5 top-up on OpenRouter runs roughly $0.30/design, with no
rate limits or quality cliff. Best for real work and client deliverables.

## Step 2 — Get the OpenRouter API key

Tell the user to open **https://openrouter.ai/keys**, sign in (or create a
free account), click **Create Key**, name it something like `open-design`,
copy the key (starts with `sk-or-v1-...`), and paste it back.

Wait for the key — don't proceed without it. Save it as `OPENROUTER_KEY` and
validate the format:

```bash
echo "$OPENROUTER_KEY" | grep -E '^sk-or-v1-[a-zA-Z0-9]{20,}$' || echo "INVALID FORMAT"
```

Ask again if invalid. Never echo the full key back in chat after it's saved —
confirm it was stored, and if you need to print it, mask everything but the
last 4 characters.

## Step 3 — Install the OpenCode CLI

```bash
npm install -g opencode-ai
opencode --version
```

Expect a version number (e.g. `0.x.x`). If `command not found`:

```bash
NPM_BIN=$(npm prefix -g)/bin
echo "Add this to ~/.zshrc: export PATH=\"$NPM_BIN:\$PATH\""
```

Have the user add that line and run `source ~/.zshrc`.

## Step 4 — Configure OpenCode with the OpenRouter key

Pick the default model from the user's Step 1 choice:

| `PATH_CHOICE` | Default model |
|---|---|
| `free` | `deepseek/deepseek-chat-v3.1:free` |
| `paid` | `anthropic/claude-sonnet-4.7` |

```bash
mkdir -p ~/.config/opencode
cat > ~/.config/opencode/config.json << EOF
{
  "providers": {
    "openrouter": {
      "apiKey": "$OPENROUTER_KEY",
      "baseURL": "https://openrouter.ai/api/v1"
    }
  },
  "defaultProvider": "openrouter",
  "defaultModel": "$DEFAULT_MODEL"
}
EOF
chmod 600 ~/.config/opencode/config.json
```

The `chmod 600` matters — the config holds the API key in plaintext. Confirm
to the user: "OpenCode configured with OpenRouter. Default model:
`$DEFAULT_MODEL`. Config locked at `~/.config/opencode/config.json`."

## Step 5 — Smoke-test OpenCode

```bash
opencode "Say hello in exactly three words."
```

Expect a 3-word response. **If this fails, stop here and surface the error —
don't proceed to Step 6.**

| Output | Meaning | Fix |
|---|---|---|
| `401 Unauthorized` | bad key | re-prompt for the OpenRouter key |
| `429 rate limit` | free tier throttled | wait 60s and retry, or suggest the paid path |
| `model not found` | typo / deprecated slug | try a different model from the lists in Step 9 |
| hangs > 30s | network issue | `curl https://openrouter.ai/api/v1/models -H "Authorization: Bearer $OPENROUTER_KEY"` |

## Step 6 — Verify the Open Design install

Default location is `~/Desktop/open-design`; ask the user if it's not there.

```bash
cd ~/Desktop/open-design 2>/dev/null || (echo "Where is Open Design cloned?" && exit 1)
test -f package.json && grep -q '"name": "open-design"' package.json && echo "OK" || echo "WRONG_DIR"
test -d node_modules || pnpm install
```

## Step 7 — Restart Open Design

The daemon only detects CLIs on `$PATH` at boot, so it needs a restart to pick
up OpenCode. Tell the user: if Open Design is currently running, stop it
(Ctrl+C in that terminal) — you'll start it back up in a moment. Wait for
confirmation, then:

```bash
cd ~/Desktop/open-design
pnpm tools-dev run web
```

Watch the daemon logs for a line like `[od] detected agents: claude, opencode, ...`.
If `opencode` is missing from that line:

1. Check `which opencode` — if empty, OpenCode isn't on this shell's `$PATH`.
2. Restart from a fresh terminal where the npm global bin is on `$PATH`.

## Step 8 — Switch the agent in the UI

Tell the user to open `http://localhost:3000` (or whichever port the daemon
printed), click the agent dropdown (top-right, currently "Claude"), and
select **OpenCode**. Try a prompt like:

> Build a SaaS landing page for an AI analytics product. Use the Linear design
> system. Hero with one headline + CTA + screenshot mockup. Three feature
> cards. Pricing section. Footer.

The bottom-right cost panel should show **$0.0000** — that's expected, since
requests are going to OpenRouter, not Anthropic, so the Claude cost estimator
is bypassed (this is cosmetic; OpenRouter bills and logs usage separately at
openrouter.ai).

## Step 9 — Confirm, and note how to switch models later

If everything worked: "Done — Open Design is now driving OpenCode →
OpenRouter → `$DEFAULT_MODEL`." To switch models later, edit
`~/.config/opencode/config.json` and change `defaultModel`, or pass
`--model <slug>` per-call if OpenCode supports it.

Free model slugs:

```
deepseek/deepseek-chat-v3.1:free
meta-llama/llama-3.3-70b-instruct:free
qwen/qwen-2.5-coder-32b-instruct:free
google/gemini-2.0-flash-exp:free
mistralai/mistral-small-3.1-24b-instruct:free
```

Paid model slugs:

```
anthropic/claude-sonnet-4.7
openai/gpt-5.5-codex
deepseek/deepseek-chat-v3.1
google/gemini-2.5-pro
qwen/qwen3-coder-plus
```

To go back to Claude directly, just pick "Claude" in the agent dropdown —
Open Design auto-detects whatever CLIs are on `$PATH`.

## Fallback — OpenCode adapter broken in Open Design

Open Design has a known regression (#163) where the OpenCode adapter
sometimes exits with code 1. If the daemon logs show that, switch to Codex
with an env-redirect instead:

```bash
# Install Codex
npm install -g @openai/codex

# Point it at OpenRouter instead of OpenAI
cat >> ~/.zshrc << EOF

# OpenRouter via Codex (Open Design fallback)
export OPENAI_BASE_URL=https://openrouter.ai/api/v1
export OPENAI_API_KEY=$OPENROUTER_KEY
EOF
source ~/.zshrc

# Restart Open Design from a fresh terminal
cd ~/Desktop/open-design
pnpm tools-dev run web
```

In the agent dropdown, pick **Codex**. It routes through OpenRouter under the
hood — Codex thinks it's hitting OpenAI, and OpenRouter accepts the same wire
format.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `401 Unauthorized` from OpenRouter | wrong / revoked key | re-create the key at openrouter.ai/keys |
| `429 too many requests` | free tier rate limit | wait, or upgrade to paid |
| `model X not found` | wrong / deprecated slug | check openrouter.ai/models for current slugs |
| Open Design picks Claude even with OpenCode installed | daemon started before OpenCode was on PATH | restart the daemon from a fresh shell |
| OpenCode auth file edited but no change | wrong config path | run `opencode config path` to find the actual location |
| `Error: Cannot find module 'opencode-ai'` | global install didn't update PATH | add `$(npm prefix -g)/bin` to PATH in `~/.zshrc` |
| Cost panel shows non-zero on OpenRouter | panel is showing the Claude cost estimator | cosmetic only — OpenRouter bills and logs usage separately |

## Outcome

When this skill is complete, the user has: OpenCode CLI installed and on
`$PATH`; OpenCode configured with their OpenRouter API key; a default model
set from their free/paid choice; Open Design running with OpenCode in the
agent dropdown; designs generating via OpenRouter instead of Claude/Anthropic;
and their Anthropic weekly cap no longer being touched by design generation.
