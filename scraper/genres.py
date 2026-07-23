"""Music-genre tagging.

Sources rarely provide clean genre data, so we combine native tags (CAP UCLA
genres, Eventbrite subcategories) with keyword matching over title/artists/
description.
"""

import re

KEYWORD_GENRES = [
    ("Jazz", r"\bjazz\b|\bbebop\b|\bswing band\b"),
    (
        "Classical",
        r"\bclassical\b|\bsymphony\b|\borchestra\b|\bchamber music\b"
        r"|\bstring quartet\b|\bphilharmonic\b|\bopera\b|\bpiano recital\b",
    ),
    (
        "Electronic",
        r"\belectronic\b|\bedm\b|\btechno\b|\bhouse music\b|\bdnb\b"
        r"|\bdrum\s*(&|and)\s*bass\b|\brave\b|\bdj set\b|\bdj night\b",
    ),
    ("Hip-Hop / R&B", r"\bhip.?hop\b|\brap\b|\br&b\b|\brnb\b|\bneo.?soul\b"),
    ("Punk / Hardcore", r"\bpunk\b|\bhardcore\b|\bemo\b|\bska\b"),
    ("Metal", r"\bmetal\b|\bdoom\b|\bsludge\b|\bgrindcore\b"),
    (
        "Folk / Country",
        r"\bfolk\b|\bamericana\b|\bbluegrass\b|\bcountry\b|\bsinger.?songwriter\b|\bacoustic\b",
    ),
    ("Latin", r"\blatin\b|\breggaeton\b|\bcumbia\b|\bsalsa\b|\bbanda\b|\bmariachi\b|\bcorridos?\b"),
    (
        "Indie / Alt",
        r"\bindie\b|\bshoegaze\b|\bdream pop\b|\bpost.?punk\b|\blo.?fi\b|\balt.?rock\b|\bgarage rock\b",
    ),
    ("Rock", r"\brock\b(?! climbing)|\bpsych\b|\bgrunge\b"),
    ("Pop", r"\bpop\b(?!-up)"),
    ("Soul / Funk", r"\bsoul\b|\bfunk\b|\bdisco\b|\bmotown\b"),
    ("Experimental", r"\bexperimental\b|\bavant.?garde\b|\bnoise\b|\bambient\b|\bimprovis"),
    ("World", r"\bworld music\b|\bafrobeat\b|\bcarnatic\b|\bflamenco\b|\bklezmer\b"),
    ("Reggae", r"\breggae\b|\bdub\b|\bdancehall\b"),
]

# Native tags → canonical genre names. None means "recognized but too generic
# to filter on" (dropped).
NATIVE_GENRE_MAP = {
    "general music": None,
    "contemporary classical": "Classical",
    "classical": "Classical",
    "jazz": "Jazz",
    "blues & jazz": "Jazz",
    "global music": "World",
    "world": "World",
    "edm / electronic": "Electronic",
    "electronic": "Electronic",
    "hip hop / rap": "Hip-Hop / R&B",
    "r&b": "Hip-Hop / R&B",
    "latin": "Latin",
    "pop": "Pop",
    "rock": "Rock",
    "indie": "Indie / Alt",
    "alternative": "Indie / Alt",
    "folk": "Folk / Country",
    "country": "Folk / Country",
    "americana": "Folk / Country",
    "metal": "Metal",
    "punk / hardcore": "Punk / Hardcore",
    "punk": "Punk / Hardcore",
    "reggae": "Reggae",
    "experimental": "Experimental",
    "opera": "Classical",
}


def tag_genres(native_tags=(), text="", fallback=None):
    """Combine native tags + keyword hits, dedupe, cap at 3 for readable cards."""
    genres = []
    for tag in native_tags:
        mapped = NATIVE_GENRE_MAP.get((tag or "").strip().lower())
        if mapped and mapped not in genres:
            genres.append(mapped)
    for name, pattern in KEYWORD_GENRES:
        if name not in genres and re.search(pattern, text, re.I):
            genres.append(name)
    if not genres and fallback:
        genres.append(fallback)
    return genres[:3]
