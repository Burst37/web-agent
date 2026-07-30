---
name: deploy-operator
display_name: SPACE AGE — Deploy Operator
version: 0.2.0
last_updated: 2026-07-30
description: >
  Final pipeline stage: takes a finished site build and ships it to production on
  Vercel, captures the live URL, writes it back to the lead's brief file, pings
  Hermes Telegram with the result, and logs the deploy to the vault (Google Drive
  session memory via sa-obsidian-vault-ops).
  Trigger on: "deploy the site", "ship it", "push to production", "go live",
  or when cinematic-website-builder hands off a completed build.
---

# DEPLOY OPERATOR
## Space Age AI Solutions — Production Deploy Layer

Stage 5 of the SA website pipeline. One skill call = one site live on Vercel with
the URL recorded everywhere downstream systems expect it.

> Reconciled against `SA_MASTER_PIPELINE_Website_VoiceAgent_Streamlined.md` v2.0,
> Stage 5 spec. Folder name matches the spec's naming rule (no SA- prefix).

---

## PIPELINE POSITION

```
cinematic-website-builder (production HTML build)
        ↓
  deploy-operator  ←── YOU ARE HERE
        ↓
  brief file updated with live URL → vapi-orchestrator / outreach-copywriter use it
```

---

## PRECONDITIONS

1. A completed build directory (static HTML or framework project) exists and has
   passed the Stage 4 QA Gate checklist (cinematic-website-builder) — never deploy
   a build that hasn't cleared QA.
2. Vercel CLI is installed and authenticated (`vercel whoami` succeeds).
   **Never embed the Vercel token in any file, config, or skill — CLI auth only.**
3. The lead's brief file exists at `/root/agent-os/pipeline/briefs/{lead_id}.json`
   (written by lead-to-brief in Stage 1).

---

## DEPLOY SEQUENCE

```bash
# 1. Deploy to production under the SA team scope
cd {build_dir}
vercel --prod --yes --scope team_b7Ju9bt8GNoiLnMor6ieC8J7
# → capture the printed production URL as {live_url}

# 2. Write the live URL back to the brief file at
#    /root/agent-os/pipeline/briefs/{lead_id}.json
#    (preserve the brief's existing structure — only set/replace this field)
#    deploy.live_url: {live_url}
#    deploy.deployed_at: {ISO_timestamp}

# 3. Hermes Telegram status ping (env vars only, never embed the token)
#    Exact format per master pipeline Stage 5 spec:
curl -sS -X POST "https://api.telegram.org/bot${HERMES_TOKEN}/sendMessage" \
  -d chat_id="${HERMES_CHAT_ID}" \
  -d text="[{business_name}] site live: {live_url}"

# 4. Vault log — append a deploy entry to today's Google Drive session-memory
#    note (sa-obsidian-vault-ops) under the lead-gen-pipeline daily note:
#    client, live_url, timestamp, brief path
```

---

## FAILURE HANDLING

- Deploy fails → do NOT retry blindly. Capture the Vercel error output, ping
  Hermes with `[{business_name}] deploy FAILED: {one-line error}`,
  and stop for review.
- URL capture fails but deploy succeeded → run `vercel ls --scope
  team_b7Ju9bt8GNoiLnMor6ieC8J7` to recover the URL before reporting failure.

---

## NEVER DO

- Never embed the Vercel token, Telegram token, or chat id in files — env/CLI only
- Never deploy without `--scope team_b7Ju9bt8GNoiLnMor6ieC8J7`
- Never overwrite unrelated fields in the brief file
- Never report success without a captured, reachable live URL
- Never skip the Hermes ping — it is the pipeline's completion signal

---

## SKILL CONNECTIONS

- **Upstream:** cinematic-website-builder (completed build), lead-to-brief (brief file)
- **Downstream:** vapi-orchestrator + outreach-copywriter read `deploy.live_url`
  (as `{preview_url}`) from the brief
- **Control plane:** Hermes Telegram (status), sa-obsidian-vault-ops (audit log,
  Google Drive SESSION_MEMORY folder)
