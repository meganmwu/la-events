import html
import re

from categories import category_from_cap
from genres import tag_genres
from util import fetch_text, strip_tags

BASE = "https://cap.ucla.edu"


def _fetch_description(url):
    """Event pages carry a real description in their og:description meta tag."""
    try:
        page = fetch_text(url, delay=0.3)
    except Exception:  # noqa: BLE001
        return ""
    m = re.search(r'<meta property="og:description" content="([^"]*)"', page)
    return html.unescape(m.group(1)).strip() if m else ""

ROW_RE = re.compile(r'<a href="(/event/[^"]+)"\s+class="views-row plain">(.*?)</a>', re.S)
FIELD_RE = re.compile(
    r'views-field-field-event-(\w+)"><div class="field-content">(.*?)</div></div>', re.S
)


def scrape():
    """The /calendar page renders every upcoming event as a views-row card."""
    page = fetch_text(f"{BASE}/calendar")
    events = []
    for path, body in ROW_RE.findall(page):
        fields = dict(FIELD_RE.findall(body))

        # <time datetime="2026-12-05T20:00:00Z">Sat, Dec 5</time> | 8 pm
        # The datetime attr is local wall-clock time mislabeled as Z.
        time_m = re.search(r'datetime="([\d-]+)T(\d{2}:\d{2})', fields.get("date", ""))
        if not time_m:
            continue
        date, time = time_m.groups()

        artist = strip_tags(fields.get("artist", ""))
        title = strip_tags(fields.get("title", ""))
        genres = [
            html.unescape(g).strip()
            for g in re.findall(r">([^<>]+)<", fields.get("genre", ""))
            if g.strip()
        ]
        event_type = strip_tags(fields.get("type", ""))
        img_m = re.search(r'src="([^"]+)"', fields.get("image", ""))
        full_title = " — ".join(x for x in [artist, title] if x)

        category = category_from_cap(event_type, genres)
        events.append(
            {
                "source": "capucla",
                "sourceLabel": "CAP UCLA",
                "org": "UCLA",
                "title": full_title or artist or title,
                "artists": [artist] if artist else [],
                "url": BASE + path,
                "ticketUrl": None,
                "imageUrl": BASE + html.unescape(img_m.group(1)) if img_m else None,
                "date": date,
                "time": time,
                "venue": strip_tags(fields.get("venue", "")) or None,
                "address": None,
                # Teasers don't carry price; most CAP shows are ticketed.
                "isFree": None,
                "priceText": "",
                "category": category,
                "subcategory": event_type or None,
                "genres": tag_genres(
                    native_tags=genres, text=f"{full_title} {' '.join(genres)}"
                )
                if category == "music"
                else [],
                "description": event_type,
                "soldOut": False,
            }
        )

    for ev in events:
        desc = _fetch_description(ev["url"])
        if desc:
            ev["description"] = desc
    return events
