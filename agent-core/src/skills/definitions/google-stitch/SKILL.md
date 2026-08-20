---
name: google-stitch
description: Generate, iterate, and import UI designs from Google Stitch via MCP. Use for any task involving Stitch design generation, screen import, design-to-code conversion, or design token extraction.
category: Design
---

# Google Stitch

Google Stitch is an AI UI/UX design generator. This skill covers prompting best practices,
MCP connection, project/screen import, and design-to-code handoff.

## MCP Connection

Stitch MCP requires OAuth2 — a simple API key is rejected with HTTP 401.

Preferred auth (in order):
1. `STITCH_ACCESS_TOKEN` + `STITCH_PROJECT_ID` env vars (short-lived token from `gcloud auth print-access-token`)
2. `STITCH_USE_SYSTEM_GCLOUD=1` if gcloud is installed and authenticated on the machine

To list projects once authenticated:
```bash
npx @_davideast/stitch-mcp view --projects
```

If authentication fails, report the exact error and stop — do NOT attempt to recreate designs from memory.

## Prompting Best Practices (from official Stitch guide)

### Core principles
- **Be clear and concise** — avoid ambiguity; iterate incrementally
- **One or two adjustments per prompt** — focus on specific screens, not the whole design at once
- Use adjectives to set visual tone: "vibrant and encouraging", "minimal and professional"
- Specify colors, fonts, borders explicitly when precision matters
- Start high-level for new projects; go detailed when refining existing screens

### Structuring complex layouts
Break multi-part layouts into a sequence of focused prompts:
1. Prompt 1 — overall structure (e.g. table layout)
2. Prompt 2 — specific interactive elements (e.g. filter dropdowns)
3. Prompt 3 — alignment, icons, and polish

Never combine multiple unrelated changes into a single long prompt.

### Targeting elements
Reference screens or element positions explicitly:
- "On the Dashboard screen, change the header color to…"
- "The card in the top-left of the Overview screen should…"

### Known limitations
- Stitch does not remember previous design context unless prompts are incremental and precise
- Prompts over ~5,000 characters may cause components to be omitted
- Work screen-by-screen rather than trying to describe an entire app in one prompt

## Import Workflow

1. List projects: `npx @_davideast/stitch-mcp view --projects`
2. List screens in a project: `npx @_davideast/stitch-mcp screens --project <projectId>`
3. Fetch screen HTML: `npx @_davideast/stitch-mcp tool getScreenCode --data '{"screenId":"<id>"}'`
4. Fetch screen image: `npx @_davideast/stitch-mcp tool getScreenImage --data '{"screenId":"<id>"}'`
5. Build full site: `npx @_davideast/stitch-mcp site --project <projectId>`
6. Extract design tokens: `npx @_davideast/stitch-mcp tool extractDesignContext --data '{"screenId":"<id>"}'`

Always save the raw MCP import as-is before any modifications — this is the source of truth.
Never recreate or infer design details from memory; only work from what the MCP returns.

## Design-to-Code Handoff

After importing, extract the following from the raw HTML/CSS:
- **Color tokens** — all hex/rgb values → CSS custom properties or JS constants
- **Typography** — font families, sizes, weights → a single type scale
- **Spacing** — padding/margin values → a token scale
- **Border radius, shadows, z-index** — tokenize everything

Apply tokens project-wide; no raw values should remain after the token pass.

## Output
Use `formatOutput` with format `"json"` when returning structured design data (token sets,
screen metadata, component trees). For code output, return files directly.
