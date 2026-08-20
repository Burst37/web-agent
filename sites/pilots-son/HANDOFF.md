# THE PILOT'S SON — Handoff (2026-07-09)

Cinematic e-commerce site. Single-file HTML, no build step.

## Coordinates
- **File:** `/home/user/web-agent/sites/pilots-son/index.html` (entire site)
- **Assets:** `/home/user/web-agent/sites/pilots-son/assets/`
- **Repo:** `Burst37/web-agent` · branch `claude/pilots-son-apparel-site-vpnlmu` · draft PR #14
- **Live:** https://pilots-son.vercel.app (Vercel team `team_b7Ju9bt8GNoiLnMor6ieC8J7`)
- **Deploy:** from `sites/pilots-son` → `npx vercel@latest deploy --prod --yes --scope team_b7Ju9bt8GNoiLnMor6ieC8J7`
- **Local test:** `python3 -m http.server 8321` (needs `run_in_background:true`) → only `localhost:8321` reachable by sandbox Playwright, never the live URL.
- **Image tooling:** `sharp` at `/home/user/web-agent/node_modules` (crop/resize/webp).

## GIT STATE — all work pushed (2026-07-09 session 2)
Branch tip `2ba886d` on `origin/claude/pilots-son-apparel-site-vpnlmu` (includes the
previously-unpushed 2c37690 orbit gallery + 1d69bb3 iPhone case fix — they were
already on the remote). Draft PR #14 open, session subscribed to its activity.

## 🔴 DEPLOY BLOCKED — nothing after dpl_5kbVpPgv... is live
This container has NO Vercel credentials (`vercel` CLI hangs on login, no VERCEL_TOKEN,
MCP deploy tool can't inline a 29MB site). The socks fix + orbit gallery + iPhone case
fix are pushed to GitHub but NOT live. User must either run the deploy command above
from a machine with Vercel auth, or add VERCEL_TOKEN to the Claude environment config.

## DONE 2026-07-09 session 2
- **Socks bug FIXED** — all 13 `socks-*.webp` rebuilt from the `merch-socks.webp`
  group shot via OpenCV (rotate 9°, border flood-fill, color-anchored split, manual
  polygon for the black sock, pull-push background plate). Each file is now a square
  900×900 with the CORRECT colorway centered, whole sock visible, seamless dark bg +
  soft shadow. Verified in Quick View via Playwright (pink swatch → pink sock).
  No CSS change needed — square images fix the object-fit:cover zoom.
- Caps sanity-checked: all cap-*.webp are clean 900×900 squares, no action needed.

## PENDING (user asked, not done)
1. **iPhone case — add the 13 color variants.** User confirmed "Same 13-color set" (cap/socks palette: purple, green, sea green, white, black, grey, tan, red, burgundy, butter yellow, pink, blue, denim). Setup already done: red case uploaded as Higgsfield reference **media_id `ba3c27b8-509f-4a8c-8fb1-8e053b50ee10`**. Cost preflighted with `gpt_image_2` img2img: **high/2k = 7 credits each (91 total)**, low/1k = 0.5 each (~7 total). User was asked which quality tier and had NOT answered when they pivoted to the socks bug — **ask again before spending.** After generating: download → webp → build a `CASE_COLORS` array + wire `g-case` to `colors:` like the caps/socks so swatches work.
2. **"Black backgrounds just don't do it for me"** — general dissatisfaction beyond the orbit gallery (which was already fixed with `flight-sky.webp`). Scope not pinned down; do a full pass of dark sections, ask user which ones.
3. **"Shoot for the Moon" tee** — add as a real standalone shop product (front + back). Blocked: user's original design file must be **sourced**, not regenerated. User said "I'll do the photos" — check for a new attachment / new Drive upload before searching.
4. **Anubis / Egyptian + Thor's-hammer designs** — same as #3: user already made them, blind AI regen was explicitly rejected. Source the real files only.

## PAUSED / unclear
- 6-model social shoot + 10s Seedance 2.0 multi-shot hero video (Halo, Mya Millyons, 2 new adults, 2 preteens, each in a different garment + matched Prada America's Cup sneakers). Cast negotiated, never generated. Confirm user still wants it before spending credits.

## HARD RULES (do not violate)
- **Ask before spending Higgsfield credits.** Always preflight cost, confirm scope.
- **Text-heavy art (logos/taglines) → `gpt_image_2`**, never NanoBanana.
- **Never Higgsfield Soul training.** Use saved Reference Elements only: **HighspeedHalo** `4d15e32f-32f4-4b6f-a5c1-b04cd6cec106`, **MYRAMILLYONS** `f3557523-78ed-4f37-93d1-ad1ca7cc5594`. Embed via `<<<element_id>>>`.
- **MAINLINE content is banned** — never use/reference. Scrub anything branded Mainline. (Files `hf_20260610_200241_77811f91...png`, `hf_20260610_200750_436a6195...png`.)
- **Inline/pasted chat images are NOT accessible files.** Only paperclip-attached files (`/root/.claude/uploads/...`) or Google Drive files can be used.
- **Convert all generated media to webp.**

## Useful workflows
- **Large Drive files (>10MB) can't `download_file_content`.** Identify them via `WebFetch` on `https://drive.google.com/thumbnail?id=<ID>&sz=w1200`, following its two redirects (lh3 → work.fife). This is the proven method.
- Drive folders: Pilot's Son Apparel folder (~110 files); SESSION_MEMORY `1uimIv6Uou7Ug0bYabz_P4YLr2LhVLiIU`.

## Key code landmarks in index.html
- `const P=[...]` (~L425) — shop products `{id,n,img,vid?,price,badge?}`.
- `const CAP_COLORS / SOCKS_COLORS / BEANIE_COLORS` (~L597) — `{n,hex,img}` swatch arrays (13/13/6).
- `const G=[...]` (~L617) — gear array. `g-case` at L624 = `{id:'g-case',n:'Logo iPhone Case',img:'merch-iphone.webp',price:34,osfa:true}` (needs `colors:` added for #1).
- `openQuickView(p,kind,startIdx)` — Quick View. `kind:'colors'` renders swatches + `qvColorname`. `.qvMedia` is the 1:1 `object-fit:cover` box implicated in the socks zoom bug.
- Brand: "Pilot's Son = Fly Boy = Born Fly." Palette `--jet #0D0D0F`, `--gold #C79A55`, `--red #B23A2E`, `--cream #D9D2C1`. Logo = boy aviator in red/cream propeller plane, "THE PILOT'S SON / SON / EST. 1974".
