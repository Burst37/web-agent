#!/usr/bin/env python3
"""
JARVIS — The Galaxy builder (Prompt 1)

Scans a folder of markdown notes and writes viewer/graph-data.js containing
    const GRAPH = {nodes: [...], links: [...]}

Standard library only. No pip installs.

Node schema:
    { id, label, group, excerpt, path }
      - id      : numeric index == position in the nodes array (features depend on this)
      - label   : derived from the filename
      - group   : the note's folder (used for colour-coding)
      - excerpt : ~700 characters of the note body
      - path    : path relative to the notes root (used by the server)

Links are created when one note mentions another note's title, or when two
notes share a [[wikilink]].

Usage:
    python3 build.py [NOTES_DIR]

If NOTES_DIR is omitted it defaults to ./notes. If that folder does not exist
(or is empty) 25 realistic sample notes about a small business are generated
into it first, so the whole thing is runnable out of the box.
"""

import os
import re
import sys
import json

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_NOTES = os.path.join(HERE, "notes")
OUT = os.path.join(HERE, "viewer", "graph-data.js")

EXCERPT_LEN = 700

WIKILINK_RE = re.compile(r"\[\[([^\]]+)\]\]")
WORD_RE = re.compile(r"[A-Za-z0-9']+")


# --------------------------------------------------------------------------- #
#  Sample notes — a small specialty-coffee business, "Nimbus Coffee Roasters"
# --------------------------------------------------------------------------- #
SAMPLE_NOTES = {
    "business/Company Overview.md": """# Company Overview

Nimbus Coffee Roasters is a specialty micro-roastery founded in 2021. We source
green beans from a small set of trusted growers and roast in small batches for
local cafes and a growing direct-to-consumer subscription.

Our north star is the [[Mission Statement]]. Day-to-day we live by the
[[Brand Guidelines]] and the numbers in the [[Monthly P&L]]. The two products
that pay the bills are our [[Signature Blend]] and the [[Single Origin Ethiopia]].
""",
    "business/Mission Statement.md": """# Mission Statement

Make exceptional coffee accessible without pretense. Pay growers fairly, roast
transparently, and treat every customer like a regular.

This mission drives the [[Brand Guidelines]], the [[Subscription Program]], and
how we run the [[Downtown Cafe]]. When a decision is hard, we ask: does it serve
the grower and the drinker at the same time?
""",
    "business/Brand Guidelines.md": """# Brand Guidelines

Voice: warm, plainspoken, a little nerdy about coffee. Never snobby.

Palette: cloud white, storm grey, and a single amber accent. Logo is the Nimbus
cloud mark, always with clear space around it.

These guidelines apply everywhere: the [[Website Redesign]], the
[[Instagram Strategy]], packaging for the [[Signature Blend]], and signage in
the [[Downtown Cafe]]. See also the [[Mission Statement]].
""",
    "products/Signature Blend.md": """# Signature Blend

Our flagship: a comfort-first blend of washed Colombian and natural Brazilian.
Chocolate, toasted almond, a soft red-fruit finish. Roasted medium.

It is the default in the [[Subscription Program]] and the house espresso at the
[[Downtown Cafe]]. Beans come from [[Supplier - Colombia FNC]] and
[[Supplier - Brazil Fazenda]]. Pricing lives in the [[Wholesale Price List]].
""",
    "products/Single Origin Ethiopia.md": """# Single Origin Ethiopia

Yirgacheffe, washed, light roast. Jasmine, bergamot, stone fruit. Our most
reviewed coffee and the one baristas geek out over.

Green comes from [[Supplier - Ethiopia Co-op]]. It rotates through the
[[Subscription Program]] as the monthly feature and anchors most
[[Cupping Notes]] sessions. Retail pricing is in the [[Wholesale Price List]].
""",
    "products/Decaf Swiss Water.md": """# Decaf Swiss Water

A genuinely good decaf, processed with the chemical-free Swiss Water method.
Cocoa and dried cherry. Surprises people who think decaf is a compromise.

Small but loyal demand, mostly through the [[Subscription Program]] and evening
sales at the [[Downtown Cafe]]. Sourced via [[Supplier - Colombia FNC]].
""",
    "products/Cold Brew Concentrate.md": """# Cold Brew Concentrate

Steeped 18 hours, bottled as a 1:3 concentrate. Our summer cash cow. Built on
the [[Signature Blend]] base so we can produce it without new green inventory.

Sold refrigerated at the [[Downtown Cafe]] and through select
[[Wholesale Accounts]]. Margins are tracked in the [[Monthly P&L]].
""",
    "suppliers/Supplier - Colombia FNC.md": """# Supplier - Colombia FNC

Our Colombian green partner. Reliable, well-documented traceability, consistent
cup quality. Backbone of the [[Signature Blend]] and the [[Decaf Swiss Water]].

Contracts renew each harvest; terms and landed cost feed the [[Wholesale Price List]]
and the [[Monthly P&L]]. Contact and shipping details in [[Supplier Contacts]].
""",
    "suppliers/Supplier - Brazil Fazenda.md": """# Supplier - Brazil Fazenda

Family farm supplying our natural Brazilian component. Sweet, nutty, low acidity —
the ballast in the [[Signature Blend]].

Prone to frost-driven price swings, which is our biggest [[Green Coffee Risk]].
Details in [[Supplier Contacts]].
""",
    "suppliers/Supplier - Ethiopia Co-op.md": """# Supplier - Ethiopia Co-op

Washing-station co-op behind the [[Single Origin Ethiopia]]. Limited volume,
exceptional quality, direct-trade relationship we protect.

Lead times are long; we pre-book against forecasts in the [[Inventory Plan]].
See [[Supplier Contacts]] and [[Green Coffee Risk]].
""",
    "suppliers/Supplier Contacts.md": """# Supplier Contacts

Rolling contact sheet for every green partner: [[Supplier - Colombia FNC]],
[[Supplier - Brazil Fazenda]], and [[Supplier - Ethiopia Co-op]].

Names, importers, payment terms, and shipping windows. Feeds the [[Inventory Plan]]
and is referenced whenever we reassess [[Green Coffee Risk]].
""",
    "operations/Roasting Schedule.md": """# Roasting Schedule

We roast Tuesday and Friday mornings. Tuesday is production for the
[[Subscription Program]] and [[Wholesale Accounts]]; Friday is cafe stock and
experiments.

Batch sizes come from the [[Inventory Plan]]. Every roast is logged for the
[[Cupping Notes]] file so we can chase consistency on the [[Signature Blend]].
""",
    "operations/Inventory Plan.md": """# Inventory Plan

Rolling 12-week green inventory forecast. Balances lead times from
[[Supplier Contacts]] against demand from the [[Subscription Program]] and
[[Wholesale Accounts]].

Under-buying starves the [[Roasting Schedule]]; over-buying ages green and hurts
the [[Monthly P&L]]. The central lever against [[Green Coffee Risk]].
""",
    "operations/Cupping Notes.md": """# Cupping Notes

Weekly blind cupping log. We score every production roast and every sample from
[[Supplier Contacts]] before we commit.

Keeps the [[Signature Blend]] and [[Single Origin Ethiopia]] on spec, and is
where new subscription features for the [[Subscription Program]] are chosen.
""",
    "operations/Green Coffee Risk.md": """# Green Coffee Risk

Our top operational risk: volatile green prices and thin supply on specialty
lots. Brazil frost and Ethiopia logistics are the usual culprits — see
[[Supplier - Brazil Fazenda]] and [[Supplier - Ethiopia Co-op]].

Mitigations: forward-booking in the [[Inventory Plan]], diversified sourcing via
[[Supplier Contacts]], and pricing headroom in the [[Wholesale Price List]].
""",
    "operations/Downtown Cafe.md": """# Downtown Cafe

Our single retail location and best marketing asset. Serves the
[[Signature Blend]] as house espresso, features the [[Single Origin Ethiopia]]
on pour-over, and sells [[Cold Brew Concentrate]] all summer.

Staffed per the [[Hiring Plan]]. Foot traffic feeds the [[Subscription Program]]
and every [[Instagram Strategy]] photo we shoot.
""",
    "marketing/Subscription Program.md": """# Subscription Program

Direct-to-consumer coffee subscription: weekly, biweekly, or monthly bags.
Default is the [[Signature Blend]] with a rotating feature, usually the
[[Single Origin Ethiopia]] or [[Decaf Swiss Water]].

Our highest-margin channel — see the [[Monthly P&L]]. Growth comes from the
[[Instagram Strategy]] and the [[Website Redesign]]. Retention is the KPI in
[[Q3 Goals]].
""",
    "marketing/Instagram Strategy.md": """# Instagram Strategy

Behind-the-roaster content, latte art from the [[Downtown Cafe]], and origin
stories from [[Supplier Contacts]]. Three posts a week, on-voice per the
[[Brand Guidelines]].

Primary top-of-funnel for the [[Subscription Program]]. Performance rolls up into
[[Q3 Goals]].
""",
    "marketing/Website Redesign.md": """# Website Redesign

Rebuild the storefront around the [[Subscription Program]] with a faster
checkout. Must follow the [[Brand Guidelines]] and surface [[Cupping Notes]] as
trust content.

Biggest planned spend this quarter — tracked against the [[Marketing Budget]]
and a milestone in [[Q3 Goals]].
""",
    "marketing/Wholesale Accounts.md": """# Wholesale Accounts

Cafes and offices that buy our beans by the case: [[Signature Blend]] mostly,
plus [[Cold Brew Concentrate]] in summer. Priced from the [[Wholesale Price List]].

Steady, lower-margin revenue that stabilizes the [[Roasting Schedule]] and the
[[Monthly P&L]]. Expansion is a [[Q3 Goals]] target.
""",
    "finance/Monthly P&L.md": """# Monthly P&L

The single source of truth for money in and out. Revenue splits across the
[[Subscription Program]], [[Wholesale Accounts]], and the [[Downtown Cafe]].

Largest cost is green coffee (see [[Green Coffee Risk]]), followed by labor from
the [[Hiring Plan]]. Feeds every decision in [[Q3 Goals]].
""",
    "finance/Wholesale Price List.md": """# Wholesale Price List

Per-pound and per-case pricing for [[Wholesale Accounts]]. Built from landed
green cost in [[Supplier Contacts]] plus roast, packaging, and target margin.

Covers the [[Signature Blend]], [[Single Origin Ethiopia]], and
[[Cold Brew Concentrate]]. Reviewed whenever [[Green Coffee Risk]] flares.
""",
    "finance/Marketing Budget.md": """# Marketing Budget

Quarterly marketing allocation. The two big line items are the
[[Website Redesign]] and paid amplification of the [[Instagram Strategy]].

Sized as a percentage of subscription revenue in the [[Monthly P&L]] and
justified against targets in [[Q3 Goals]].
""",
    "people/Hiring Plan.md": """# Hiring Plan

Staffing for the [[Downtown Cafe]] and one part-time roaster's assistant to
protect the [[Roasting Schedule]]. Hire against demand in the [[Inventory Plan]].

Payroll is a major line in the [[Monthly P&L]]; headcount timing is a
[[Q3 Goals]] decision.
""",
    "planning/Q3 Goals.md": """# Q3 Goals

1. Grow the [[Subscription Program]] to 500 active bags/week.
2. Ship the [[Website Redesign]] on the [[Marketing Budget]].
3. Add three [[Wholesale Accounts]].
4. Hold gross margin in the [[Monthly P&L]] despite [[Green Coffee Risk]].

Everything ties back to the [[Mission Statement]].
""",
}


