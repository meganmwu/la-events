import json
import re

from genres import tag_genres
from util import fetch_text

# "LA Fun Events" maintains a Linktree of their upcoming events; each link goes
# to an event-details page on their Wix site that embeds a schema.org Event.

LINKTREE_URL = "https://linktr.ee/losangelesfunevents"
EVENT_URL_RE = re.compile(r"losangelesfunevents\.com/event-details/", re.I)

CATEGORY_KEYWORDS = [
    ("business", r"networking|network night|industry"),
    ("music", r"karaoke|musician|open mic|country night|reggae|concert"),
    ("community", r"volunteer|book club|meetup"),
]

SUBCATEGORY_KEYWORDS = [
    ("Speed Dating", r"speed dating"),
    ("Karaoke", r"karaoke"),
    ("Networking", r"networking|network night"),
    ("Singles Mixer", r"singles|mixer"),
    ("Party", r"party"),
]


def _category(text):
    for bucket, pattern in CATEGORY_KEYWORDS:
        if re.search(pattern, text, re.I):
            return bucket
    return "nightlife"  # singles mixers, speed dating, parties


def _subcategory(text):
    for label, pattern in SUBCATEGORY_KEYWORDS:
        if re.search(pattern, text, re.I):
            return label
    return None


def _price_info(offers):
    if not offers:
        return None, ""
    low = offers.get("lowPrice") or offers.get("price")
    high = offers.get("highPrice")
    try:
        low_val = float(low)
    except (TypeError, ValueError):
        return None, ""
    if low_val == 0:
        return True, "Free"
    text = f"${low_val:g}"
    try:
        if high is not None and float(high) != low_val:
            text = f"${low_val:g}–${float(high):g}"
    except (TypeError, ValueError):
        pass
    return False, text


def scrape():
    page = fetch_text(LINKTREE_URL)
    m = re.search(
        r'<script id="__NEXT_DATA__" type="application/json"[^>]*>(.*?)</script>', page, re.S
    )
    if not m:
        raise RuntimeError("Linktree __NEXT_DATA__ not found")
    links = json.loads(m.group(1))["props"]["pageProps"].get("links", [])

    urls = []
    for link in links:
        url = (link.get("url") or "").strip()
        if EVENT_URL_RE.search(url) and url not in urls:
            urls.append(url)

    events = []
    seen = set()
    for url in urls:
        try:
            html = fetch_text(url)
        except Exception as err:  # noqa: BLE001
            print(f"  lafunevents {url} failed: {err}")
            continue
        for block in re.findall(
            r'<script type="application/ld\+json">(.*?)</script>', html, re.S
        ):
            try:
                ld = json.loads(block)
            except ValueError:
                continue
            if ld.get("@type") != "Event" or not ld.get("startDate"):
                continue
            start = ld["startDate"]
            key = (ld.get("name"), start[:10])
            if key in seen:
                continue
            seen.add(key)

            location = ld.get("location") or {}
            text = f"{ld.get('name', '')} {ld.get('description', '')}"
            is_free, price_text = _price_info(ld.get("offers") or {})
            category = _category(text)
            events.append(
                {
                    "source": "lafunevents",
                    "sourceLabel": "LA Fun Events",
                    "org": None,
                    "title": ld.get("name", "").strip(),
                    "artists": [],
                    "url": url,
                    "ticketUrl": url,
                    "imageUrl": ld.get("image"),
                    "date": start[:10],
                    "time": start[11:16] if "T" in start else None,
                    "venue": location.get("name"),
                    "address": location.get("address")
                    if isinstance(location.get("address"), str)
                    else None,
                    "isFree": is_free,
                    "priceText": price_text,
                    "category": category,
                    "subcategory": _subcategory(text),
                    "genres": tag_genres(text=text) if category == "music" else [],
                    "description": (ld.get("description") or "").strip(),
                    "soldOut": False,
                }
            )
    return events
