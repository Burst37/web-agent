---
name: superpowers
description: >
  Complete software development methodology for coding agents. Gives Claude Code,
  Codex, Gemini CLI, and Cursor structured spec-first, TDD-enforced, parallel-agent
  engineering discipline. Prevents agents going off-plan on long autonomous runs.
  Install on VPS for all overnight pipeline builds. Trigger on: "superpowers", "obra",
  "install superpowers", "agent went off-plan", "structured coding", "tdd enforcement",
  "subagent-driven development", "parallel agents", "writing plans".
source: https://github.com/obra/superpowers
author: Jesse Vincent (@obra)
version: main
---

# Superpowers — Coding Agent Development Methodology

Composable skill library + bootstrap instructions that transform any coding agent from "jumps into code" → disciplined senior engineer. Skills trigger automatically — no manual invocation needed.

---

## Space Age Integration

Install on VPS (146.190.78.120) for all Claude Code sessions. Prevents the #1 problem: agents going off-plan on 2-hour overnight site builds.

```bash
# Claude Code — Official Marketplace
/plugin install superpowers@claude-plugins-official

# Claude Code — Superpowers Marketplace (bleeding edge)
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
```

Compatible: Claude Code | Codex CLI | Codex App | Gemini CLI | Cursor | GitHub Copilot CLI | Factory Droid | OpenCode

---

## The 5-Phase Agent Lifecycle

```
1. SPEC     Agent asks what you're REALLY trying to build (not just what you said)
2. REVIEW   Shows spec in readable chunks — you approve before code starts
3. PLAN     Implementation plan clear enough for a junior dev to follow
4. EXECUTE  Subagent-driven development — agents work tasks in parallel
5. FINISH   Tests verified, branch cleaned, PR ready
```

No phase is skipped. Agent announces each phase transition.

---

## Core Skills Library

### `executing-plans`
Load a written plan → review critically → execute all tasks → report done.

Key rules:
- Reads plan file, raises concerns BEFORE starting
- Marks each task `in_progress` → `completed`
- **STOPS immediately** on blockers — never guesses
- Calls `finishing-a-development-branch` on completion
- Never starts on `main/master` without explicit consent

### `dispatching-parallel-agents`
When 2+ independent tasks exist → dispatch one agent per domain → run concurrently.

```
Scenario: 6 test failures across 3 files
→ Agent 1: Fix agent-tool-abort.test.ts  (timing issues)
→ Agent 2: Fix batch-completion.test.ts  (event structure bug)
→ Agent 3: Fix tool-approval.test.ts     (async wait missing)
→ All 3 run simultaneously → 3x speed
```

Decision tree:
```
Multiple failures? → Are they independent? → Can they parallelize?
       ↓ yes              ↓ yes                    ↓ yes
  One agent          Parallel dispatch         All concurrent
```

**Good agent prompt structure:**
```markdown
Fix the 3 failing tests in src/[file].test.ts:
1. "[test name]" - expects X, gets Y
2. "[test name]" - timing issue
3. "[test name]" - race condition

Your task:
1. Read test file, understand what each verifies
2. Find root cause (don't just increase timeouts)
3. Fix without changing unrelated code
Return: Summary of root cause + changes made.
```

### `brainstorming`
Visual companion for spec ideation. Runs a local zero-dep server for frame-based brainstorming sessions.

### `finishing-a-development-branch`
End-of-task checklist: run tests, verify coverage, commit cleanly, prepare PR summary.

---

## Enforcement Rules (Always Active)

| Rule | Behavior |
|---|---|
| TDD | Red → green for every change |
| YAGNI | No speculative features |
| DRY | Deduplication enforced |
| Stop on blockers | Never guesses, always asks |
| No main/master commits | Always works on branch |
| Subagent isolation | Each agent gets only the context it needs |

---

## Hooks (Auto-Trigger)

```json
// hooks/hooks.json — fires on session start
{
  "session_start": "Load superpowers methodology",
  "pre_code": "Verify spec exists before writing code",
  "post_task": "Run finishing-a-development-branch"
}
```

---

## Supercharged Additions for Space Age

### 1. Lead Gen Pipeline Guard
Every site build session on VPS has Superpowers installed → agents cannot skip spec review → no malformed sites shipped.

### 2. Overnight Run Discipline
The `executing-plans` skill enforces plan-following for 2+ hour sessions. Agents work autonomously without deviation.

### 3. Parallel Site Builds
`dispatching-parallel-agents` directly maps to the 5-agent swarm. One orchestrator dispatches DeepSeek, Gemini, Codex, Minimax simultaneously — each building independent sites.

### 4. VPS Install Script
```bash
# On 146.190.78.120 — install for all agents
claude code --plugin-dir /home/superpowers
codex --plugin-dir /home/superpowers
```

---

## File Map

```
skills/
  executing-plans/SKILL.md          Plan execution + review checkpoints
  dispatching-parallel-agents/      Concurrent multi-agent task distribution
  brainstorming/                    Visual spec ideation server
  finishing-a-development-branch/   End-of-task verification + PR
hooks/
  hooks.json                        Auto-trigger config
  session-start                     Bootstrap script
CLAUDE.md                           Claude Code bootstrap
AGENTS.md                           Universal agent bootstrap
```

---

## Trigger This Skill When
- Installing methodology on VPS or new Claude Code session
- Agent went off-plan / skipped spec review
- Setting up parallel agent dispatching for site builds
- User says: "superpowers", "obra", "tdd", "parallel agents", "subagent-driven", "writing plans"
- Any overnight autonomous coding session needs discipline
