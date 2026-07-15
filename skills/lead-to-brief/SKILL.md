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
  or when n8n/Make sends a webhook payload from Google Sheets.
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
n8n Webhook Trigger
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

**From n8n webhook JSON:**
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
- `category` — normalize to standard (Landscaping / Roofing / Cleaning / HVAC / Plumbing / Electrical / Painting / Concrete / Tree Service / Pest Control)
- `city` + `state` — extract from address if not explicit
- `phone` — normalize to (XXX) XXX-XXXX
- `site_status` — none / weak / decent
- `site_weakness` — parsed from siteNotes

### Step 2 — Category Intelligence
Map category to design and copy intelligence:

| Category | Tone | Visual Archetype | Hero Concept | Primary CTA |
|---|---|---|---|---|
| Landscaping | Dependable, outdoor, craft | GOLD_CINEMATIC | Aerial manicured lawn, golden hour | Free Estimate |
| Roofing | Protective, strong, local | DARK_AUTHORITY | Storm-ready home, dramatic sky | Free Inspection |
| Cleaning | Fresh, professional, reliable | CLEAN_BRIGHT | Pristine space, high contrast | Book a Clean |
| HVAC | Trusted, technical, local | BLUE_TECH | Comfort home, cool tones | Free Quote |
| Plumbing | Reliable, urgent, local | INDUSTRIAL | Tools, pipes, clean resolution | Call Now |
| Electrical | Safe, certified, expert | DARK_ELECTRIC | Illuminated home, precision | Get a Quote |
| Painting | Creative, transformative | WARM_EDITORIAL | Before/after reveal concept | Free Estimate |
| Concrete | Solid, durable, local | DARK_CONCRETE | Finished driveway, clean lines | Free Quote |
| Tree Service | Skilled, outdoor, safe | FOREST_DARK | Tree canopy, dramatic removal | Free Estimate |
| Pest Control | Protective, clean, fast | CLEAN_DARK | Protected home, clean space | Book Service |

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
    moodboard: ""          # from category intelligence table
    tone: ""
    color_primary: ""      # hex
    color_accent: ""       # hex
    color_background: ""   # hex
    font_display: ""       # Bebas Neue / Orbitron / etc.
    font_body: ""          # DM Sans / etc.
    hero_concept: ""       # full cinematic hero description
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

## API CALL SPEC (for n8n)

```javascript
// n8n HTTP Request node
{
  method: "POST",
  url: "https://api.anthropic.com/v1/messages",
  headers: {
    "x-api-key": "{{$env.ANTHROPIC_API_KEY}}",
    "anthropic-version": "2023-06-01",
    "content-type": "application/json"
  },
  body: {
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    system: "[PASTE THIS FULL SKILL.md AS SYSTEM PROMPT]",
    messages: [{
      role: "user",
      content: "Convert this lead to a build brief:\n\n{{JSON.stringify($json)}}"
    }]
  }
}
```

**Model:** Haiku 4.5 — fast, cheap (~$0.005/lead), more than capable for structured output
**Expected output tokens:** 800–1,200
**Expected latency:** 2–4 seconds

---

## SKILL CONNECTIONS

- **Upstream:** n8n webhook from Google Sheets HIGH-priority flag
- **Downstream → cinematic-website-builder:** passes `design` + `seo` + `services` + `copy` blocks
- **Downstream → outreach-copywriter:** passes `business` + `outreach` + `site_audit` blocks
- **Downstream → vapi-orchestrator:** passes `business` + `outreach` + `deploy` blocks
- **Downstream → local-business-seo:** passes `seo` + `business` + `services` blocks
