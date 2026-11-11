---
name: lead-to-brief
display_name: SPACE AGE — Lead-to-Brief Converter
version: 1.0.0
last_updated: 2026-04-18
description: >
  The automation glue of the Space Age lead gen pipeline. Takes a raw CSV row from the
  Google Maps scraper and outputs a fully structured Build Brief consumed by every downstream
  skill — cinematic-website-builder, outreach-copywriter, vapi-orchestrator. Use IMMEDIATELY
  whenever a scraped lead row needs to be converted into a production-ready brief. This is
  what makes the pipeline automated — without it every build requires a manual Claude session.
  Trigger on: any lead row, any mention of "brief", "build this lead", "convert the lead",
  or when the lead pipeline hands off a flagged Google Sheets row.
---

# LEAD-TO-BRIEF SKILL
## Space Age AI Solutions — Pipeline Automation Layer

This skill is the **first Claude API call** in the fully automated pipeline. It fires the moment a HIGH-priority lead is flagged in Google Sheets. Output is a structured YAML brief that every downstream skill reads without human intervention.

---

## PIPELINE POSITION

```
Google Maps Scraper
      ↓
Google Sheets (HIGH priority flagged)
      ↓
Direct pipeline trigger (calling process — no n8n)
      ↓
[LEAD-TO-BRIEF] ← YOU ARE HERE
      ↓
Build Brief (YAML)
      ↓
┌─────────────────┬──────────────────┬──────────────────┐
│ cinematic-      │ outreach-        │ vapi-            │
│ website-builder │ copywriter       │ orchestrator     │
└─────────────────┴──────────────────┴──────────────────┘
```

---

## INPUT — RAW LEAD ROW

Accepts any of these formats:

**From Google Sheets / CSV:**
```
name, category, address, phone, website, siteStatus, siteScore, siteNotes, sourceQuery, city
"Green Valley Landscaping", "Landscaping", "1842 Faithon P Lucas Sr Blvd, Mesquite TX 75150", "(972) 555-0182", "", "none", "0", "no site found", "landscaping Mesquite Texas", "Mesquite"
```

**From pipeline trigger JSON:**
```json
{
  "name": "Green Valley Landscaping",
  "category": "Landscaping",
  "address": "1842 Faithon P Lucas Sr Blvd, Mesquite TX 75150",
  "phone": "(972) 555-0182",
  "website": "",
  "siteStatus": "none",
  "siteScore": 0,
  "siteNotes": "no site found",
  "city": "Mesquite",
  "state": "TX"
}
```

---

## PROCESSING LOGIC

### Step 1 — Parse & Validate
Extract these fields. If any are missing, infer from what's available:
- `business_name` — clean, title case
- `category` — normalize to standard (Landscaping / Roofing / Cleaning / HVAC / Plumbing / Electrical / Painting / Concrete / Tree Service / Pest Control / Med Spa / Hair Salon / Barbershop / Auto Repair / Independent Retail / Daycare & Preschool / Appliance Repair / Moving & Storage / Handyman / Pet Grooming & Boarding / Event Planning)
- `city` + `state` — extract from address if not explicit
- `phone` — normalize to (XXX) XXX-XXXX
- `site_status` — none / weak / decent
- `site_weakness` — parsed from siteNotes

### Step 2 — Category Intelligence

> **Visual direction is owned by `spaceage-savo-creative-director-os`'s Industry Decision
> Matrix**, not this table. `SAVO Route` below is a pointer, not a restatement — load SAVO
> for the actual material/motion/hero reasoning. This table's own job is Tone and Primary
> CTA (copy direction), which stay here since SAVO doesn't cover those.

