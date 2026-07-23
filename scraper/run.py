#!/usr/bin/env python3
"""Scrape all sources and write web/data/events.json for the frontend."""

import json
import sys
from datetime import date, datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from categories import CATEGORIES, PERFORMANCE_CATEGORIES
from sources import capucla, eventbrite, lafunevents, ohmyrockness
from util import dedupe_key

ROOT = Path(__file__).parent.parent
OUT = ROOT / "web" / "data" / "events.json"

# When the same event shows up in multiple sources, keep the more canonical one.
SOURCE_PRIORITY = {"capucla": 0, "ohmyrockness": 1, "lafunevents": 2, "eventbrite": 3}


def run_source(name, fn):
    print(f"Scraping {name}... ", end="", flush=True)
    try:
        events = fn()
        print(f"{len(events)} events")
        return events
    except Exception as err:  # noqa: BLE001 — one source failing shouldn't kill the run
        print(f"FAILED: {err}")
        return []


def trim(text, limit=110):
    """Cut at a word boundary with an ellipsis."""
    text = " ".join((text or "").split())
    if len(text) <= limit:
        return text
    cut = text[:limit].rsplit(" ", 1)[0].rstrip(",;:.")
    return f"{cut}…"


def make_short_desc(ev):
    """A consistent one-liner for the card: what/where + which site listed it."""
    source = ev["sourceLabel"]
    venue = ev.get("venue")

    if ev["source"] == "ohmyrockness":
        genre = (ev.get("genres") or ["Indie / Alt"])[0]
        age = ev.get("description") or ""
        age_part = f" · {age}" if age and "Sold out" not in age else ""
        where = f" at {venue}" if venue else ""
        return f"{genre} show{where}{age_part} — via {source}"

    desc = trim(ev.get("description") or "")
    if desc and desc.lower() != (ev.get("subcategory") or "").lower():
        return f"{desc} — via {source}"

    what = ev.get("subcategory") or CATEGORIES.get(ev["category"], "Event")
    where = f" at {venue}" if venue else ""
    return f"{what}{where} — via {source}"


def load_previous():
    """Events from the last successful run, grouped by source."""
    if not OUT.exists():
        return {}
    try:
        previous = json.loads(OUT.read_text()).get("events", [])
    except ValueError:
        return {}
    by_source = {}
    for ev in previous:
        by_source.setdefault(ev.get("source"), []).append(ev)
    return by_source


def main():
    all_events = (
        run_source("CAP UCLA", capucla.scrape)
        + run_source("Oh My Rockness", ohmyrockness.scrape)
        + run_source("LA Fun Events", lafunevents.scrape)
        + run_source("Eventbrite", eventbrite.scrape)
    )

    # If a source failed or came back empty (e.g. rate-limited), keep its
    # events from the previous run rather than dropping them from the site.
    previous = load_previous()
    scraped_sources = {e["source"] for e in all_events}
    for source, old_events in previous.items():
        if source not in scraped_sources:
            print(f"Keeping {len(old_events)} previous events for '{source}' (scrape came back empty)")
            all_events += old_events

    today = date.today().isoformat()
    upcoming = [
        e
        for e in all_events
        if e.get("date") and e["date"] >= today and e["category"] in PERFORMANCE_CATEGORIES
    ]

    by_key = {}
    for ev in upcoming:
        key = dedupe_key(ev["title"], ev["date"])
        existing = by_key.get(key)
        if existing is None or SOURCE_PRIORITY[ev["source"]] < SOURCE_PRIORITY[existing["source"]]:
            by_key[key] = ev

    events = sorted(by_key.values(), key=lambda e: (e["date"], e.get("time") or "99"))
    for i, ev in enumerate(events):
        ev["id"] = i + 1
        ev["shortDesc"] = make_short_desc(ev)

    counts = {}
    for ev in events:
        counts[ev["source"]] = counts.get(ev["source"], 0) + 1

    payload = json.dumps(
        {
            "scrapedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "categories": {k: v for k, v in CATEGORIES.items() if k in PERFORMANCE_CATEGORIES},
            "counts": counts,
            "events": events,
        },
        indent=1,
        ensure_ascii=False,
    )
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(payload)
    # Plain-JS copy so index.html also works opened directly from disk (file://),
    # where browsers block fetch() and module scripts.
    (OUT.parent / "events.js").write_text(f"window.EVENTS_DATA = {payload};\n")
    merged = len(upcoming) - len(events)
    print(f"\nWrote {len(events)} upcoming events ({merged} duplicates merged) → {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
