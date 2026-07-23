"""Canonical event-type buckets used by the frontend filter."""

import re

# B-Scene is performances only — events outside these buckets are dropped.
PERFORMANCE_CATEGORIES = ("music", "nightlife", "arts", "film")

CATEGORIES = {
    "music": "Music",
    "nightlife": "Nightlife & Parties",
    "arts": "Arts & Theater",
    "film": "Film",
    "community": "Community & Culture",
    "food": "Food & Drink",
    "talks": "Talks & Classes",
    "wellness": "Health & Wellness",
    "business": "Business & Networking",
    "sports": "Sports & Fitness",
    "other": "Other",
}

# Eventbrite category display_name → bucket.
EVENTBRITE_CATEGORY_MAP = {
    "music": "music",
    "performing & visual arts": "arts",
    "film, media & entertainment": "film",
    "community & culture": "community",
    "charity & causes": "community",
    "religion & spirituality": "community",
    "family & education": "community",
    "school activities": "community",
    "seasonal & holiday": "community",
    "food & drink": "food",
    "science & technology": "talks",
    "government & politics": "talks",
    "health & wellness": "wellness",
    "business & professional": "business",
    "sports & fitness": "sports",
    "travel & outdoor": "sports",
    "fashion & beauty": "other",
    "hobbies & special interest": "other",
    "auto, boat & air": "other",
    "home & lifestyle": "other",
}

# Eventbrite format display_name → short card tag ("subcategory").
EVENTBRITE_FORMAT_LABELS = {
    "party or social gathering": "Party",
    "class, training, or workshop": "Workshop",
    "seminar or talk": "Talk",
    "conference": "Conference",
    "meeting or networking event": "Networking",
    "concert or performance": "Concert",
    "screening": "Screening",
    "festival or fair": "Festival",
    "game or competition": "Competition",
    "race or endurance event": "Race",
    "tour": "Tour",
    "dinner or gala": "Dinner",
    "expo": "Expo",
    "rally": "Rally",
    "tournament": "Tournament",
    "attraction": "Attraction",
    "camp, trip, or retreat": "Retreat",
}

# Eventbrite format display_name → bucket, used when no category tag matched.
EVENTBRITE_FORMAT_MAP = {
    "party or social gathering": "nightlife",
    "class, training, or workshop": "talks",
    "seminar or talk": "talks",
    "conference": "business",
    "meeting or networking event": "business",
    "concert or performance": "music",
    "screening": "film",
    "festival or fair": "community",
    "game or competition": "sports",
    "race or endurance event": "sports",
    "tour": "community",
    "attraction": "community",
    "camp, trip, or retreat": "community",
    "dinner or gala": "food",
    "tournament": "sports",
    "expo": "business",
    "rally": "community",
}


def category_from_eventbrite_tags(tags):
    fmt = None
    for tag in tags:
        name = (tag.get("display_name") or "").lower()
        prefix = tag.get("prefix") or ""
        if prefix.startswith("EventbriteCategory") and name in EVENTBRITE_CATEGORY_MAP:
            bucket = EVENTBRITE_CATEGORY_MAP[name]
            if bucket != "other":
                return bucket
        if prefix.startswith("EventbriteFormat") and name in EVENTBRITE_FORMAT_MAP:
            fmt = EVENTBRITE_FORMAT_MAP[name]
    # Fall back to plain display-name matching (some payloads lack prefixes).
    for tag in tags:
        name = (tag.get("display_name") or "").lower()
        if name in EVENTBRITE_CATEGORY_MAP:
            bucket = EVENTBRITE_CATEGORY_MAP[name]
            if bucket != "other":
                return bucket
    return fmt or "other"


def category_from_cap(event_type, genres):
    """CAP UCLA event type + genres → bucket."""
    etype = (event_type or "").lower()
    g = " ".join(genres).lower()
    if "screening" in etype or re.search(r"\bfilm\b", g):
        return "film"
    if re.search(r"dance|theater|theatre|spoken word|performance art", g):
        return "arts"
    if re.search(r"music|classical|jazz|opera", g):
        return "music"
    if "talk" in etype or "conversation" in etype:
        return "talks"
    if "live performance" in etype:
        return "music"
    return "arts"