| Category | Tone | SAVO Route | Primary CTA |
|---|---|---|---|
| Landscaping | Dependable, outdoor, craft | `landscaping` → cinematic_editorial | Free Estimate |
| Roofing | Protective, strong, local | `roofing` → industrial_brutalism | Free Inspection |
| Cleaning | Fresh, professional, reliable | `cleaning` → premium_minimalism | Book a Clean |
| HVAC | Trusted, technical, local | `HVAC` → premium_minimalism (cool-blue accent) | Free Quote |
| Plumbing | Reliable, urgent, local | `plumbing` → industrial_brutalism | Call Now |
| Electrical | Safe, certified, expert | `electrical` → industrial_brutalism | Get a Quote |
| Painting | Creative, transformative | `painting` → cinematic_editorial | Free Estimate |
| Concrete | Solid, durable, local | `concrete` → industrial_brutalism | Free Quote |
| Tree Service | Skilled, outdoor, safe | `tree_service` → cinematic_editorial | Free Estimate |
| Pest Control | Protective, clean, fast | `pest_control` → premium_minimalism | Book Service |
| Med Spa | Desirable, trusted, calm | `med_spa` → liquid_glass_iridescent | Book Consultation |
| Hair Salon | Desirable, expressive, trusted | `hair_salon` → liquid_glass_iridescent | Book Appointment |
| Barbershop | Classic, skilled, character | `barbershop` → industrial_brutalism | Book a Cut |
| Auto Repair | Trusted, technical, honest | `auto_repair` → industrial_brutalism | Get a Quote |
| Independent Retail | Discovery, desire, local | `independent_retail` → cinematic_editorial | Shop Now |
| Daycare & Preschool | Warm, safe, nurturing | `daycare_preschool` → warm_trust | Schedule a Tour |
| Appliance Repair | Trusted, technical, local | `appliance_repair` → premium_minimalism | Schedule Repair |
| Moving & Storage | Reliable, capable, local | `moving_storage` → industrial_brutalism | Get a Free Quote |
| Handyman | Reliable, resourceful, local | `handyman` → industrial_brutalism | Book a Handyman |
| Pet Grooming & Boarding | Warm, caring, trusted | `pet_grooming_boarding` → warm_trust | Book Grooming |
| Event Planning | Experiential, premium, creative | `event_planning` → cinematic_editorial | Get a Quote |

### Step 3 — SEO Intelligence
Generate local SEO terms from city + category:
- Primary keyword: `{category} {city} {state}`
- Secondary: `{category} near me`, `{category} {city}`, `best {category} {city}`
- Schema type: map category → LocalBusiness subtype

| Category | Schema Type |
|---|---|
| Landscaping | LandscapingBusiness |
| Roofing | RoofingContractor |
| Cleaning | HouseCleaner |
| HVAC | HVACBusiness |
| Plumbing | Plumber |
| Electrical | Electrician |
| Painting | HousePainter |
| Tree Service | TreeService |
| Pest Control | PestControlService |
| Med Spa | DaySpa |
| Hair Salon | HairSalon |
| Barbershop | HairSalon *(no exact schema.org type — closest valid match)* |
| Auto Repair | AutoRepair |
| Independent Retail | Store |
| Daycare & Preschool | ChildCare |
| Appliance Repair | LocalBusiness *(no exact schema.org type — generic fallback)* |
| Moving & Storage | MovingCompany |
| Handyman | HomeAndConstructionBusiness |
| Pet Grooming & Boarding | LocalBusiness *(no exact schema.org type — generic fallback)* |
| Event Planning | ProfessionalService *(no exact schema.org type — closest valid match)* |

### Step 4 — Output Brief

Output this exact YAML structure. Every field must be populated — no nulls, no placeholders:

