---
name: sa-deploy-operator
display_name: SPACE AGE — Deploy Operator
version: 0.1.0
last_updated: 2026-07-13
description: >
  Final pipeline stage: takes a finished site build and ships it to production on
  Vercel, captures the live URL, writes it back to the lead's brief file, pings
  Hermes Telegram with the result, and logs the deploy to the Obsidian vault.
  Trigger on: "deploy the site", "ship it", "push to production", "go live",
  or when cinematic-website-builder hands off a completed build.
---

# SA DEPLOY OPERATOR
## Space Age AI Solutions — Production Deploy Layer

Stage 5 of the SA website pipeline. One skill call = one site live on Vercel with
the URL recorded everywhere downstream systems expect it.

> Built from the pipeline handoff core-logic spec. The full Stage 5 spec lives in
> `SA_MASTER_PIPELINE_Website_VoiceAgent_Streamlined.md` — reconcile this skill
> against it when that doc is available.

---

## PIPELINE POSITION

```
cinematic-website-builder (production HTML build)
        ↓
  sa-deploy-operator  ←── YOU ARE HERE
        ↓
  brief file updated with live URL → vapi-orchestrator / outreach use it
```

---

## PRECONDITIONS

1. A completed build directory (static HTML or framework project) exists.
2. Vercel CLI is installed and authenticated (`vercel whoami` succeeds).
   **Never embed the Vercel token in any file, config, or skill — CLI auth only.**
3. The lead's brief file path is known (the build brief from lead-to-brief).

---

## DEPLOY SEQUENCE

```bash
# 1. Deploy to production under the SA team scope
cd {build_dir}
vercel --prod --yes --scope team_b7Ju9bt8GNoiLnMor6ieC8J7
# → capture the printed production URL as {live_url}

# 2. Write the live URL back to the brief file
#    (preserve the brief's existing structure — only set/replace this field)
#    deploy.live_url: {live_url}
#    deploy.deployed_at: {ISO_timestamp}

# 3. Hermes Telegram status ping (env vars only, never embed the token)
curl -sS -X POST "https://api.telegram.org/bot${HERMES_TOKEN}/sendMessage" \
  -d chat_id="${HERMES_CHAT_ID}" \
  -d text="[sa-deploy-operator] live: {business_name} → {live_url}"

# 4. Obsidian vault log — append a deploy entry per the standing
#    session-end checklist (client, live_url, timestamp, brief path)
```

---

## FAILURE HANDLING

- Deploy fails → do NOT retry blindly. Capture the Vercel error output, ping
  Hermes with `[sa-deploy-operator] FAILED: {business_name} — {one-line error}`,
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
- **Control plane:** Hermes Telegram (status), Obsidian vault (audit log)
