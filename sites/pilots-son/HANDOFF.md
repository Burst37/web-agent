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

## ⚠️ GIT STATE — two commits made, NEITHER PUSHED
```
1d69bb3 fix: iPhone case photo (logo now contained on case)   ← NOT pushed
2c37690 feat: orbit gallery sky bg + clickable spiral cards    ← NOT pushed
```
Next session: `git push -u origin claude/pilots-son-apparel-site-vpnlmu`, then redeploy Vercel. Nothing since 2c37690 is live yet.
> Note: prior commit was stop-hook flagged "Unverified" (wrong committer email, should be `noreply@anthropic.com`). User said "Tomorrow" — still unresolved.

## DONE this session
- **iPhone case fixed** — regenerated via GPT Image 2 (job `0a01ce81-fa3c-4f23-a1ad-8239f806ccf0`), logo now sits neatly inside case edges, no bleed. Saved to `assets/merch-iphone.webp` (same filename `g-case` already references). Committed 1d69bb3.

## 🔴 ACTIVE BUG — socks crops are wrong (user just flagged)
User screenshot: "Legacy Crew Socks" quick view with **Pink** swatch selected shows a **yellow** sock, massively zoomed.
Root cause confirmed:
- Per-color sock files (`assets/socks-*.webp`) are **400×1258 tall single-sock crops** sliced from a wide group shot — but the slices are **misaligned**: `socks-pink.webp` actually contains a yellow sock in the foreground + pink behind (verified by eye). Each color file has the wrong/adjacent sock in frame.
- Second problem: the Quick View media box is a **1:1 square with `object-fit:cover`**, so a 400×1258 tall image gets cropped to its middle third → the "way too zoomed in" look the user sees.
- Fix path: (a) re-slice the original wide socks group shot so each colorway lands centered in its own file (find the source wide render — likely `merch-socks.webp` or a scratch group shot; verify actual colors present before slicing), OR regenerate per-color socks cleanly; and (b) either pad the sock images to square or set `.qvMedia` to `object-fit:contain` / a taller aspect-ratio for sock-type products so the whole sock shows. Same tall-crop risk applies to **caps** (`cap-*.webp`) — sanity-check those too.

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