```yaml
build_brief:
  meta:
    brief_id: "{business_name_slug}-{timestamp}"
    generated_at: "{ISO timestamp}"
    pipeline_version: "1.0"
    source_lead_status: "{none|weak}"

  business:
    name: ""
    name_slug: ""          # kebab-case for URLs/filenames
    category: ""
    category_schema: ""    # schema.org subtype
    phone: ""
    address: ""
    city: ""
    state: ""
    zip: ""
    email: ""              # empty string if not available

  site_audit:
    previous_site: ""      # URL or "none"
    site_status: ""        # none | weak
    weaknesses: []         # parsed from siteNotes
    opportunity: ""        # one sentence on why they need this

  design:
    moodboard: ""          # SAVO material route for this category (spaceage-savo-creative-director-os)
    tone: ""
    color_primary: ""      # hex
    color_accent: ""       # hex
    color_background: ""   # hex
    font_display: ""       # Bebas Neue / Orbitron / etc.
    font_body: ""          # DM Sans / etc.
    hero_concept: ""       # SAVO's `hero:` field for this category, expanded to a full description
    hero_image_query: ""   # Unsplash search query for hero photo

  copy:
    headline_primary: ""   # Orbitron display headline
    headline_accent: ""    # the italicized gold word
    subheadline: ""
    cta_primary: ""
    cta_secondary: ""
    value_props: []        # 4-5 bullet points
    about_paragraph: ""    # 2 sentences, local and human

  seo:
    page_title: ""         # "{Business Name} | {Category} | {City}, {State}"
    meta_description: ""   # 155 chars max, includes city + category
    primary_keyword: ""
    secondary_keywords: []
    schema_type: ""
    service_area: []       # city + 3-4 neighboring cities

  services:               # 4 services to feature
    - title: ""
      description: ""
      icon: ""            # svg path name (lawn/roof/clean/hvac/etc.)

  outreach:
    owner_name: ""         # "there" if unknown
    email_subject: ""
    email_hook: ""         # one sentence opening
    price_anchor: 750
    price_floor: 300
    vapi_intro: ""         # first 2 sentences of the phone script

  deploy:
    vercel_project_name: "" # {name_slug}-{city_slug}
    preview_subdomain: ""   # {name_slug}.vercel.app
    estimated_build_time: "45 seconds"
```

---

## NEVER DO
- Never output a brief with null or empty required fields — infer from context
- Never skip the SEO section — it's what makes the site rank
- Never use generic service descriptions — make them specific to the category and city
- Never output anything other than the YAML brief — no prose, no explanation, just the brief
- Never set price_anchor above 750 or price_floor below 300

---

## API CALL SPEC (direct API + Hermes)

Per SA standing infra: **direct API calls + Hermes Telegram control only — no n8n.**
The lead row is handed to this skill by the calling process (script/agent), which makes
the Anthropic call directly and pings Hermes on completion. Data contract unchanged.

```bash
# 1. Direct API call — convert the lead row to a build brief
BRIEF=$(curl -s -X POST https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d @- <<JSON
{
  "model": "claude-haiku-4-5-20251001",
  "max_tokens": 2000,
  "system": "[PASTE THIS FULL SKILL.md AS SYSTEM PROMPT]",
  "messages": [
    { "role": "user", "content": "Convert this lead to a build brief:\n\n$LEAD_ROW_JSON" }
  ]
}
JSON
)

# 2. Persist the YAML brief where downstream skills read it (e.g. briefs/{lead_id}.yaml)

# 3. Hermes Telegram status ping on completion
curl -s -X POST "https://api.telegram.org/bot$HERMES_TOKEN/sendMessage" \
  -d chat_id="$HERMES_CHAT_ID" \
  -d text="[lead-to-brief] done: ${LEAD_ID} → ${BUSINESS_NAME}"
```

Secrets (`ANTHROPIC_API_KEY`, `HERMES_TOKEN`, `HERMES_CHAT_ID`) come from the process
environment — never embed them in the brief or the skill.

**Model:** Haiku 4.5 — fast, cheap (~$0.005/lead), more than capable for structured output
**Expected output tokens:** 800–1,200
**Expected latency:** 2–4 seconds

---

## SKILL CONNECTIONS

- **Upstream:** direct trigger from the lead pipeline when a Google Sheets row is
  flagged HIGH priority — the calling process invokes this skill directly (no n8n)
- **Downstream → cinematic-website-builder:** passes `design` + `seo` + `services` + `copy` blocks
- **Downstream → outreach-copywriter:** passes `business` + `outreach` + `site_audit` blocks
- **Downstream → vapi-orchestrator:** passes `business` + `outreach` + `deploy` blocks
- **Downstream → local-business-seo:** passes `seo` + `business` + `services` blocks
