import html
import json
import re
import time
import urllib.request

UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0 Safari/537.36"
)


def fetch_text(url, headers=None, delay=0.35, retries=1):
    """Polite fetch: browser UA, small delay between requests, one retry."""
    time.sleep(delay)
    last_err = None
    for attempt in range(retries + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, **(headers or {})})
            with urllib.request.urlopen(req, timeout=30) as res:
                return res.read().decode("utf-8", errors="replace")
        except Exception as err:  # noqa: BLE001 — retry any transport error once
            last_err = err
            if attempt < retries:
                time.sleep(1.5)
    raise last_err


def fetch_json(url, headers=None, **kw):
    text = fetch_text(url, headers={"Accept": "application/json", **(headers or {})}, **kw)
    return json.loads(text)


def strip_tags(fragment):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]*>", " ", fragment or ""))).strip()


def dedupe_key(title, date):
    """Key used to merge the same event listed by multiple sources."""
    words = re.sub(r"[^a-z0-9]+", " ", (title or "").lower()).split()[:8]
    return f"{date}|{' '.join(words)}"
