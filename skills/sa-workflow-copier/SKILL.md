---
name: sa-workflow-copier
description: >
  Watch any website-building tutorial video and output a complete, executable build
  workflow Claude can run step-by-step. The "watch and replicate" engine. Feed it a
  YouTube URL → get back an exact reproduction plan: tools used, code shown, file
  structure, libraries, design decisions, scroll effects — everything needed to build
  what the video shows. Connects sa-youtube-cli → transcript + frames → workflow
  decomposition → cinematic-website-builder handoff.
  AUTO-TRIGGER when user says: "copy this", "build what this shows", "replicate this site",
  "watch this tutorial and build it", "extract the workflow", "how did they build this",
  "what stack did they use", or pastes YouTube URL + any build/replicate intent.
requires: sa-youtube-cli, sa-watch, ffmpeg, yt-dlp, youtube-transcript-api
---

# SA-Workflow-Copier — Watch Any Build Video → Execute It

Give Claude a website-building tutorial. Get back a complete, executable reproduction plan. Claude watches, understands, and builds.

---

## The Pipeline

```
INPUT: YouTube URL (website build tutorial)
         │
         ▼
[Phase 1] EXTRACT
  sa-youtube-cli → full transcript + chapters + metadata
  ffmpeg → frame extraction (1 frame/10s or faster for UI demos)
         │
         ▼
[Phase 2] ANALYZE
  Transcript segmentation by chapter/timestamp
  Frame analysis → identify: UI shown, tools open, code visible
  Stack detection → identify libraries, frameworks, techniques
  Step ordering → map transcript to visual evidence
         │
         ▼
[Phase 3] DECOMPOSE
  Build ordered workflow map:
  - Every tool/library identified
  - Every design decision extracted
  - Every code pattern documented
  - Every animation/effect catalogued
         │
         ▼
[Phase 4] OUTPUT
  Executable build workflow (this file)
  → Hand off to cinematic-website-builder
  → Or output as standalone SKILL.md
```

---

## Phase 1 — Extract

### Step 1.1 — Pull Transcript + Metadata

```python
from youtube_transcript_api import YouTubeTranscriptApi
import subprocess, json, re, os

def extract_video_intel(youtube_url):
    # Extract video ID
    video_id = re.search(r"(?:v=|youtu\.be/)([^&\n?#]+)", youtube_url).group(1)
    
    # Get transcript
    try:
        transcript_raw = YouTubeTranscriptApi.get_transcript(video_id)
        transcript_text = " ".join([t['text'] for t in transcript_raw])
        transcript_timestamped = [
            {"time": t['start'], "text": t['text']} 
            for t in transcript_raw
        ]
    except Exception as e:
        transcript_text = f"[Transcript unavailable: {e}]"
        transcript_timestamped = []
    
    # Get metadata + chapters
    result = subprocess.run(
        ["yt-dlp", "--no-check-certificate", "--skip-download", "-j", youtube_url],
        capture_output=True, text=True
    )
    metadata = json.loads(result.stdout) if result.returncode == 0 else {}
    
    return {
        "title": metadata.get("title", "Unknown"),
        "duration": metadata.get("duration", 0),
        "chapters": metadata.get("chapters") or [],
        "description": metadata.get("description", "")[:1000],
        "transcript": transcript_text,
        "transcript_timestamped": transcript_timestamped
    }
```

### Step 1.2 — Download + Extract Frames

```bash
# Download video
yt-dlp --no-check-certificate \
  -f "bestvideo[height<=1080]+bestaudio/best" \
  --merge-output-format mp4 \
  -o "/home/workflow_analysis/%(id)s.%(ext)s" \
  "YOUTUBE_URL"

VIDEO_FILE="/home/workflow_analysis/VIDEO_ID.mp4"
FRAMES_DIR="/home/workflow_analysis/frames"
mkdir -p $FRAMES_DIR

# Standard extraction: 1 frame per 10 seconds
ffmpeg -i "$VIDEO_FILE" -vf "fps=1/10,scale=1280:-1" -q:v 2 \
  "$FRAMES_DIR/f_%04d.jpg" 2>/dev/null

# Fast extraction for UI-heavy demos: 1 frame per 3 seconds
ffmpeg -i "$VIDEO_FILE" -vf "fps=1/3,scale=1280:-1" -q:v 2 \
  "$FRAMES_DIR/fast_%04d.jpg" 2>/dev/null

echo "Frames: $(ls $FRAMES_DIR | wc -l)"
```

---

## Phase 2 — Analyze

Claude receives: transcript + frames + chapters + description.

### Stack Detection Checklist

Claude scans transcript + visible code for:

**Frameworks/Libraries**
- [ ] GSAP / ScrollTrigger (look for: `gsap.`, `ScrollTrigger`, `fromTo`)
- [ ] Three.js / Spline (look for: `THREE.`, `canvas`, spline.design URLs)
- [ ] Locomotive Scroll / Lenis (look for: `locomotive`, `lenis`, smooth scroll)
- [ ] Tailwind (look for: class names like `flex`, `bg-`, `text-`)
- [ ] Alpine.js (look for: `x-data`, `x-show`, `@click`)
- [ ] Vanilla JS (look for: `querySelector`, `addEventListener`)
- [ ] React/Next.js (look for: `useState`, `useEffect`, JSX syntax)
- [ ] Webflow / Framer (look for: CMS references, visual builder UI)

