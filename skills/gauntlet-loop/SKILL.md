---
name: gauntlet-loop
description: >
  Run any website, landing page, app, or AI agent build through an adversarial
  multi-judge gauntlet — repeated rounds of build, panel critique, and surgical
  fix — until it clears an Awwwards Site-of-the-Day / godly.website bar instead
  of a "looks fine to me" bar. Orchestrates the existing SA build stack (concept,
  visuals, motion, code, review) rather than replacing it; this skill supplies
  the loop, the judge panel, and the pass/fail gate. Trigger on "gauntlet",
  "gauntlet loop", "put this through the gauntlet", "make this Awwwards-level",
  "godly.website tier", "run the panel on this", or any request to push a build
  to a genuinely elite visual/craft bar rather than a "good enough" one.
metadata:
  trigger: Building or reviewing a website, landing page, app UI, or agent product surface that needs to clear an Awwwards/godly.website-grade bar
  origin: Original — composes compound-loop-pro's brainstorm/plan/work/review/compound loop, design-taste-frontend's aesthetic dials, stop-slop-pro's runnable scoring procedure, and the SA cinematic-website-builder pipeline into a single adversarial-judging gate.
---

# Gauntlet Loop

A **gauntlet** is not one review — it's a panel of judges with different, sometimes
conflicting standards, run in parallel, who all have veto power. Most builds die not
because nobody reviewed them but because the one reviewer shared the builder's blind
spots. This skill fixes that: build, then survive five adversaries who don't.

This skill does not replace the build skills you already have. It is the **loop and
the gate** around them. Delegate the actual work to the specialist skill; delegate
nothing on whether it passed.

```
intake → concept gauntlet → build → JUDGE PANEL → surgical fix → re-judge → ship
                                        ↑______________________|
                                     (max 3 laps, see §5)
```

## 0. Intake — Name the Bar Before You Build

State these four things out loud before writing a line of code or a single prompt:

1. **Surface type** — website / landing page / app UI / AI agent surface. This picks
   the reference set in §2.
