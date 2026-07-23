import json
import re
import time
import urllib.error

from categories import EVENTBRITE_FORMAT_LABELS, category_from_eventbrite_tags
from genres import tag_genres
from util import fetch_text, strip_tags

# Eventbrite search pages embed the full result set as JSON in
# window.__SERVER_DATA__. We paginate with ?page=N, and detect free events by
# also walking the free-filtered version of the same search.

# The bare /events/ browse feed often serves an empty shell to scripts, so we
# supplement it with keyword searches (which render reliably) for LA-wide reach.
DEFAULT_SEARCHES = [
    "https://www.eventbrite.com/d/ca--los-angeles/events/",
    "https://www.eventbrite.com/d/ca--los-angeles/usc/",
    "https://www.eventbrite.com/d/ca--los-angeles/concerts/",
    "https://www.eventbrite.com/d/ca--los-angeles/comedy/",
    "https://www.eventbrite.com/d/ca--los-angeles/art/",
    "https://www.eventbrite.com/d/ca--los-angeles/market/",
    "https://www.eventbrite.com/d/ca--los-angeles/workshop/",
    "https://www.eventbrite.com/d/ca--los-angeles/community/",
]

# Every Eventbrite event is checked against these — affiliation comes from the
# event's own text, not from which search returned it.
ORG_PATTERNS = {
    "USC": r"\busc\b|university of southern california|trojan",
    "UCLA": r"\bucla\b|university of california, los angeles|bruin",
}


def _extract_server_data(page):
    marker = page.find("__SERVER_DATA__")
    if marker == -1:
        return None
    start = page.index("{", marker)
    data, _ = json.JSONDecoder().raw_decode(page[start:])
    return data


# Eventbrite rate-limits bursts with HTTP 429. When that happens, pause the
# whole scrape and retry — up to a few escalating waits per run, after which
# remaining requests are allowed to fail (run.py keeps previous data).
_MAX_BACKOFFS = 4
_backoffs_used = 0


def _fetch(url):
    global _backoffs_used
    while True:
        try:
            return fetch_text(url, delay=1.2)
        except urllib.error.HTTPError as err:
            if err.code != 429 or _backoffs_used >= _MAX_BACKOFFS:
                raise
            _backoffs_used += 1
            wait = 120 * _backoffs_used
            print(
                f"\n  eventbrite rate-limited — pausing {wait // 60} min "
                f"(backoff {_backoffs_used}/{_MAX_BACKOFFS})",
                flush=True,
            )
            time.sleep(wait)


def _find_events_container(data):
    """Keyword-search pages and category/browse pages nest results differently."""
    data = data or {}
    event_data = data.get("event_data") or {}
    for container in (
        data.get("search_data", {}).get("events"),
        event_data.get("active_search", {}).get("events"),
        event_data.get("category_search", {}).get("events"),
    ):
        if container and container.get("results"):
            return container
    return {}


def _collect_search(base_url, max_pages):
    results = []
    for page_num in range(1, max_pages + 1):
        url = f"{base_url}?page={page_num}"
        try:
            data = _extract_server_data(_fetch(url))
        except Exception as err:  # noqa: BLE001
            print(f"  eventbrite {url} failed: {err}")
            break
        search = _find_events_container(data)
        page_results = search.get("results") or []
        if not page_results:
            break
        results.extend(page_results)
        pagination = search.get("pagination") or {}
        page_count = pagination.get("page_count")
        if not page_count and pagination.get("object_count") and pagination.get("page_size"):
            page_count = -(-pagination["object_count"] // pagination["page_size"])
        if page_num >= (page_count or 1):
            break
    return results


def scrape(searches=None, max_pages=6):
    events = []
    seen = set()

    for url in searches or DEFAULT_SEARCHES:
        all_results = _collect_search(url, max_pages)

        # Same search with the free filter → set of free event ids.
        free_url = re.sub(r"/d/([^/]+)/", r"/d/\1/free--", url, count=1)
        free_ids = {e.get("id") for e in _collect_search(free_url, max_pages)}

        for ev in all_results:
            eid = ev.get("id")
            if not eid or eid in seen or ev.get("is_cancelled") or ev.get("is_online_event"):
                continue
            seen.add(eid)

            tags = ev.get("tags") or []
            category = category_from_eventbrite_tags(tags)
            text = " ".join(
                [
                    ev.get("name") or "",
                    ev.get("summary") or "",
                    " ".join(t.get("display_name") or "" for t in tags),
                ]
            )

            org = None
            for name, pattern in ORG_PATTERNS.items():
                if re.search(pattern, text, re.I):
                    org = name
                    break

            native_genres = [
                t.get("display_name")
                for t in tags
                if (t.get("prefix") or "").startswith("EventbriteSubCategory")
            ]

            subcategory = None
            for t in tags:
                if (t.get("prefix") or "").startswith("EventbriteFormat"):
                    subcategory = EVENTBRITE_FORMAT_LABELS.get(
                        (t.get("display_name") or "").lower()
                    )
                    if subcategory:
                        break

            start_time = ev.get("start_time")
            venue = ev.get("primary_venue") or {}
            events.append(
                {
                    "source": "eventbrite",
                    "sourceLabel": "Eventbrite",
                    "org": org,
                    "title": strip_tags(ev.get("name") or ""),
                    "artists": [],
                    "url": ev.get("url"),
                    "ticketUrl": ev.get("tickets_url") or ev.get("url"),
                    "imageUrl": ((ev.get("image") or {}).get("image_sizes") or {}).get("medium")
                    or (ev.get("image") or {}).get("url"),
                    "date": ev.get("start_date"),
                    "time": start_time if start_time and start_time != "00:00" else None,
                    "venue": venue.get("name"),
                    "address": (venue.get("address") or {}).get("localized_address_display"),
                    "isFree": (eid in free_ids) if free_ids else None,
                    "priceText": "Free" if eid in free_ids else "",
                    "category": category,
                    "subcategory": subcategory,
                    "genres": tag_genres(native_tags=native_genres, text=text)
                    if category in ("music", "nightlife")
                    else [],
                    "description": strip_tags(ev.get("summary") or ""),
                    "soldOut": False,
                }
            )
    return events
