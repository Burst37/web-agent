---
name: vapi-orchestrator
display_name: SPACE AGE — Vapi Orchestrator
version: 1.0.0
last_updated: 2026-04-18
description: >
  Takes the outreach-copywriter vapi_script output and the lead build_brief and produces
  a complete, ready-to-deploy Vapi agent configuration JSON. One skill call = one Vapi
  agent deployed and one outbound call queued. Knows Vapi's full API surface — assistants,
  phone numbers, calls, squads, tools, and webhooks. Use IMMEDIATELY when a lead needs
  to be called. Trigger on: "deploy the vapi agent", "make the call", "set up the voice
  agent", "queue the outbound call", or when the pipeline reaches the voice agent step.
---

# VAPI ORCHESTRATOR SKILL
## Space Age AI Solutions — Voice Agent Deployment Layer

This skill takes the Vapi script from outreach-copywriter and the business data from lead-to-brief and produces everything needed to deploy a live outbound Vapi agent via direct API calls from the calling script/process — no n8n. Status is reported through a Hermes Telegram ping on completion (SA standing infra rule: direct API calls + Hermes Telegram control only).

---

## VAPI PLATFORM OVERVIEW

**Platform:** vapi.ai
**Recommended voice:** `shimmer` (ElevenLabs — warm, professional, female)
**Phone provider:** Twilio (provision numbers through Vapi dashboard)
**Cost:** ~$0.07–$0.15/minute of call time
**Average call time for this script:** 2–4 minutes
**Cost per call attempt:** ~$0.20–$0.60

---

## OUTPUT — VAPI ASSISTANT CONFIG

This is the complete JSON payload for the Vapi `POST /assistant` endpoint:

```json
{
  "name": "{business_name_slug}-outreach-agent",
  "model": {
    "provider": "anthropic",
    "model": "claude-haiku-4-5-20251001",
    "temperature": 0.7,
    "systemPrompt": "{vapi_system_prompt}"
  },
  "voice": {
    "provider": "11labs",
    "voiceId": "shimmer",
    "stability": 0.6,
    "similarityBoost": 0.75,
    "style": 0.3,
    "useSpeakerBoost": true
  },
  "firstMessage": "{vapi_script.first_message}",
  "transcriber": {
    "provider": "deepgram",
    "model": "nova-2",
    "language": "en-US"
  },
  "endCallFunctionEnabled": true,
  "endCallPhrases": [
    "goodbye",
    "take care",
    "have a good day",
    "not interested",
    "remove me"
  ],
  "endCallMessage": "{vapi_script.exit_negative.message}",
  "recordingEnabled": true,
  "hipaaEnabled": false,
  "silenceTimeoutSeconds": 30,
  "maxDurationSeconds": 300,
  "backgroundDenoisingEnabled": true,
  "metadata": {
    "lead_id": "{brief_id}",
    "business_name": "{business_name}",
    "pipeline": "space-age-outreach-v1"
  },
  "analysisPlan": {
    "summaryPrompt": "Summarize this sales call in 2 sentences. State the outcome: booked / interested / declined / callback. Note any specific objections.",
    "structuredDataSchema": {
      "type": "object",
      "properties": {
        "outcome": {
          "type": "string",
          "enum": ["booked", "interested_no_book", "declined", "no_answer", "callback"]
        },
        "price_discussed": { "type": "boolean" },
        "callback_requested": { "type": "boolean" },
        "callback_time": { "type": "string" },
        "objections": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    }
  },
  "serverUrl": "{OUTCOME_WEBHOOK_URL}/vapi-outcomes",
  "serverUrlSecret": "{VAPI_WEBHOOK_SECRET}"
}
```

---

## OUTPUT — VAPI SYSTEM PROMPT

Generate this from the vapi_script block. This is what the LLM inside Vapi reads:

```
You are a professional sales representative calling on behalf of Space Age AI Solutions.
Your name is [AGENT_NAME]. You are calling {business_name} at {phone}.

YOUR MISSION:
You have already built {business_name} a free website preview at {preview_url}.
Your goal is to let them know about it, get them to view it, and book a 10-minute call
with our team. If they're interested and price is a barrier, you can go as low as $400.

YOUR SCRIPT:
[PASTE vapi_script nodes here as labeled sections]

RULES:
- Never claim to be human if directly asked
- Never pressure. Move on gracefully if they decline.
- Always state your reason for calling in the first 10 seconds
- If they want to be removed from calls: apologize, confirm removal, end call
- If they ask for the website URL: spell it out slowly and offer to text it
- Speak naturally — short sentences, normal pace
- On booking: trigger the send_sms tool to send the Calendly link
```

