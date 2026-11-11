---
name: lead-to-brief
display_name: SPACE AGE — Lead to Brief
version: 0.1.0
last_updated: 2026-07-30
description: >
  Stage 1 of the SA website pipeline. Turns a raw scraped lead row into a
  structured Build Brief that every downstream skill (ui-ux-designer,
  cinematic-website-builder, sa-local-seo-geo, deploy-operator,
  vapi-orchestrator, outreach-copywriter) reads from. Trigger on: "generate
  a brief", "process this lead", "brief this business", or when
  browserbase-scraper hands off a qualified leads CSV.
---

# LEAD TO BRIEF
## Space Age AI Solutions — Brief Generation Layer

Stage 1 of the SA website pipeline. One skill call per lead row = one
`build_brief.json` file that every later stage treats as ground truth for
that lead.

> Reconciled against `SA_MASTER_PIPELINE_Website_VoiceAgent_Streamlined.md`
> v2.0, Stage 1 spec.

---

## PIPELINE POSITION

```
browserbase-scraper (qualified leads CSV)
        ↓
  lead-to-brief  ←── YOU ARE HERE
        ↓
  /root/agent-os/pipeline/briefs/{lead_id}.json
        ↓
  ui-ux-designer (Stage 2) reads category_intelligence → moodboard lookup
  sa-local-seo-geo, cinematic-website-builder, deploy-operator,
  vapi-orchestrator, outreach-copywriter all read fields from this file
```

---

## ORCHESTRATION — DIRECT API, NO N8N

Per the standing SA infra rule (direct API calls + Hermes Telegram control
only, no n8n anywhere in the pipeline):

- Trigger is a **direct call from the scraper script**, not an n8n webhook.
- On the VPS this runs as a **PM2-managed Node process** that:
  1. Reads a row from the browserbase-scraper CSV (or receives one via stdin,
     matching `node lead-to-brief.js --stdin`).
  2. Calls the Claude API directly with the brief-generation prompt below.
  3. Writes the result to `/root/agent-os/pipeline/briefs/{lead_id}.json`.
  4. Pings Hermes Telegram with a one-line status.
- No n8n node anywhere in this chain.

---

## INPUT — CSV ROW FROM BROWSERBASE-SCRAPER

Matches the browserbase-scraper output columns exactly:

| Field | Notes |
| :---- | :---- |
| `business_name` | Google Maps listing name |
| `category` | Input parameter (e.g. "plumber") |
| `address` | Maps detail panel |
| `city` / `state` | Input parameter |
| `phone` | Maps detail panel |
| `existing_website` | Maps detail panel — empty if none |
| `google_rating` | Maps card |
| `review_count` | Maps card |
| `quality_score` | Computed by scraper — drives Hermes lane routing |
| `bb_session_id` | Browserbase session — debugging, replay |
| `scraped_at` | ISO timestamp |

---

## LEAD ID

`lead_id` reuses the same fingerprint browserbase-scraper already computes
for dedup (md5 of lowercased `business_name` + first 20 chars of lowercased
`address`), so the id stays stable end-to-end without a second lookup:

```
lead_id = md5(`${business_name.toLowerCase().replace(/\s+/g,'')}:${address.toLowerCase().slice(0,20)}`)
```

---

## OUTPUT — BUILD BRIEF SCHEMA

Write exactly this shape to `/root/agent-os/pipeline/briefs/{lead_id}.json`.
Downstream stages only ever set/replace their own block — never restructure
the file.

```json
{
  "lead_id": "{lead_id}",
  "created_at": "{ISO_timestamp}",
  "source": {
    "bb_session_id": "{bb_session_id}",
    "scraped_at": "{scraped_at}"
  },
  "business": {
    "business_name": "{business_name}",
    "category": "{category}",
    "address": "{address}",
    "city": "{city}",
    "state": "{state}",
    "phone": "{phone}",
    "existing_website": "{existing_website}",
    "google_rating": "{google_rating}",
    "review_count": "{review_count}"
  },
  "quality_score": "{quality_score}",
  "category_intelligence": {
    "industry_vertical": "{normalized vertical, e.g. 'home-services/plumbing'}",
    "aesthetic_direction_hint": "{short phrase — feeds design-taste-frontend's Aesthetic Routing Table for the Stage 2 moodboard lookup, never a moodboard letter itself}",
    "pain_points": ["{typical pain point}", "..."],
    "competitive_angle": "{one-line differentiation angle for outreach copy}"
  },
  "moodboard": null,
  "deploy": { "live_url": null, "deployed_at": null },
  "voice_agent": { "status": null },
  "outreach": { "email_sent_at": null, "vapi_call_status": null }
}
```

- `category_intelligence` is the only creative judgment this skill makes —
  everything past it (moodboard letter, colors, fonts) belongs to
  ui-ux-designer per the Section 0 single-source-of-truth rule. Never assign
  a moodboard letter here.
- `moodboard`, `deploy`, `voice_agent`, `outreach` start `null`/empty and are
  filled in-place by their respective stages. Never pre-populate them.

---

## HERMES STATUS PING

```bash
curl -sS -X POST "https://api.telegram.org/bot${HERMES_TOKEN}/sendMessage" \
  -d chat_id="${HERMES_CHAT_ID}" \
  -d text="[{business_name}] brief created: {lead_id}"
```

On failure (Claude API error, malformed row, write failure):

```bash
curl -sS -X POST "https://api.telegram.org/bot${HERMES_TOKEN}/sendMessage" \
  -d chat_id="${HERMES_CHAT_ID}" \
  -d text="[{business_name}] brief FAILED: {one-line error}"
```

---

## NEVER DO

- Never call an n8n webhook anywhere in this flow — direct API only
- Never assign a moodboard letter, color system, or typography — that's
  ui-ux-designer's exclusive domain (Section 0 rule)
- Never overwrite an existing brief file for the same `lead_id` — if one
  exists, that lead has already been briefed; skip and ping Hermes instead
- Never embed the Claude API key, Hermes token, or chat id in files —
  env vars only
- Never skip the Hermes ping — it is this stage's completion signal

---

## SKILL CONNECTIONS

- **Upstream:** browserbase-scraper (qualified leads CSV)
- **Downstream:** ui-ux-designer (`category_intelligence` → moodboard),
  sa-local-seo-geo + cinematic-website-builder (`business` block),
  deploy-operator (`deploy` block), vapi-orchestrator + outreach-copywriter
  (`business`, `deploy.live_url` as `{preview_url}`)
- **Control plane:** Hermes Telegram (status), sa-obsidian-vault-ops
  (lead processed → logged to daily session-memory note)