def generate_sample_notes(notes_dir):
    print("No notes found — generating 25 sample notes about a small business...")
    for rel, body in SAMPLE_NOTES.items():
        dest = os.path.join(notes_dir, rel)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        with open(dest, "w", encoding="utf-8") as fh:
            fh.write(body)
    print(f"  wrote {len(SAMPLE_NOTES)} notes into {notes_dir}")


def title_from_filename(path):
    base = os.path.splitext(os.path.basename(path))[0]
    return base.strip()


def strip_markdown(text):
    # Collapse headings/markup into readable plain text for the excerpt.
    text = re.sub(r"`{1,3}", "", text)
    text = re.sub(r"^#{1,6}\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"[*_>]", "", text)
    text = WIKILINK_RE.sub(lambda m: m.group(1), text)
    text = re.sub(r"\s+\n", "\n", text)
    text = re.sub(r"\n{2,}", "\n\n", text)
    return text.strip()


def collect_notes(notes_dir):
    notes = []
    for root, _dirs, files in os.walk(notes_dir):
        for name in sorted(files):
            if not name.lower().endswith(".md"):
                continue
            full = os.path.join(root, name)
            rel = os.path.relpath(full, notes_dir)
            with open(full, "r", encoding="utf-8", errors="ignore") as fh:
                raw = fh.read()
            group = os.path.dirname(rel).split(os.sep)[0] if os.path.dirname(rel) else "root"
            notes.append({
                "path": rel.replace(os.sep, "/"),
                "title": title_from_filename(full),
                "group": group,
                "raw": raw,
            })
    # Sort for a stable, index-based id (features depend on node index).
    notes.sort(key=lambda n: (n["group"], n["title"].lower()))
    return notes


def build_nodes(notes):
    nodes = []
    for i, n in enumerate(notes):
        excerpt = strip_markdown(n["raw"])
        if len(excerpt) > EXCERPT_LEN:
            excerpt = excerpt[:EXCERPT_LEN].rsplit(" ", 1)[0] + "…"
        nodes.append({
            "id": i,                       # numeric id == index in the array
            "label": n["title"],
            "group": n["group"],
            "excerpt": excerpt,
            "path": n["path"],
        })
    return nodes


def build_links(notes):
    # Map lowercase title -> index for fast mention lookups.
    title_to_idx = {n["title"].lower(): i for i, n in enumerate(notes)}
    # Collect wikilink targets per note.
    wikilinks = []
    for n in notes:
        targets = {t.strip().lower() for t in WIKILINK_RE.findall(n["raw"])}
        wikilinks.append(targets)

    seen = set()
    links = []

    def add(a, b):
        if a == b:
            return
        key = (min(a, b), max(a, b))
        if key in seen:
            return
        seen.add(key)
        links.append({"source": a, "target": b})

    for i, n in enumerate(notes):
        # 1) Explicit wikilinks to another note's title.
        for target in wikilinks[i]:
            j = title_to_idx.get(target)
            if j is not None:
                add(i, j)
        # 2) Plain-text mention of another note's title.
        lowered = " " + n["raw"].lower() + " "
        for title, j in title_to_idx.items():
            if j == i or len(title) < 4:
                continue
            if title in lowered:
                add(i, j)
        # 3) Shared wikilinks between two notes (require 2+ in common so the
        #    galaxy keeps real structure instead of collapsing into a hairball).
        for j in range(i + 1, len(notes)):
            if len(wikilinks[i] & wikilinks[j]) >= 2:
                add(i, j)

    return links


def main():
    notes_dir = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_NOTES

    has_md = os.path.isdir(notes_dir) and any(
        f.lower().endswith(".md")
        for _r, _d, fs in os.walk(notes_dir)
        for f in fs
    )
    if not has_md:
        os.makedirs(notes_dir, exist_ok=True)
        generate_sample_notes(notes_dir)

    notes = collect_notes(notes_dir)
    if not notes:
        print("No markdown notes found. Nothing to build.")
        sys.exit(1)

    nodes = build_nodes(notes)
    links = build_links(notes)

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    payload = {"nodes": nodes, "links": links}
    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write("// Generated by build.py — do not edit by hand.\n")
        fh.write("const GRAPH = ")
        json.dump(payload, fh, ensure_ascii=False, indent=2)
        fh.write(";\n")
        # Record where the notes live so the server can find them.
        fh.write(f"const NOTES_DIR = {json.dumps(notes_dir)};\n")

    print(f"Built galaxy: {len(nodes)} nodes, {len(links)} links")
    print(f"  -> {OUT}")
    # Persist the notes dir for the server (config-adjacent, never served).
    meta_path = os.path.join(HERE, ".notes-dir")
    with open(meta_path, "w", encoding="utf-8") as fh:
        fh.write(notes_dir)


if __name__ == "__main__":
    main()