---

## OUTPUT — OUTBOUND CALL PAYLOAD

After creating the assistant, queue the call:

```json
{
  "assistantId": "{created_assistant_id}",
  "phoneNumberId": "{your_twilio_number_id}",
  "customer": {
    "number": "{lead_phone_e164}",
    "name": "{business_name}"
  },
  "scheduledAt": "{ISO_timestamp}",
  "metadata": {
    "lead_id": "{brief_id}",
    "crm_update_url": "{CRM_UPDATE_URL}/crm-update"
  }
}
```

**Best call times for local service businesses:**
- Tuesday–Thursday: 9am–11am or 2pm–4pm local time
- Avoid: Monday morning, Friday afternoon, weekends
- Schedule calls during business hours of the prospect's timezone

---

## DIRECT API CALLS (3 steps, run from the calling script/process)

```bash
# STEP 1 — Create Vapi Assistant
curl -sS -X POST https://api.vapi.ai/assistant \
  -H "Authorization: Bearer ${VAPI_API_KEY}" \
  -H "Content-Type: application/json" \
  -d @assistant_config.json
# → capture .id from the response as {created_assistant_id}

# STEP 2 — Store assistant_id back on the lead row
# (direct Sheets/Airtable API call from the same script — no middleware)

# STEP 3 — Queue outbound call
curl -sS -X POST https://api.vapi.ai/call/phone \
  -H "Authorization: Bearer ${VAPI_API_KEY}" \
  -H "Content-Type: application/json" \
  -d @call_payload.json

# COMPLETION — Hermes Telegram status ping (never embed the token; env var only)
curl -sS -X POST "https://api.telegram.org/bot${HERMES_TOKEN}/sendMessage" \
  -d chat_id="${HERMES_CHAT_ID}" \
  -d text="[vapi-orchestrator] deployed + call queued: {lead_id} / {business_name}"
```

---

## WEBHOOK HANDLER (your endpoint receives Vapi outcomes)

A small HTTP endpoint you control (the calling process, a serverless function, or the
Hermes host) receives the POST Vapi sends to `serverUrl` after each call:

```javascript
// Handler receives (payload shape unchanged — this is the validated data contract):
{
  "type": "end-of-call-report",
  "call": { "id": "...", "duration": 180 },
  "analysis": {
    "summary": "...",
    "structuredData": {
      "outcome": "booked",
      "price_discussed": true,
      "callback_requested": false,
      "objections": ["too expensive"]
    }
  },
  "metadata": { "lead_id": "...", "business_name": "..." }
}

// Route based on outcome (direct API calls, then Hermes ping):
// "booked" → update Sheets status, notify via SMS/email
// "interested_no_book" → schedule follow-up email in 24hrs
// "declined" → mark closed-lost in Sheets
// "callback" → schedule call at requested time
// "no_answer" → retry once after 4 hours, then email-only
// ALWAYS → Hermes Telegram ping:
//   [vapi-orchestrator] outcome {outcome}: {lead_id} / {business_name}
```

---

## PHONE NUMBER PROVISIONING

One-time setup in Vapi dashboard:
1. Connect your Twilio account to Vapi
2. Buy a local Dallas area code number (+1 972 or +1 214) — looks local to Mesquite targets
3. Note the `phoneNumberId` — export it as `VAPI_PHONE_NUMBER_ID` in the calling script's environment

**Cost:** ~$1.15/month for a Twilio number through Vapi

---

## NEVER DO
- Never deploy a call without a valid phone number in E.164 format
- Never schedule calls before 9am or after 6pm prospect local time
- Never reuse the same assistant_id for different businesses — create fresh per lead
- Never skip the webhook handler — you won't know what happened on the call
- Never call a number flagged "do_not_call" in the Sheets row

---

## SKILL CONNECTIONS
- **Upstream:** outreach-copywriter (reads vapi_script block)
- **Upstream:** lead-to-brief (reads business.phone, business.name, deploy.preview_subdomain)
- **Downstream → Airtable/Sheets CRM:** writes outcome, duration, objections back to lead row (direct API)
- **Downstream → follow-up:** the webhook handler triggers email or callback sequence directly based on outcome, and pings Hermes Telegram with the result
