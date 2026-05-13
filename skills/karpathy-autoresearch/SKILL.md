---
name: karpathy-autoresearch
description: >
  Autonomous overnight AI research agent by Andrej Karpathy. Agent modifies LLM training
  code, runs fixed 5-min experiments, tracks val_bpb metrics, keeps improvements, discards
  regressions — loops forever while you sleep. The program.md pattern generalizes to ANY
  autonomous improvement loop: site quality, outreach copy A/B, voice agent scripts.
  Trigger on: "autoresearch", "karpathy", "overnight experiments", "autonomous research",
  "program.md", "self-improving loop", "val_bpb", "experiment loop".
source: https://github.com/karpathy/autoresearch
author: Andrej Karpathy
branch: master
requires: Single NVIDIA GPU (H100 tested), Python 3.10+, uv
---

# autoresearch — Autonomous AI Research Agent

> "You wake up in the morning to a log of experiments and a better model."  
> — @karpathy, March 2026

Agent runs scientific experiments autonomously. Modifies code, tests hypothesis, measures improvement, keeps or discards, loops forever. Built for ML research — the pattern generalizes to any iterative improvement task.

---

## The 3 Files That Matter

| File | Owner | Purpose |
|---|---|---|
| `prepare.py` | **Human — READ ONLY** | Constants, data prep, tokenizer, dataloader, eval harness |
| `train.py` | **Agent edits this** | GPT model, Muon+AdamW optimizer, training loop |
| `program.md` | **Human edits this** | Research org instructions — the "skill" for the agent |

**Metric:** `val_bpb` (validation bits per byte) — lower = better. Architecture-agnostic.  
**Time budget:** Hard 5-minute wall clock per experiment. Always the same — no time variable.

---

## Quick Start

```bash
# Requirements: NVIDIA GPU, Python 3.10+, uv
curl -LsSf https://astral.sh/uv/install.sh | sh
uv sync
uv run prepare.py        # one-time data prep ~2 min
uv run train.py          # verify single run works ~5 min
```

---

## Running the Autonomous Loop

```bash
# Spin up Claude Code in repo dir, disable all permissions
# Prompt:
"Have a look at program.md and let's kick off a new experiment!"

# Agent will:
# 1. Agree on a run tag (e.g. may13)
# 2. git checkout -b autoresearch/may13
# 3. Read all in-scope files
# 4. Establish baseline (first run as-is)
# 5. LOOP FOREVER modifying train.py
```

---

## The Experiment Loop

```
LOOP:
  1. Review current git state + branch
  2. Pick experimental idea → modify train.py
  3. git commit
  4. uv run train.py > run.log 2>&1
  5. grep "^val_bpb:\|^peak_vram_mb:" run.log
  6. If empty → crash → tail -n 50 run.log → fix or skip
  7. Log to results.tsv (tab-separated, never commit this file)
  8. If val_bpb improved → keep commit (advance branch)
  9. If equal/worse → git reset back to start
  GOTO 1 — NEVER ASK HUMAN IF YOU SHOULD CONTINUE
```

**Timeout:** Kill any run exceeding 10 minutes.  
**Crash:** If OOM or typo → fix and retry. If fundamentally broken → log crash, move on.  
**VRAM:** Soft constraint. Some increase OK for meaningful val_bpb gains.

---

## results.tsv Format

```tsv
commit	val_bpb	memory_gb	status	description
a1b2c3d	0.997900	44.0	keep	baseline
b2c3d4e	0.993200	44.2	keep	increase LR to 0.04
c3d4e5f	1.005000	44.0	discard	switch to GeLU activation
d4e5f6g	0.000000	0.0	crash	double model width (OOM)
```

**Status values:** `keep` | `discard` | `crash`

---

## What Agent Can Modify in train.py

- Model architecture (attention heads, layers, dimensions, activations)
- Optimizer (Muon + AdamW hyperparameters, LR schedules)
- Batch size, sequence length, gradient accumulation
- Training loop logic, loss functions
- Any implementation that affects val_bpb

**Cannot modify:** `prepare.py`, evaluation harness, add new packages.

---

## Simplicity Criterion

```
0.001 val_bpb improvement + 20 lines of hacky code  →  NOT worth it
0.001 val_bpb improvement + deleting code            →  KEEP IT
~0 improvement + much simpler code                   →  KEEP IT
```

Elegant improvements > marginal gains with complexity.

---

## Space Age Applications

### The `program.md` Pattern Generalized

`program.md` is just a skill/instruction file that defines an autonomous improvement loop. Apply this pattern to:

| Application | What Agent Improves | Metric |
|---|---|---|
| Site quality loop | Cinematic website builder output | Conversion rate proxy |
| Outreach copy A/B | Cold email subject lines + body | Open rate (scraped from inbox) |
| Voice agent scripts | Vapi conversation flows | Booking rate |
| SEO content | Meta descriptions, H1s | Rank position |
| Lead scoring | Brief quality assessment | Close rate correlation |

### VPS Overnight Research (146.190.78.120)

```bash
# Run on VPS H100 node (if available) or route to GPU cloud
screen -S autoresearch
claude code --dangerously-skip-permissions
# prompt: "read program.md, start autoresearch/may13"
# detach: Ctrl+A D
# wake up to 100 experiments
```

### Customizing program.md for Space Age

```markdown
# Space Age Site Quality Research

## Setup
Run tag: site-quality-[date]
Branch: autoresearch/site-quality-[date]

## Experiment Loop
1. Modify cinematic-website-builder prompt in train_prompt.txt
2. Generate 5 test sites
3. Score via lighthouse (performance + visual) → score.log
4. If avg_score improved → keep
5. If not → discard
LOOP FOREVER
```

---

## Trigger This Skill When
- User says: "autoresearch", "karpathy", "overnight experiments", "program.md", "val_bpb"
- Setting up autonomous improvement loops for any Space Age pipeline component
- Running unattended ML/optimization experiments on VPS
- Applying the keep/discard research loop to any iterative task
