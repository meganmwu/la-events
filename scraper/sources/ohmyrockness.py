import re

from genres import tag_genres
from util import fetch_json

BASE = "https://losangeles.ohmyrockness.com"
# Public token embedded in the site's own JS bundle; it's what the site itself
# uses for read-only browsing.
TOKEN = "3b35f8a73dabd5f14b1cac167a14c1f6"


def _parse_price(price):
    p = (price or "").strip()
    if not p:
        return None, ""
    if re.search(r"free|\$0(\.00)?\b", p, re.I):
        return True, "Free"
    return False, p if p.startswith("$") else f"${p}"


def scrape(max_pages=6):
    events = []
    for page in range(1, max_pages + 1):
        url = f"{BASE}/api/shows.json?index=true&page={page}&per=50&regioned=3"
        try:
            shows = fetch_json(url, headers={"Authorization": f'Token token="{TOKEN}"'})
        except Exception as err:  # noqa: BLE001
            print(f"  ohmyrockness page {page} failed: {err}")
            break
        if not isinstance(shows, list) or not shows:
            break

        for show in shows:
            bands = [b["name"] for b in show.get("cached_bands") or []]
            venue = show.get("venue") or {}
            title = " + ".join(bands) if bands else f"Show at {venue.get('name', 'TBA')}"
            start = show.get("starts_at")
            if not start:
                continue
            is_free, price_text = _parse_price(show.get("price") or show.get("price_abbr"))
            notes = " · ".join(
                x for x in [show.get("age"), "Sold out" if show.get("sold_out") else None] if x
            )
            events.append(
                {
                    "source": "ohmyrockness",
                    "sourceLabel": "Oh My Rockness",
                    "org": None,
                    "title": title,
                    "artists": bands,
                    "url": show.get("url") or BASE,
                    "ticketUrl": show.get("tickets_url"),
                    "imageUrl": None,
                    "date": start[:10],
                    "time": start[11:16],
                    "venue": venue.get("name"),
                    "address": (venue.get("full_address") or "").replace("\n", ", ") or None,
                    "isFree": is_free,
                    "priceText": price_text,
                    "category": "music",
                    "subcategory": None,
                    "genres": tag_genres(text=title, fallback="Indie / Alt"),
                    "description": notes,
                    "soldOut": bool(show.get("sold_out")),
                }
            )
        if len(shows) < 50:
            break
    return events
