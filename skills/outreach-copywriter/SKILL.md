---
name: outreach-copywriter
display_name: SPACE AGE — Outreach Copywriter
version: 0.1.0
last_updated: 2026-07-30
description: >
  Stage 7 of the SA website pipeline. Reads a completed build brief (with a
  live deployed site) and produces the outbound email HTML and the Vapi
  phone script variables that Stage 6's voice agent and a direct Gmail send
  both consume. Trigger on: "write the outreach", "draft the email", "write
  the call script", or when deploy-operator hands off a brief with a
  populated `deploy.live_url`.
---

# OUTREACH COPYWRITER
## Space Age AI Solutions — Outreach Generation Layer

Stage 7 of the SA website pipeline. One skill call per brief = one outbound
email + one phone script, both keyed to the lead's live preview site.

> Reconciled against `SA_MASTER_PIPELINE_Website_VoiceAgent_Streamlined.md`
> v2.0, Stage 7 spec.

---

## PIPELINE POSITION

```
deploy-operator (brief.deploy.live_url populated)
        ↓
  outreach-copywriter  ←── YOU ARE HERE
        ↓
  vapi_script → vapi-orchestrator (Stage 6, outbound call)
  email_html  → direct Gmail API send
```

Runs after Stage 5 (Deploy), not before — the whole point of the outreach is
"we already built you a free preview, here it is," so `deploy.live_url` must
be non-null before this skill fires.

---

## ORCHESTRATION — DIRECT API, NO N8N/INSTANTLY

Per the standing SA infra rule (direct API calls + Hermes Telegram control
only):

- Email send is a **direct Gmail API call** through the existing Google
  Drive/Gmail MCP connection — not an n8n workflow, not an Instantly relay.
- The phone script (`vapi_script`) is handed directly to vapi-orchestrator's
  input — no intermediate webhook.

---

## INPUT — BUILD BRIEF FIELDS READ

| Field | Source | Used for |
| :---- | :---- | :---- |
| `business.business_name` | lead-to-brief | Personalization, subject line |
| `business.phone` | lead-to-brief | Vapi call target |
| `business.category` | lead-to-brief | Angle selection |
| `business.existing_website` | lead-to-brief | "vs. your current site" framing (only if present) |
| `category_intelligence.pain_points` | lead-to-brief | Email body angle |
| `category_intelligence.competitive_angle` | lead-to-brief | Differentiation line |
| `deploy.live_url` | deploy-operator | The preview link both channels point to |

---

## OUTPUT — EMAIL HTML

Plain, mobile-safe HTML (no external CSS, inline styles only, no tracking
pixels). Structure:

1. Subject line referencing the business by name and the free preview
2. One-sentence hook using `category_intelligence.pain_points[0]`
3. The preview link (`deploy.live_url`)
4. One-line differentiation using `category_intelligence.competitive_angle`
5. Soft CTA — book a 10-minute call, or reply to opt out
6. Plain-text unsubscribe/opt-out line (required — this is cold outreach)

Sent via direct Gmail API call. Write `outreach.email_sent_at` back into the
brief file on successful send (preserve the rest of the brief unchanged).

---

## OUTPUT — VAPI SCRIPT

Produces the labeled node structure vapi-orchestrator expects, keyed by
node name so it drops straight into the Vapi system prompt template and the
`endCallMessage` field:

```json
{
  "vapi_script": {
    "opening": {
      "message": "Hi, is this {business_name}? This is [AGENT_NAME] calling on behalf of Space Age AI Solutions."
    },
    "value_prop": {
      "message": "We already built {business_name} a free website preview — no charge, no obligation — because we think it could help with {pain_point}. Want me to send you the link?"
    },
    "objection_handling": [
      { "trigger": "too busy", "response": "Totally understand — can I text you the link so you can look whenever?" },
      { "trigger": "already have a website", "response": "{competitive_angle}" },
      { "trigger": "price", "response": "We can start as low as $400 depending on scope — worth a quick look either way." }
    ],
    "booking_close": {
      "message": "I'd love to grab 10 minutes on the calendar to walk you through it — does {suggested_time} work, or should I text a link to pick a time?"
    },
    "exit_positive": {
      "message": "Perfect, I'll text that over now. Talk soon!"
    },
    "exit_negative": {
      "message": "No problem at all, thanks for your time — take care!"
    }
  }
}
```

This whole object is handed to vapi-orchestrator as-is; it substitutes
`{business_name}`, `{preview_url}` (= `deploy.live_url`), and `{phone}` from
the same brief file at deploy time.

---

## NEVER DO

- Never fire before `deploy.live_url` is populated — there is nothing to
  offer the lead yet
- Never route the email through n8n or Instantly — direct Gmail API only
- Never invent a moodboard, color, or design claim in the copy — reference
  the live URL, don't describe the design
- Never omit the opt-out line from the email
- Never overwrite unrelated brief fields when writing `outreach.email_sent_at`
- Never embed Gmail credentials in files — MCP connection auth only

---

## SKILL CONNECTIONS

- **Upstream:** deploy-operator (`deploy.live_url`), lead-to-brief
  (`business`, `category_intelligence`)
- **Downstream:** vapi-orchestrator (`vapi_script`), Gmail API (direct send)
- **Control plane:** Hermes Telegram (status ping on send), sa-obsidian-vault-ops
  (outreach sent → logged to daily session-memory note)

```bash
curl -sS -X POST "https://api.telegram.org/bot${HERMES_TOKEN}/sendMessage" \
  -d chat_id="${HERMES_CHAT_ID}" \
  -d text="[{business_name}] outreach sent: email + vapi_script ready"
```
