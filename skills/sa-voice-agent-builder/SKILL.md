---
name: sa-voice-agent-builder
display_name: SPACE AGE — Voice Agent Builder (Gemini Flash Live)
version: 0.1.0
last_updated: 2026-07-15
description: >
  Mass-production voice-agent layer for the Space Age outreach pipeline, built on Gemini
  3.1 Flash Live (realtime bidirectional audio) instead of the Vapi platform. Reads the
  outreach-copywriter vapi_script and the lead build_brief and produces a deployable
  realtime voice agent plus a queued outbound call — over a direct API + telephony bridge,
  matching SA's direct-API + Hermes infra (no n8n, no third-party agent platform). This is
  the default for mass production; keep vapi-orchestrator as the fast-path for rush jobs.
  Trigger on: "gemini voice agent", "build the voice agent", "flash live agent", "mass
  production calls", or when the pipeline reaches the voice step and cost/volume favors
  the direct Gemini path over Vapi.
---

# SA VOICE AGENT BUILDER — Gemini Flash Live
## Space Age AI Solutions — Voice Agent Deployment Layer (direct-API default)

Same job as `vapi-orchestrator`, different substrate. Vapi is a managed platform (great
for a one-off rush call); this skill runs the agent directly on **Gemini 3.1 Flash Live**
so mass-production volume isn't gated by per-minute platform fees or an external
orchestrator. Architecture matches SA standing infra: direct API + Hermes Telegram, no n8n.

> **Status:** roadmapped (Phase 7.5). This file is the build spec + architecture. Endpoint
> names and payload shapes for the Gemini Live realtime API must be confirmed against the
> current Google GenAI Live docs before wiring production — they are marked CONFIRM below.

---

## WHEN TO USE THIS vs vapi-orchestrator

| | sa-voice-agent-builder (Gemini Flash Live) | vapi-orchestrator (Vapi) |
|---|---|---|
| Role | **Mass-production default** | Rush / fast-path |
| Infra fit | Direct API + Hermes (native) | Managed platform |
| Cost at volume | Lower (no platform per-minute margin) | Higher |
| Setup for one call | More (own telephony bridge) | Less (turnkey) |
| Best for | Batches of 20–80 leads/day | A single urgent lead now |

Both consume the **same** `vapi_script` + `build_brief` contract, so a lead can be routed
to either without regenerating copy.

---

## INPUT

- `vapi_script` block from `outreach-copywriter` (first_message, nodes, objection
  handlers, booking action, end_of_call_report fields).
- `build_brief` — `business` (name, phone), `outreach` (price_anchor, price_floor,
  owner_name), `deploy.live_url` (the preview URL to reference on the call).

The conversation tree in `vapi_script` maps directly onto the Gemini Live **system
instruction** + tool definitions below — no separate script format.

---

## ARCHITECTURE

```
build_brief + vapi_script
        │
        ▼
 system instruction  ── compiled from vapi_script nodes + rules
        │
        ▼
 Gemini Live session  ◄── realtime audio ──►  Telephony bridge  ◄── PSTN ──►  Prospect
 (WebSocket, model:                            (Twilio Media Streams /
  gemini-3.1-flash-live)                         SIP → 8kHz μ-law ⇄ PCM)
        │
        ├── tools: send_sms(calendly_link), end_call(outcome)
        ▼
 end_of_call_report  ──►  write back to brief  ──►  Hermes ping  ──►  Obsidian log
```

Gemini Live handles STT + reasoning + TTS in one realtime session (no separate Deepgram/
ElevenLabs stack). A telephony bridge converts the phone call's μ-law audio to/from the
PCM the Live API expects and streams both directions.

---

## CONFIG (from process env — never embedded)

