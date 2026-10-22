---
name: caveman
description: >
  Token reduction skill that makes agents talk like a caveman — cuts ~75% of output tokens
  while preserving 100% technical accuracy. Reduces Claude API costs dramatically on high-volume
  pipelines. Also includes caveman-compress to compress CLAUDE.md and memory files to save
  input tokens. Use on all pipeline agents to cut costs by 60-75%. Trigger on: "caveman",
  "reduce tokens", "compress output", "token efficiency", "reduce costs", "julius brussee",
  "caveman-compress", "compress memory file", "compress CLAUDE.md".
source: https://github.com/JuliusBrussee/caveman
author: Julius Brussee
version: main
---

# Caveman — 75% Token Reduction for AI Agents

> "why use many token when few do trick"

Claude Code skill that makes agents communicate in compressed caveman-speak. Cuts ~75% output tokens. Brain still big. Mouth small. Full technical accuracy preserved — just stripped of all filler.

---

## The Math for Space Age

At 25–80 sites/day with Claude as orchestrator:

| Metric | Normal | Caveman | Savings |
|---|---|---|---|
| Tokens per agent message | ~69 | ~19 | 72% |
| Cost at 1000 msg/day | $3.00 | $0.83 | **$2.17/day** |
| Cost at 10K msg/day | $30.00 | $8.30 | **$21.70/day** |
| Monthly (10K/day) | $900 | $249 | **$651/mo saved** |

Install caveman on every pipeline agent. Marginal cost: zero.

---

## Before / After

**Normal Claude (69 tokens):**
> "The reason your React component is re-rendering is likely because you're creating a new object reference on each render cycle. When you pass an inline object as a prop, React's shallow comparison sees it as a different object every time, which triggers a re-render. I'd recommend using useMemo to memoize the object."

**Caveman Claude (19 tokens):**
> "New object ref each render. Inline object prop = new ref = re-render. Wrap in `useMemo`."

---

## Install

```bash
# Claude Code — Official Marketplace
/plugin install caveman@claude-plugins-official

# Claude Code — One-liner
curl -fsSL https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.sh | bash

# Manual
git clone https://github.com/JuliusBrussee/caveman.git
cd caveman
claude --plugin-dir .

# Windows
irm https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.ps1 | iex
```

Compatible: Claude Code | Codex | Gemini | Cursor | Windsurf | Cline | Copilot | 30+ agents

---

## Skills Included

### `caveman` (Output Compression)
Compresses ALL agent output to caveman-speak. Auto-active once installed.

**Compression rules:**

| Remove | Replace With |
|---|---|
| Articles: a, an, the | — |
| Filler: just, really, basically, actually | — |
| Pleasantries: "sure!", "happy to", "certainly" | — |
| Hedging: "it might be worth", "you could consider" | — |
| "in order to" | "to" |
| "make sure to" | "ensure" |
| "the reason is because" | "because" |
| "however", "furthermore", "additionally" | — |

**Never touch:**
- Code blocks (``` ... ```) — copied EXACTLY
- Inline code (`backticks`)
- URLs and file paths
- Technical terms, library names, API names
- Dates, version numbers, numeric values

### `caveman-compress` (Input Token Reduction)
Compresses CLAUDE.md, todos, and preference files into caveman format. Saves input tokens on every request.

```bash
# Usage:
/caveman-compress CLAUDE.md
/caveman-compress .claude/preferences.md
/caveman-compress path/to/any-memory-file.md

# Process:
# 1. Detects file type
# 2. Compresses with Claude (targeted)
# 3. Validates output (no token loss on critical content)
# 4. Overwrites original → saves as FILE.original.md backup
# 5. Retries up to 2x if errors
```

### CaveCrew (Multi-Agent)
Three specialized agents for parallel workflows:

```
cavecrew-builder.md      Build tasks
cavecrew-investigator.md Research + debug tasks
cavecrew-reviewer.md     Code review + QA tasks
```

---

## Benchmarks

From evals (`benchmarks/results/`):
- **~75% output token reduction** across representative prompts
- **0% technical accuracy loss** (code, paths, commands preserved verbatim)
- **Consistent** across Claude, Codex, Gemini, Cursor

---

## Space Age Pipeline Deployment

### VPS Installation (146.190.78.120)

```bash
# Install for all agents on VPS
claude --plugin-dir /home/caveman/plugins/caveman
codex --plugin-dir /home/caveman/plugins/caveman

# Compress memory files to reduce input tokens
/caveman-compress /home/spaceage/CLAUDE.md
/caveman-compress /home/hermes/AGENTS.md
```

### Compress the Space Age CLAUDE.md

```bash
# Current CLAUDE.md is likely 5-15KB of natural language
# After compression: ~40-50% smaller
# Every agent session loads fewer input tokens
/caveman-compress /home/spaceage/CLAUDE.md
# → CLAUDE.md (compressed) + CLAUDE.md.original.md (backup)
```

### Pipeline-Wide Rollout

| Component | Install Caveman? | Expected Savings |
|---|---|---|
| Claude orchestrator | ✅ Yes | 70% output tokens |
| DeepSeek V4 Pro builder | ✅ Yes | 65% output tokens |
| Gemini Flash QA | ✅ Yes | 72% output tokens |
| Codex deployer | ✅ Yes | 68% output tokens |
| Vapi voice agent | — | N/A (speech) |

---

## Commands Reference

```bash
/caveman                          # Toggle caveman mode
/caveman-compress <filepath>      # Compress a memory/config file
/caveman-review                   # Code review in caveman mode
/caveman-commit                   # Generate commit message in caveman
/caveman-init                     # Initialize project with caveman settings
```

---

## File Map

```
plugins/caveman/
  skills/caveman-compress/SKILL.md    Compress memory files
  skills/cavecrew/SKILL.md            Multi-agent crew
  agents/cavecrew-builder.md          Builder agent
  agents/cavecrew-investigator.md     Investigator agent
  agents/cavecrew-reviewer.md         Reviewer agent
commands/
  caveman.toml       Main command
  caveman-compress.toml
  caveman-commit.toml
  caveman-review.toml
evals/                Benchmark scripts + results
benchmarks/           Prompt test suite + scoring
```

---

## Trigger This Skill When
- Reducing Claude API costs on any pipeline
- User says: "caveman", "reduce tokens", "compress output", "julius brussee"
- Installing token efficiency on VPS agents
- Compressing CLAUDE.md or any memory file before deploying
- Any agent running at high volume (1K+ messages/day) where token costs matter
