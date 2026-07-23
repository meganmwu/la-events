# LA Local

One place to browse small shows & community events across Los Angeles, aggregated
from sources that each have their own site and UX. Events keep a clear label for
where they came from (and a USC / UCLA badge when they're affiliated), with a
link out to the original event page for details and tickets.

## Current sources

| Source | How it's scraped | Notes |
| --- | --- | --- |
| [Oh My Rockness LA](https://losangeles.ohmyrockness.com/) | JSON API (public token from their own JS bundle) | Indie/rock shows; price + sold-out status |
| [Eventbrite LA](https://www.eventbrite.com/d/ca--los-angeles/events/) | `__SERVER_DATA__` JSON embedded in browse + keyword-search pages | Free events detected via the free-filtered search; USC/UCLA badges applied when an event looks affiliated |
| [CAP UCLA](https://cap.ucla.edu/calendar) | Server-rendered calendar HTML | Native genre tags; always badged UCLA |
| [LA Fun Events](https://www.losangelesfunevents.com/) | Their [Linktree](https://linktr.ee/losangelesfunevents) → schema.org JSON-LD on each event page | Singles mixers, speed dating, networking |

## Running it

No dependencies beyond Python 3 (stdlib only).

```bash
# 1. Scrape all sources → web/data/events.json
python3 scraper/run.py

# 2. Serve the site
python3 scraper/serve.py           # http://localhost:4173
```

Re-run the scraper whenever you want fresh data.

## Features

- **Day / Week / All-upcoming views** with prev/next paging and a Today shortcut
- **Event-type filter** (Music, Nightlife, Arts & Theater, Film, Community, …) with live counts
- **Free-events-only toggle** and **full-text search**
- **Music genre chips** (Jazz, Classical, Electronic, Indie/Alt, …) — combined from
  native source tags and keyword matching, shown when Music is selected
- **Source badges** on every card, plus USC/UCLA org badges
- Cross-source **dedupe** (same title + date keeps the more canonical source)
- Light/dark theme via `prefers-color-scheme`, responsive layout

## Adding a source

1. Create `scraper/sources/<name>.py` exposing `scrape() -> list[dict]` that returns
   events in the shape the other sources use (see `ohmyrockness.py`).
2. Wire it into `scraper/run.py` (`run_source(...)` and `SOURCE_PRIORITY`).
3. Add its label to `SOURCE_INFO` in `web/app.js`.

## Notes

- Event data belongs to the source sites; the UI always links back to the
  original event page. The scraper is polite (sequential requests with delays).
- Categories and genre mappings live in `scraper/categories.py` and
  `scraper/genres.py`.