| Var | Purpose |
|---|---|
| `GEMINI_API_KEY` | Google GenAI API key for the Live session |
| `GEMINI_LIVE_MODEL` | e.g. `gemini-3.1-flash-live` (CONFIRM exact id) |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` | Telephony bridge (Media Streams) |
| `SA_CALLER_NUMBER` | Local-presence outbound number (E.164) |
| `HERMES_TOKEN` / `HERMES_CHAT_ID` | Telegram status pings |
| `OBSIDIAN_VAULT` | Deploy/outcome log path |

---

## PROCEDURE

### Step 1 — Compile the system instruction from vapi_script
Fold `vapi_script.first_message`, each node's `message`, the objection triggers, and the
VAPI SCRIPT RULES into a single Gemini Live system instruction. Encode the objection
`trigger` phrases as intent guidance ("if the caller says anything like X, respond with
Y"), and expose `send_sms` and `end_call` as function-calling tools.

### Step 2 — Open the Live session (CONFIRM against current Live API)
```python
# Representative — confirm method/param names against the google-genai Live API docs.
from google import genai

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

config = {
    "response_modalities": ["AUDIO"],
    "system_instruction": SYSTEM_INSTRUCTION,   # compiled in Step 1
    "tools": [SEND_SMS_TOOL, END_CALL_TOOL],
    # voice / audio config: CONFIRM (voice name, sample rate) against Live docs
}

async with client.aio.live.connect(model=os.environ["GEMINI_LIVE_MODEL"],
                                    config=config) as session:
    # Bridge: pump telephony audio -> session, session audio -> telephony.
    await run_call_bridge(session, twilio_media_stream)
```

### Step 3 — Telephony bridge (outbound call)
Place the outbound PSTN call via Twilio to `business.phone` from `SA_CALLER_NUMBER`, attach
a Media Streams websocket, and relay audio frames both ways (μ-law 8kHz ⇄ the Live API's
PCM sample rate — resample in the bridge). Enforce the same guardrails as the Vapi path:
E.164 only, business-hours window, honor do_not_call.

### Step 4 — Tools
- `send_sms(calendly_link)` → Twilio SMS to the prospect on booking.
- `end_call(outcome, price_discussed, callback_requested, callback_time, objections)` →
  the model calls this to end and emit the structured `end_of_call_report`.

### Step 5 — Close the loop (direct + Hermes)
```bash
# Write outcome back to the lead/brief, then:
curl -s -X POST "https://api.telegram.org/bot$HERMES_TOKEN/sendMessage" \
  -d chat_id="$HERMES_CHAT_ID" \
  -d text="[sa-voice-agent-builder] call done: ${BUSINESS_NAME} → ${OUTCOME} (${LEAD_ID})"
# Append to $OBSIDIAN_VAULT/Calls/$(date -u +%F)-${LEAD_ID}.md
```

---

## OUTPUT

```yaml
call_result:
  lead_id: "{brief_id}"
  engine: "gemini-flash-live"
  outcome: ""            # booked | interested_no_book | declined | no_answer | callback
  price_discussed: false
  callback_requested: false
  callback_time: ""
  objections: []
  hermes_notified: true
  obsidian_logged: true
```

Identical shape to the Vapi outcome report, so downstream CRM write-back and follow-up
routing are engine-agnostic.

---

## NEVER DO
- Never embed `GEMINI_API_KEY`, Twilio creds, or any secret in the brief, log, or this skill.
- Never call a number outside business hours (prospect local time) or flagged do_not_call.
- Never claim to be human if the prospect directly asks.
- Never price below $300 or above $750.
- Never route through n8n or a managed agent platform on this path — direct API + Hermes only.
- Never report an outcome you didn't capture from `end_call` / the end-of-call report.

---

## SKILL CONNECTIONS
- **Upstream:** `outreach-copywriter` (vapi_script) + `lead-to-brief` (business, outreach,
  deploy blocks).
- **Sibling / fallback:** `vapi-orchestrator` — same contract, managed-platform fast-path.
- **Downstream → CRM (direct):** writes the outcome report back to the lead row.
- **Downstream → Hermes + Obsidian:** status ping + permanent call log.

## OPEN ITEMS (confirm before production)
- Exact Gemini Live model id, `connect` signature, audio/voice config, and tool-calling
  format against the current google-genai Live API.
- Telephony bridge choice (Twilio Media Streams vs SIP) and the resampling path.
