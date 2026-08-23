---
name: sa-deploy-operator
display_name: SPACE AGE — Deploy Operator
version: 1.0.0
last_updated: 2026-07-15
description: >
  Final stage of the Space Age site pipeline. Takes the completed single-file site from
  cinematic-website-builder plus the build_brief and ships it live to Vercel, captures the
  production URL, writes it back into the brief, pings Hermes on Telegram, and logs the
  deploy to the Obsidian vault. Direct Vercel CLI + Hermes control only — no n8n. Use
  IMMEDIATELY once a build is ready to go live. Trigger on: "deploy the site", "ship it",
  "push to vercel", "go live", "publish the build", or when the pipeline reaches the
  deploy step after cinematic-website-builder.
---

# SA DEPLOY OPERATOR SKILL
## Space Age AI Solutions — Deployment Layer (Pipeline Stage 5)

Ships a finished build to production and closes the loop back to the brief and Hermes.
This is the last automated step before a lead sees their live preview.

---

## PIPELINE POSITION

```
lead-to-brief → ui-ux-designer → cinematic-website-builder → sa-local-seo-geo
      ↓
[SA-DEPLOY-OPERATOR] ← YOU ARE HERE
      ↓
Live Vercel URL → written back to brief → Hermes ping → Obsidian log
      ↓
outreach-copywriter / vapi-orchestrator (now have {preview_url} to reference)
```

---

## INPUT

- The completed site (single-file `index.html`, or a project directory) from
  `cinematic-website-builder`.
- The `build_brief` — specifically the `deploy` block:
  - `vercel_project_name` — `{name_slug}-{city_slug}`
  - `preview_subdomain` — `{name_slug}.vercel.app`
  - `business.name`, `meta.brief_id` — for logging and the Hermes ping.

---

## CONFIG (from process env — never embedded in the brief or this skill)

| Var | Purpose |
|---|---|
| `VERCEL_SCOPE` | Vercel team/scope to deploy under (pass via `--scope`) |
| `HERMES_TOKEN` | Telegram bot token for the status ping |
| `HERMES_CHAT_ID` | Telegram chat to notify |
| `OBSIDIAN_VAULT` | Path to the Space Age Obsidian vault for the deploy log |

The Vercel token is **never** embedded anywhere — auth is via the Vercel CLI's own
logged-in session (`vercel login` once on the host). Only the non-secret `--scope`
identifier is passed on the command line.

---

## PROCEDURE

### Step 1 — Deploy to production
```bash
cd "$BUILD_DIR"   # directory holding index.html (and any assets)

# Deploy. --yes skips prompts; --scope selects the SA team; CLI session provides auth.
DEPLOY_URL=$(vercel --prod --yes \
  --name "$VERCEL_PROJECT_NAME" \
  --scope "$VERCEL_SCOPE" 2>/dev/null | tail -1)

# DEPLOY_URL is the live production URL, e.g. https://greenvalley-mesquite.vercel.app
```

### Step 2 — Write the live URL back into the brief
```bash
# Update the deploy block in the brief file so downstream skills reference the real URL.
# (outreach-copywriter and vapi-orchestrator read deploy.preview_subdomain / {preview_url}.)
yq -i ".build_brief.deploy.live_url = \"$DEPLOY_URL\"" "$BRIEF_FILE"
yq -i ".build_brief.deploy.deployed_at = \"$(date -u +%FT%TZ)\"" "$BRIEF_FILE"
```

### Step 3 — Hermes Telegram ping
```bash
curl -s -X POST "https://api.telegram.org/bot$HERMES_TOKEN/sendMessage" \
  -d chat_id="$HERMES_CHAT_ID" \
  -d text="[sa-deploy-operator] LIVE: ${BUSINESS_NAME} → ${DEPLOY_URL} (${BRIEF_ID})"
```

### Step 4 — Log the deploy to the Obsidian vault
```bash
LOG="$OBSIDIAN_VAULT/Deploys/$(date -u +%F)-${VERCEL_PROJECT_NAME}.md"
mkdir -p "$(dirname "$LOG")"
cat > "$LOG" <<MD
# Deploy — ${BUSINESS_NAME}
- brief_id: ${BRIEF_ID}
- project: ${VERCEL_PROJECT_NAME}
- live_url: ${DEPLOY_URL}
- deployed_at: $(date -u +%FT%TZ)
- pipeline: space-age-site-v1
MD
```

---

## OUTPUT

```yaml
deploy_result:
  brief_id: "{brief_id}"
  project: "{vercel_project_name}"
  live_url: "{DEPLOY_URL}"
  deployed_at: "{ISO timestamp}"
  status: "live"
  hermes_notified: true
  obsidian_logged: true
```

---

## NEVER DO
- Never embed the Vercel token (or any secret) in the brief, the log, or this skill —
  CLI-authenticated session only.
- Never deploy without a resolved `vercel_project_name` — collisions overwrite another
  lead's site.
- Never reuse one project for multiple businesses — one project per lead.
- Never route deploys through n8n — direct Vercel CLI + Hermes only (standing SA infra).
- Never report "live" until you have captured a real production URL from the CLI output.

---

## SKILL CONNECTIONS
- **Upstream:** `cinematic-website-builder` (completed build) + `sa-local-seo-geo`
  (SEO/GEO injection) + `lead-to-brief` (`deploy` block).
- **Downstream → `outreach-copywriter` / `vapi-orchestrator`:** both now have a real
  `{preview_url}` to reference in email and call scripts.
- **Downstream → Obsidian vault:** permanent deploy record for the session-end log.
