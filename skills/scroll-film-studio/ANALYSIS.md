# Scroll-Film Studio — Analysis of the original `Fable_5_Skill_resource.zip`

Breakdown of what the uploaded skill actually is, whether its claims hold up, and what
was changed to make it portable across top models (not just Claude/Fable 5).

## What it is

A **process skill** (not a template/scaffold) for building "scroll-film websites" —
pages where the hero IS the page: one continuous cinematic shot that scrubs as the
visitor scrolls, then dissolves into normal content sections. Think Apple
AirPods-Pro-style scrollytelling, productized into a repeatable agent workflow.

Original contents (675 lines total, zero binaries, zero credentials):

| File | Role |
|---|---|
| `SKILL.md` (229 ln) | The orchestration process: interview → concept pitch → art direction → build → verify → deploy |
| `references/playbook.md` (94 ln) | Lane B law: footage chaining, SSIM junction gates, billing, assembly |
| `references/engine.md` (160 ln) | The load-bearing frontend mechanics for both lanes |
| `scripts/chain-step.sh` (60 ln) | Generate one video clip chained from a start image, SSIM-gate the seam |
| `scripts/assemble.sh` (41 ln) | Concat clips, encode master, extract ~300 JPEG frames, sample seam color |
| `scripts/verify.js` (91 ln) | Puppeteer screenshot + rAF-delta jank harness |

### The two lanes

- **Lane A — pure-code (default, free):** the "film" is GSAP + ScrollTrigger + Lenis
  motion — pinned scrubbed scenes, char-split hero, horizontal runs, clip-path reveals.
- **Lane B — cinematic footage (opt-in, signature look):** real AI-generated video,
  chained shot-to-shot (each clip's start image = the ffmpeg-extracted literal last
  frame of the previous clip), assembled and scrubbed frame-by-frame on a `<canvas>`.
  Higgsfield Seedance 2.0 is the reference engine; the chain contract works with any
  image-to-video model that accepts a start image (Kie.ai, fal, Replicate…).

## Does it do what they say? — verdict: **yes, the engineering is real**

Every load-bearing technical claim checks out:

1. **Canvas + pre-extracted JPEGs instead of `<video currentTime>` scrubbing** —
   correct. Video seek latency makes scrub-on-scroll stutter; frame-sequence canvas
   scrubbing is the industry-standard technique for this effect.
2. **ImageBitmap sliding window as the anti-jank core** — correct and genuinely
   expert-level. `drawImage(HTMLImageElement)` triggers synchronous main-thread JPEG
   decode (first paint + after cache eviction); `createImageBitmap()` decodes
   off-thread, so keeping a decoded window around the playhead (±18 ahead, evict
   beyond ±28, `close()` on evict) makes every draw a pure GPU blit. This is the
   difference between "glitchy frame-by-frame" and butter.
3. **ScrollTrigger ordering law** (create pinned scenes before ambient triggers) —
   real, well-known GSAP footgun: triggers refresh in creation order, and positions
   computed before pin spacers exist are silently wrong.
4. **`-fps_mode vfr` on the master encode** — correct; default CFR sync pads duplicate
   frames at junctions, which becomes frozen dead zones in a scrubbed film.
5. **SSIM junction gate** (`ffmpeg -lavfi ssim`, ≥0.88 pass, 0.80–0.88 review) —
   sound methodology, and the caveat that SSIM under-reads on stochastic texture
   (clouds/embers/caustics) while the real failure mode is grade/geometry drift is
   accurate and hard-won-sounding.
6. **Jank measured as rAF-delta p95/max, never average fps** — correct; a 60fps
   average hides 80ms decode spikes completely.
7. **The `?jump=<y>` + `window.__ready` dev contract** — a clean solution to the real
   problem that host preview panes throttle hidden tabs (frozen rAF → stale
   screenshots), which is why the puppeteer harness exists.
8. **Scripts** — coherent, defensive (strict job-ID parsing rather than guessing from
   a job list, unreadable-input checks, exit code 2 = "downloaded fine, seam needs
   eyes"), and fully mechanical: no model calls, no credentials, no personal paths.
   The "ships with zero personal data" claim is verified true.

Unverifiable-offline claims (don't affect correctness): Higgsfield's exact credit
prices, the ~15% unbilled server-side failure rate, and "audio ON ≈ 3× cost." The
scripts don't depend on them; treat them as operator folklore to re-verify by balance
delta, exactly as the playbook itself advises.

## What was actually Fable-5/Claude-specific

Surprisingly little — the value is in the process + engine recipes, which are
model-free. The Claude-locked parts were:

1. **"THE GOLDEN RULE"** — all taste/design decisions must be made by "you, the
   Anthropic model," with sub-agents required to also be Claude. This is a governance
   choice (keep taste on one strong model), not a technical dependency.
2. The **delegation table** naming Claude as the frontier spine and Claude sub-agents
   as drafters.
3. Original scripts were `#!/bin/zsh` (macOS-flavored) — an incidental portability
   wart, not a model dependency.

## What the recreation changes

- **`SKILL.md` rewritten model-agnostic**: the Golden Rule becomes "one director
  model" — whichever frontier model is running the skill (Claude, GPT-5.x/Codex,
  Gemini) owns every taste decision; mechanical work still goes to plain code; small
  drafting sub-tasks go to instances of the *same* model family. The optional
  second-model sparring step is kept and generalized.
- **Runtime adapters section added**: how to load the same skill in Claude Code,
  OpenAI Codex CLI (`AGENTS.md`), Gemini CLI (`GEMINI.md`), Cursor
  (`.cursor/rules/`), or any agent via pasted system context.
- **Scripts ported zsh → portable bash** (`#!/usr/bin/env bash`, `shopt -s nullglob`
  instead of `setopt null_glob`); behavior otherwise identical.
- **`verify.js`**: added Chromium/Chrome path fallbacks (system chromium,
  `/opt/pw-browsers/chromium`) so it runs in Linux containers, not just desktop
  Chrome installs.
- References kept intact (they are the technical gold), with the governance paragraph
  generalized to match.