**Visual Patterns**
- [ ] Parallax layers
- [ ] Horizontal scroll sections
- [ ] Pinned scroll sections
- [ ] Magnetic cursor effects
- [ ] Text reveal animations
- [ ] Image masking / clip-path
- [ ] Glassmorphism panels
- [ ] Video backgrounds
- [ ] Canvas / WebGL elements

**Build Tools**
- [ ] Vite / Webpack
- [ ] npm / yarn / bun
- [ ] GitHub + deployment platform (Vercel, Netlify, etc.)
- [ ] CDN-only (no build step)

---

## Phase 3 — Decompose

### Workflow Map Template

```markdown
# WORKFLOW: [VIDEO TITLE]
Source: [YouTube URL]
Duration: [X minutes]
Complexity: [Simple/Medium/Complex]

## STACK
- Primary: [framework]
- Animation: [library]
- Styling: [approach]
- Hosting: [platform]
- Build: [tool or CDN-only]

## FILE STRUCTURE
[exactly what they built — inferred from video]
project/
  index.html
  style.css
  main.js
  assets/

## SECTIONS (in order)
1. [Section name] — [what it does] — [animation/effect used]
2. [Section name] — [what it does] — [animation/effect used]
...

## EFFECTS CATALOGUE
[Every scroll, cursor, hover effect used — with the exact GSAP/CSS pattern]

Effect: [name]
Trigger: [scroll position / user action]
Implementation:
  gsap.fromTo(".element", {opacity: 0, y: 100}, {
    opacity: 1, y: 0, duration: 1,
    scrollTrigger: { trigger: ".section", start: "top 80%" }
  })

## BUILD ORDER
Step 1: [exact action]
Step 2: [exact action]
...

## KEY CODE PATTERNS
[Any code they showed on screen — transcribed exactly]

## DESIGN TOKENS
- Colors: [hex values shown]
- Fonts: [font names used]
- Spacing: [rem/px values]
- Border radius: [values]

## HANDOFF TO cinematic-website-builder
[Summary of Design Library selection + which modules to activate]
```

---

## Phase 4 — Output Modes

### Mode A: Direct Build
Claude reads the workflow map and immediately executes it using `cinematic-website-builder`.

```
Workflow Map → cinematic-website-builder → single-file HTML output
```

### Mode B: SKILL.md Export
Claude packages the workflow as a reusable skill for future builds of the same style.

```
Workflow Map → SKILL.md → /mnt/skills/user/[style-name]/SKILL.md
```

### Mode C: Comparison Build
Claude builds what the video shows + enhances it with Space Age standards.

```
Workflow Map → cinematic-website-builder → enhanced output
                                           (VL-01 dark glass + upgraded effects)
```

---

## Execution — Full Run

### Paste a YouTube URL and say: "copy this workflow"

Claude will:

1. **Extract** — pull transcript, chapters, metadata via `sa-youtube-cli`
2. **Download + frame** — pull video to VPS, extract frames at 1/10s
3. **Analyze frames** — Claude reads frames as images, identifies UI shown
4. **Detect stack** — scan transcript + code visible on screen
5. **Build workflow map** — ordered, complete, executable
6. **Ask:** "Build it now or save as skill?"
7. **Execute** — hand off to `cinematic-website-builder` with full Handoff Package

---

## Speed Tiers

| Tier | Time | What You Get |
|---|---|---|
| **Quick Read** | 2 min | Stack + sections + effects list |
| **Full Workflow** | 5 min | Complete workflow map ready to build |
| **Build Now** | 10-15 min | Full workflow + cinematic-website-builder execution |
| **Save as Skill** | 7 min | Full workflow packaged as reusable SKILL.md |

---

## Example: Common YouTube Build Video Types

### Type 1: "Build a Portfolio Site with GSAP"
Claude extracts:
- HTML/CSS/JS stack (usually CDN-only)
- ScrollTrigger pinning pattern
- Text reveal animations (SplitText or manual spans)
- Smooth scroll setup (Lenis usually)
- 3-5 scroll sections with specific effects

### Type 2: "Awwwards-Style Landing Page"
Claude extracts:
- Canvas/WebGL background
- Custom cursor implementation
- Horizontal scroll or sticky scroll
- Typography animation on load
- Color palette + spacing system

### Type 3: "Webflow Tutorial"
Claude extracts:
- Section structure + naming conventions
- Interactions panel settings (translated to GSAP equivalents)
- CMS structure
- Class naming system

### Type 4: "Next.js + Framer Motion Site"
Claude extracts:
- Component structure
- Animation variants
- Page transition setup
- Tailwind class system used

---

## Trigger This Skill When
- User pastes YouTube URL + says anything like: "build this", "copy this", "replicate", "how did they do this", "extract workflow", "what stack", "watch and build"
- User wants to match a competitor or reference site they found on YouTube
- User wants to learn a build technique from a tutorial
- Any "watch → build" intent regardless of phrasing