2. **Reference bar** — name it explicitly: "Awwwards SOTD tier," "godly.website tier,"
   or "Mobbin best-in-class tier" (for app UX where Awwwards doesn't apply). Don't
   default to "make it nice" — nice is not a target a judge can fail you against.
3. **Dials** — pull `design-taste-frontend`'s VARIANCE / MOTION / DENSITY dials and set
   numbers now, not during review. A gauntlet judged against dials nobody committed to
   is just vibes with extra steps.
4. **Max laps** — default 3 (see §5). State it now so "still not passing at lap 3" has
   a pre-agreed answer (ship with a documented gap list, or extend by explicit user
   ask) instead of an open-ended grind.

## 1. Concept Gauntlet (before any code)

Borrowed from `compound-loop-pro`'s brainstorm step, tightened for visual work:

- Generate **3 distinct directions**, not 3 variations of one idea. Name each one in
  a phrase a judge could repeat back ("brutalist type-as-hero," "one continuous
  scroll-film," "quiet luxury bento").
- Kill two. State why in one line each — that rejection is signal worth keeping, not
  waste.
- The survivor gets the dials from §0.4 locked to it. Route it through
  `design-taste-frontend`'s Aesthetic Routing Table if the project type maps to a row
  there; otherwise state the aesthetic route by hand.

## 2. Build (delegate, don't reinvent)

Route to the specialist skill for the surface type — this skill supplies discipline,
not implementation:

| Surface | Build with | Hero visuals/video with |
|---|---|---|
| Cinematic/scroll-driven site | `cinematic-website-builder` or `scroll-film-studio` | `cinematic-prompt-director` + Higgsfield/Seedance via `scroll-film-studio`'s asset lane |
| Fused/cloned/rebranded site | `website-fusion-engine` | same as above, per its asset-ledger step |
| App UI / product surface | `ui-ux-designer` + `ui-ux-pro-max` | `banana-pro-director-30` for character/product stills if needed |
| AI agent surface (chat, dashboard, run view) | `ui-ux-designer`, motion from `design-motion-principles` | usually none — judge on clarity, not spectacle |

While building, hold two rules from `karpathy-guidelines` non-negotiably:
- **Surgical changes** — every line traces to a concept decision from §1. No
  drive-by refactors, no speculative flexibility "in case."
- **Simplicity first** — the judge panel in §3 penalizes over-decoration as hard as
  under-decoration. A gauntlet is not an invitation to add motion until something
  finally looks impressive.

If the build needs AI-generated imagery or video (hero shots, character plates,
product renders, background loops), do **not** freehand the prompts here — hand off
to the platform-specific director skill (`cinematic-prompt-director`,
`banana-pro-director-30`, or `scroll-film-studio`'s footage lane) so the prompt
grammar for that specific model stays correct. This skill's job is deciding *whether
the result clears the bar*, not writing the prompt.

## 3. The Judge Panel — Five Adversaries, Run in Parallel

Run these five as independent passes over the same build — in parallel, not
sequentially, per `compound-loop-pro`'s "review by committee" pattern. Disagreement
between judges is signal: when two flag the same section from different angles, that
section gets fixed first.

| Judge | Standing for | Fails the build on |
|---|---|---|
| **Awwwards Juror** | Design, Usability, Creativity, Content (Awwwards' own four categories) | Templated hero, generic type pairing, no point of view, motion that doesn't earn its cost |
| **godly.website Curator** | Craft density — the small stuff SOTD sites nail | Default easing curves, unstyled focus states, cursor that doesn't react, no micro-interaction on primary CTA |
| **Anti-Slop Critic** | `design-taste-frontend`'s banned-pattern list + `stop-slop-pro`'s prose rubric applied to UI copy | AI-purple gradients, centered-hero-three-cards template, Inter as display font, marketing copy full of "unlock/elevate/seamless" |
| **First-Time User** | A visitor with zero context, on a cold cache, on mobile | Can't tell what the product does in 3 seconds, primary action isn't obvious, any horizontal scroll on mobile that isn't intentional |
| **Build Engineer** | Performance + a11y, the two things award juries score but visual taste ignores | No `prefers-reduced-motion` fallback, layout shift on load, contrast failures, unoptimized hero video/image weight |

### Scoring — make it runnable, not a vibe check

For each judge, score 1–10 on their column. Sum per section (hero, primary CTA, one
representative content section) out of 50 across the panel. Flag any **section**
scoring below 35, and flag any **single judge** giving a 3 or below regardless of the
section total — a panel-wide 38 hiding one judge's 2 is not a pass.

```
1. Run all 5 judges against the current build, in parallel.
2. Score every judged section (hero / primary CTA / one content section) per judge.
3. Flag: any section total < 35, OR any individual judge score ≤ 3.
4. Report per judge, per section — don't average away a bad hero into a fine total.
```

## 4. Surgical Fix (only what failed)

Fix only flagged sections, and only the specific thing the judge named — not a
repaint of the whole page because one judge complained about the hero. This is
`karpathy-guidelines`' surgical-change rule applied to critique: a fix that touches
an unflagged section needs its own justification, not a ride-along.

If two judges conflict on the same element (e.g., Anti-Slop Critic wants less motion,
Awwwards Juror wants more), that's a design decision, not a bug — make the call, state
which judge you're overruling and why, and move on. Don't let the panel design by
committee.

## 5. Re-Judge — the Loop, With an Exit

Re-run **only the previously-flagged judges/sections** against the fix — not the
whole panel from scratch, unless the fix plausibly touched other sections too.

```
lap 1: full panel → fix flagged
lap 2: re-judge flagged only → fix again if still flagged
lap 3: re-judge flagged only → this is the last automatic lap
```

At lap 3, one of two things is true:
- **Everything clears** → proceed to §6.
- **Something still fails** → stop. Report exactly what's still failing, which judge,
  and why the fix didn't land. Do not keep looping past the agreed max (§0.4) without
  the user explicitly extending it — an open-ended gauntlet is just burning tokens on
  diminishing returns, and a stuck failure after two genuine fix attempts is usually a
  concept problem from §1, not a polish problem §4 can solve.

## 6. Ship & Verify (evidence, not confidence)

Before calling the gauntlet passed, get real evidence — borrowed from
`website-fusion-engine`'s "build from evidence" rule:

- Launch it with the `run` skill and actually look at it — screenshot the hero,
  the primary CTA, and one content section on both desktop and mobile viewport.
  A judge score based on reading the HTML instead of seeing it rendered is not a
  judge score.
- Confirm `prefers-reduced-motion` is respected and nothing shifts layout on load.
- Report final scores per judge, per section — the same table from §3, now all
  clearing threshold — as proof, not just "looks great now."

## Closing Report Format

```
Surface: <type> | Bar: <Awwwards SOTD / godly.website / Mobbin best-in-class>
Concept: <winning direction from §1, one line>
Laps run: <1-3>
Final panel scores (hero / CTA / content section):
  Awwwards Juror:      X/10  X/10  X/10
  godly.website:       X/10  X/10  X/10
  Anti-Slop Critic:    X/10  X/10  X/10
  First-Time User:     X/10  X/10  X/10
  Build Engineer:      X/10  X/10  X/10
Overruled conflicts: <judge vs judge, and the call made, or "none">
Still open (if stopped at lap 3 without clearing): <what, and why>
```

## Attribution

Loop structure (brainstorm → build → review-by-committee) adapted from this
repo's `compound-loop-pro`. Runnable scoring-procedure pattern (score → threshold →
rewrite flagged only → re-score) adapted from this repo's `stop-slop-pro`.
Aesthetic dials and anti-slop bans from `design-taste-frontend`. Evidence-over-prose
build discipline from `website-fusion-engine`. The five-judge panel, the gauntlet
framing, and the lap-capped loop are original to this skill.
