#!/usr/bin/env python3
"""Generate fake LA show data for the "Demo" experience.

Deterministic (fixed seed) so re-running produces the same catalogue.
Writes web/data/demo-shows.js as `window.DEMO_SHOWS = {...}` — a plain script
so the page works over http:// and file:// alike.

Venue names/coordinates are real Los Angeles music rooms; artists, show
descriptions, prices and the pre-show meetup restaurants are invented.
"""

import json
import random
from datetime import date, timedelta
from pathlib import Path

OUT = Path(__file__).parent.parent / "web" / "data" / "demo-shows.js"
SEED = 20260905
DAYS = 21
START = date(2026, 8, 25)

# name, neighborhood, lat, lng, room size (intimate | midsize | large)
VENUES = [
    ("The Troubadour", "West Hollywood", 34.0817, -118.3891, "midsize"),
    ("The Roxy Theatre", "West Hollywood", 34.0906, -118.3866, "midsize"),
    ("Whisky a Go Go", "West Hollywood", 34.0905, -118.3855, "midsize"),
    ("Bar Lubitsch", "West Hollywood", 34.0900, -118.3560, "intimate"),
    ("The Echo", "Echo Park", 34.0781, -118.2606, "intimate"),
    ("Echoplex", "Echo Park", 34.0778, -118.2610, "midsize"),
    ("The Regent Theater", "Downtown LA", 34.0459, -118.2482, "midsize"),
    ("Teragram Ballroom", "Downtown LA", 34.0530, -118.2660, "midsize"),
    ("The Novo", "Downtown LA", 34.0446, -118.2673, "large"),
    ("Walt Disney Concert Hall", "Downtown LA", 34.0553, -118.2498, "large"),
    ("Resident", "Arts District", 34.0430, -118.2340, "intimate"),
    ("Moroccan Lounge", "Arts District", 34.0479, -118.2337, "intimate"),
    ("The Wiltern", "Koreatown", 34.0616, -118.3090, "large"),
    ("The Ebell Club", "Mid-Wilshire", 34.0620, -118.3110, "midsize"),
    ("El Rey Theatre", "Miracle Mile", 34.0624, -118.3510, "midsize"),
    ("Hollywood Palladium", "Hollywood", 34.0980, -118.3260, "large"),
    ("Fonda Theatre", "Hollywood", 34.1017, -118.3240, "midsize"),
    ("Hotel Café", "Hollywood", 34.1010, -118.3290, "intimate"),
    ("Gold-Diggers", "East Hollywood", 34.0900, -118.3060, "intimate"),
    ("The Virgil", "East Hollywood", 34.0900, -118.2900, "intimate"),
    ("Zebulon", "Frogtown", 34.1090, -118.2510, "intimate"),
    ("The Lodge Room", "Highland Park", 34.1120, -118.1930, "midsize"),
    ("Highland Park Bowl", "Highland Park", 34.1120, -118.1980, "intimate"),
    ("The Airliner", "Lincoln Heights", 34.0700, -118.2110, "intimate"),
    ("Permanent Records Roadhouse", "Cypress Park", 34.1000, -118.2200, "intimate"),
    ("The Satellite", "Silver Lake", 34.0900, -118.2740, "intimate"),
    ("Silverlake Lounge", "Silver Lake", 34.0810, -118.2740, "intimate"),
    ("Los Globos", "Silver Lake", 34.0840, -118.2790, "midsize"),
    ("Cha Cha Lounge", "Silver Lake", 34.1050, -118.2590, "intimate"),
    ("Bootleg Theater", "Westlake", 34.0640, -118.2760, "intimate"),
    ("1720", "Downtown LA", 34.0230, -118.2320, "midsize"),
    ("Catch One", "Arlington Heights", 34.0480, -118.3230, "midsize"),
    ("The Mint", "Pico-Robertson", 34.0520, -118.3620, "intimate"),
    ("Molly Malone's", "Fairfax", 34.0640, -118.3620, "intimate"),
    ("Genghis Cohen", "Fairfax", 34.0840, -118.3610, "intimate"),
    ("Barney's Beanery", "Westwood", 34.0620, -118.4460, "intimate"),
    ("The Baked Potato", "Studio City", 34.1400, -118.3690, "intimate"),
    ("Harvelle's", "Santa Monica", 34.0160, -118.4960, "intimate"),
    ("McCabe's Guitar Shop", "Santa Monica", 34.0270, -118.4720, "intimate"),
    ("Sam First", "Westchester", 33.9470, -118.3820, "intimate"),
    ("The Greek Theatre", "Los Feliz", 34.1200, -118.2960, "large"),
    ("Hollywood Bowl", "Hollywood Hills", 34.1122, -118.3390, "large"),
    ("Ford Theatres", "Hollywood Hills", 34.1180, -118.3400, "midsize"),
    ("The Rose", "Pasadena", 34.1450, -118.1440, "midsize"),
    ("Old Town Pub", "Pasadena", 34.1470, -118.1500, "intimate"),
    ("Alex's Bar", "Long Beach", 33.7820, -118.1520, "intimate"),
    ("Que Sera", "Long Beach", 33.7720, -118.1740, "intimate"),
    ("The Prospector", "Long Beach", 33.7710, -118.1660, "intimate"),
    ("Saint Rocke", "Hermosa Beach", 33.8620, -118.3990, "midsize"),
    ("The Lighthouse Café", "Hermosa Beach", 33.8620, -118.4010, "intimate"),
    ("Grand Annex", "San Pedro", 33.7380, -118.2840, "intimate"),
    ("The Federal Bar", "North Hollywood", 34.1690, -118.3760, "intimate"),
    ("Kulak's Woodshed", "North Hollywood", 34.1670, -118.3820, "intimate"),
    ("The Wayward", "Eagle Rock", 34.1390, -118.2100, "intimate"),
]

GENRES = [
    "Indie Rock", "Dream Pop", "Post-Punk", "Shoegaze", "Jazz", "Funk / Soul",
    "Hip-Hop", "Electronic", "House / Techno", "Latin / Cumbia", "Classical",
    "Experimental", "Folk / Americana", "Metal", "Punk / Hardcore", "R&B",
    "Afrobeat", "Reggae / Dub", "Synthpop", "Country",
]

ARTISTS = [
    "Mellow Transit", "Strand Luck", "Palm Static", "Neon Arroyo", "Velvet Cassette",
    "Harbor & Vine", "The Slow Parade", "Cassette Sunday", "Junipero Sound",
    "Marigold Hour", "Static Bloom", "The Wilshire Set", "Paper Lantern Club",
    "Ocean Park Motel", "Sunset Junction Trio", "Golden Hour Radio", "Bad Weather Friends",
    "The Lucid Dept.", "Amber Vista", "Nightshift Choir", "Coral Reef Society",
    "The Fourth Street Fire", "Moonlit Cargo", "Silver Lake Séance", "Echo Chamber Kids",
    "Thrift Store Prophets", "The Melrose Tapes", "Low Tide Union", "Bright Ravine",
    "Pacific Standard Time", "The Franklin Hill Gang", "Salt & Static", "Wildflower Static",
    "Boulevard Ghosts", "The Nightwash", "Copper Canyon Club", "Rosewood Drift",
    "Terrazzo", "The Long Beach Longshots", "Fever Dream Motel", "Glass Arcade",
    "Fifth of July", "Cardinal Points", "The Understudy", "Hazel & The Hollows",
    "Sonora Line", "The Blue Hour Orchestra", "Dust & Denim", "Parallel Parking",
    "The Fig Tree Union", "Midnight Laundromat", "Saturn Return", "Palisades Fault",
    "The Weekday Warriors", "Sable Sky", "Grand Central Market Band", "Pomegranate Season",
    "The Tuesday Regulars", "Aloe Vera Motel", "Feather River", "Cobalt Youth",
    "The Slowest Train", "Lemonade Stand Riot", "Bright Angel", "The Corner Booth",
    "Sunbeam Casualty", "Verdugo Hills Sound", "Tar Pit Serenade", "The Night Shift Band",
    "Ceramic Animals", "Wax Museum Hearts", "Orange Line Express", "Little Tokyo Nocturne",
    "The Pacific Electric", "Fool's Gold Coast", "Marlowe & The Method", "Sundown Syndicate",
    "The Analog Hours", "Ivy League Dropouts", "Chaparral", "The Second Story",
    "Half Moon Bay Blues", "Neon Cactus Choir", "The Understory", "Ash & Ember",
    "Radio Silence Club", "The Alameda Line", "Peach Fuzz Revival", "Tidewater Sound",
    "Bunker Hill Brass", "The Overpass", "Slow Motion Riot", "Lantern Parade",
    "The Gasoline Choir", "Mockingbird Lane", "Faded Polaroid", "The Sixth Street Bridge",
    "Wildcat Canyon", "The Marquee Kids", "Sunset Boulevard Bureau", "Cactus Flower Social",
]

# Ensemble names get classical/jazz-flavoured billing.
FORMAL_ARTISTS = [
    ("Orchestra Nova LA", "Classical"),
    ("The Angeleno Chamber Players", "Classical"),
    ("Wilshire Baroque Collective", "Classical"),
    ("The Pico Street Quintet", "Jazz"),
    ("Westside Jazz Workshop", "Jazz"),
]

# Invented meetup restaurants, keyed by neighborhood.
MEETUPS = {
    "West Hollywood": [("Rosalind's Counter", "Diner"), ("Olive & Ash", "Mediterranean")],
    "Echo Park": [("Tortas Del Sol", "Mexican"), ("The Reservoir Room", "Small plates")],
    "Downtown LA": [("Spring Street Noodle Bar", "Ramen"), ("Bunker Hill Taqueria", "Tacos")],
    "Arts District": [("Hewitt Street Pizza", "Pizza"), ("Traction Ave Tacos", "Tacos")],
    "Koreatown": [("Banchan House", "Korean"), ("Sixth & Ardmore BBQ", "Korean BBQ")],
    "Mid-Wilshire": [("The Wilshire Deli", "Sandwiches")],
    "Miracle Mile": [("Tar Pit Pizza", "Pizza"), ("Museum Row Cafe", "Cafe")],
    "Hollywood": [("Cahuenga Chicken Shop", "Fried chicken"), ("Vine Street Pho", "Vietnamese")],
    "East Hollywood": [("Santa Monica Blvd Birria", "Birria"), ("Thai Town Noodle Co.", "Thai")],
    "Frogtown": [("River Bend Cafe", "Cafe")],
    "Highland Park": [("Figueroa Fish Fry", "Seafood"), ("Avenue 57 Pizzeria", "Pizza")],
    "Lincoln Heights": [("Broadway Birrieria", "Birria")],
    "Cypress Park": [("Cypress Park Sandwich Co.", "Sandwiches")],
    "Silver Lake": [("Sunset Junction Dumplings", "Dumplings"), ("Reservoir Taco", "Tacos")],
    "Westlake": [("MacArthur Park Pupuseria", "Salvadoran")],
    "Arlington Heights": [("Pico Soul Kitchen", "Soul food")],
    "Pico-Robertson": [("Robertson Falafel House", "Middle Eastern")],
    "Fairfax": [("Fairfax Village Deli", "Deli"), ("Third Street Ramen", "Ramen")],
    "Westwood": [("Broxton Burgers", "Burgers"), ("Village Souvlaki", "Greek")],
    "Studio City": [("Ventura Blvd Sushi Bar", "Sushi")],
    "Santa Monica": [("Ocean Ave Oyster Bar", "Seafood"), ("Fourth Street Trattoria", "Italian")],
    "Westchester": [("Century Blvd Grill", "American")],
    "Los Feliz": [("Vermont Ave Bistro", "Bistro")],
    "Hollywood Hills": [("Highland Canyon Cantina", "Mexican")],
    "Pasadena": [("Old Town Dumpling House", "Dumplings"), ("Colorado Blvd Cafe", "Cafe")],
    "Long Beach": [("Retro Row Diner", "Diner"), ("Anaheim Street Tacos", "Tacos")],
    "Hermosa Beach": [("Pier Avenue Fish Co.", "Seafood")],
    "San Pedro": [("Sixth Street Sardine Bar", "Seafood")],
    "North Hollywood": [("Lankershim Noodle Bar", "Noodles")],
    "Eagle Rock": [("Colorado Sandwich Shop", "Sandwiches")],
}

ORIGIN_CITIES = [
    "Oakland", "San Diego", "Phoenix", "Portland", "Chicago", "Houston", "Denver",
    "Sacramento", "Fresno", "Tucson", "Seattle", "Austin", "Detroit", "Miami",
    "Mexico City", "Cape Town", "London", "Toronto", "Guadalajara", "Brooklyn",
]

FIRST_NAMES = [
    "Maya", "Andre", "Julian", "Nico", "Marcus", "Theo", "Rosa", "Devon", "Imani",
    "Sasha", "Elena", "Tomas", "Priya", "Jonah", "Camille", "Beatriz", "Otis",
    "Simone", "Rafael", "Noor", "Iris", "Malik", "Corinne", "Dante", "Lucia",
]
LAST_NAMES = [
    "Rivers", "Coleman", "Park", "Alvarez", "Bell", "Grant", "Okafor", "Nakamura",
    "Delgado", "Whitfield", "Sandoval", "Brennan", "Osei", "Marchetti", "Vega",
    "Holloway", "Castellanos", "Reyes", "Ferrante", "Ibarra", "Solomon", "Duarte",
]
INSTRUMENTS = [
    "guitar", "bass", "drums", "keys", "saxophone", "trumpet", "synths",
    "percussion", "violin", "pedal steel",
]

EP_WORDS_A = [
    "After Midnight on", "Sunset over", "Postcards from", "Last Call at", "Static on",
    "Late Night at", "Signals from", "Winter in", "Dispatches from", "Neon over",
]
EP_WORDS_B = [
    "Pico", "Sixth Street", "Echo Park", "the Harbor", "Vermont", "Alvarado",
    "the 110", "Chinatown", "Silver Lake", "Long Beach", "the Valley", "Figueroa",
]


def rng_offset(rng, meters):
    """Small lat/lng jitter, roughly `meters` in each direction."""
    dlat = rng.uniform(-meters, meters) / 111_320
    dlng = rng.uniform(-meters, meters) / (111_320 * 0.83)
    return dlat, dlng


def make_description(rng, artist, genre, venue, neighborhood):
    origin = rng.choice(ORIGIN_CITIES)
    lead = f"{rng.choice(FIRST_NAMES)} {rng.choice(LAST_NAMES)}"
    ep = f"{rng.choice(EP_WORDS_A)} {rng.choice(EP_WORDS_B)}"
    year = rng.choice([2023, 2024, 2025, 2026])
    members = rng.sample(
        [f"{rng.choice(FIRST_NAMES)} {rng.choice(LAST_NAMES)}" for _ in range(8)],
        k=rng.randint(2, 4),
    )
    parts = [f"{m} on {i}" for m, i in zip(members, rng.sample(INSTRUMENTS, len(members)))]

    openers = {
        "Jazz": f"{artist} is a Los Angeles jazz group built around deep-pocket grooves, horn-driven arrangements and plenty of room to improvise.",
        "Funk / Soul": f"{artist} plays funk and soul the old way — tight rhythm section, big horns, and a singer who can carry a room.",
        "Classical": f"{artist} brings orchestral repertoire to {neighborhood} in a program that mixes familiar favourites with pieces you have probably never heard live.",
        "Hip-Hop": f"{artist} came up through the Los Angeles open-mic circuit and has spent the last few years turning dense, sample-heavy production into a live show.",
        "Electronic": f"{artist} builds hardware-driven electronic sets that lean more toward hypnotic than club-ready.",
        "House / Techno": f"{artist} runs a long-form set of house and techno, mixed live and built for a dance floor that stays until close.",
        "Latin / Cumbia": f"{artist} blends cumbia, psychedelia and Southern California garage rock into something that gets a room moving fast.",
        "Metal": f"{artist} is a Los Angeles metal band with a reputation for a punishing, tightly controlled live set.",
        "Punk / Hardcore": f"{artist} plays short, fast sets in small rooms and has quietly become a fixture of the LA punk circuit.",
        "Folk / Americana": f"{artist} writes plainspoken Americana built on close harmonies and a lot of road miles.",
        "Country": f"{artist} plays honky-tonk-leaning country with a Southern California accent.",
        "R&B": f"{artist} makes contemporary R&B that stays warm and unhurried, built for late sets.",
        "Afrobeat": f"{artist} is a large-ensemble Afrobeat group whose sets run long and rarely stop between songs.",
        "Reggae / Dub": f"{artist} plays roots reggae and dub with a live mixing desk treated as an instrument.",
        "Experimental": f"{artist} works in long-form improvisation, tape loops and quiet noise — a set that rewards paying attention.",
    }
    default = f"{artist} is a Los Angeles {genre.lower()} act known for a live show that runs warmer and louder than the records."
    p1 = openers.get(genre, default)

    p2 = (
        f"The group formed in {year} and is led by {lead}, who moved to Los Angeles from {origin} "
        f"and became a regular on the local circuit soon after. They are joined by "
        f"{', '.join(parts)}."
    )
    p3 = (
        f"Their release “{ep}” has built a small but committed following in the city's "
        f"{genre.lower()} scene. Catch {artist} live at {venue} in {neighborhood}."
    )
    return "\n\n".join([p1, p2, p3])


def build():
    rng = random.Random(SEED)
    shows = []
    show_id = 0

    for day_index in range(DAYS):
        day = START + timedelta(days=day_index)
        weekday = day.weekday()  # 0 Mon .. 6 Sun
        # Busier on Thu–Sat, quieter early week.
        if weekday in (4, 5):
            count = rng.randint(30, 40)
        elif weekday in (3, 6):
            count = rng.randint(22, 32)
        else:
            count = rng.randint(15, 24)

        night_venues = rng.sample(VENUES, count)
        used_artists = set()

        for venue_name, hood, lat, lng, size in night_venues:
            artist = rng.choice(ARTISTS)
            while artist in used_artists:
                artist = rng.choice(ARTISTS)
            used_artists.add(artist)

            genre = rng.choice(GENRES)
            if venue_name in ("Walt Disney Concert Hall", "The Ebell Club"):
                artist, genre = rng.choice(FORMAL_ARTISTS)
            if venue_name in ("Sam First", "The Baked Potato", "The Lighthouse Café"):
                genre = "Jazz"

            hour = rng.choice([19, 19, 20, 20, 20, 21, 21, 22])
            minute = rng.choice([0, 0, 30])
            doors_hour = hour if minute == 30 else hour - 1
            doors_minute = 0 if minute == 30 else 30

            free = rng.random() < 0.18
            price = 0 if free else rng.choice([10, 12, 15, 15, 18, 20, 20, 25, 28, 30, 35, 45])

            m_lat, m_lng = rng_offset(rng, 260)
            meet_options = MEETUPS.get(hood) or [("The Corner Table", "American")]
            meet_name, meet_cuisine = rng.choice(meet_options)

            show_id += 1
            shows.append(
                {
                    "id": show_id,
                    "date": day.isoformat(),
                    "time": f"{hour:02d}:{minute:02d}",
                    "doors": f"{doors_hour:02d}:{doors_minute:02d}",
                    "artist": artist,
                    "genre": genre,
                    "venue": venue_name,
                    "neighborhood": hood,
                    "lat": round(lat, 5),
                    "lng": round(lng, 5),
                    "size": size,
                    "price": price,
                    "priceText": "Free" if free else f"${price}",
                    "description": make_description(rng, artist, genre, venue_name, hood),
                    "meetup": {
                        "name": meet_name,
                        "cuisine": meet_cuisine,
                        "lat": round(lat + m_lat, 5),
                        "lng": round(lng + m_lng, 5),
                        "walk": rng.randint(2, 9),
                    },
                }
            )

    return shows


# The three shows supplied as reference, dropped in verbatim on Sat Sep 5.
FEATURED = [
    {
        "date": "2026-09-05",
        "time": "20:00",
        "doors": "19:30",
        "artist": "Orchestra Nova LA",
        "title": "Symphony on Shuffle",
        "genre": "Classical",
        "venue": "The Ebell Club",
        "neighborhood": "Mid-Wilshire",
        "lat": 34.0620,
        "lng": -118.3110,
        "size": "midsize",
        "price": 0,
        "priceText": "Free",
        "description": (
            "From fanfares to finales, no two moments are the same — experience Orchestra "
            "Nova LA on shuffle as KUSC's Rich Capparela spins a vibrant mix of symphonic "
            "favorites and surprises.\n\n"
            "FREE ADMISSION. Suggested donation: $20.\n\n"
            "Doors open at 7:30PM. OPEN SEATING — arriving early is strongly recommended. "
            "All concerts are first come, first served. Your RSVP helps us determine seating "
            "capacity but is not required and does not guarantee a seat."
        ),
        "meetup": {"name": "The Wilshire Deli", "cuisine": "Sandwiches", "walk": 4},
    },
    {
        "date": "2026-09-05",
        "time": "21:00",
        "doors": "20:00",
        "artist": "Mellow Transit",
        "genre": "Funk / Soul",
        "venue": "Barney's Beanery",
        "neighborhood": "Westwood",
        "lat": 34.0620,
        "lng": -118.4460,
        "size": "intimate",
        "price": 30,
        "priceText": "$30",
        "description": (
            "Mellow Transit is a Los Angeles-based funk and jazz collective blending "
            "deep-pocket grooves, soulful vocals, and improvisational energy into a sound "
            "that feels equally at home in a smoky jazz club or a packed Westwood bar.\n\n"
            "Formed in 2022 by a group of musicians who met through the LA jazz and studio "
            "scene, the band draws inspiration from 1970s funk, contemporary R&B, and classic "
            "jazz-fusion. Their live sets move effortlessly between tight, horn-driven "
            "arrangements and extended grooves that leave plenty of room for improvisation.\n\n"
            "At the center of the group is Maya Rivers, a 27-year-old vocalist and songwriter "
            "originally from Oakland, California. Known for her smoky alto and charismatic "
            "stage presence, Rivers grew up singing in her family's church before studying jazz "
            "at Cal State Long Beach. She relocated to Los Angeles after college and quickly "
            "became a fixture on the local session and jazz circuit.\n\n"
            "She is joined by Andre Coleman on trumpet, Julian Park on saxophone, Nico Alvarez "
            "on guitar, Marcus Bell on bass, and Theo Grant on drums.\n\n"
            "The band's debut EP, After Midnight on Pico, was released independently in 2024 and "
            "has developed a small but devoted following among LA's jazz, funk, and R&B "
            "communities. They are currently working on a first full-length album, expected "
            "later this year."
        ),
        "meetup": {"name": "Broxton Burgers", "cuisine": "Burgers", "walk": 3},
    },
    {
        "date": "2026-09-05",
        "time": "20:30",
        "doors": "19:30",
        "artist": "Strand Luck",
        "genre": "Dream Pop",
        "venue": "Molly Malone's",
        "neighborhood": "Fairfax",
        "lat": 34.0640,
        "lng": -118.3620,
        "size": "intimate",
        "price": 15,
        "priceText": "$15",
        "description": (
            "Strand Luck is a Los Angeles-based indie duo bringing together dreamy guitars, "
            "hypnotic grooves, and a distinctly nostalgic alternative-pop sound. With roots "
            "stretching between Los Angeles and Cape Town, South Africa, the duo moves "
            "effortlessly between dream pop, indie rock, post-punk, and dance-inspired "
            "production.\n\n"
            "Their music balances hazy, atmospheric textures with infectious rhythms and "
            "emotionally charged songwriting. Their debut single, “Love Me Now,” was written in "
            "Cape Town while one member of the band was recovering from major surgery, setting "
            "the tone for a project built around intimacy, experimentation, and a little bit of "
            "chaos. Their 2026 debut album, Sylvie, expands that sound with a collection of "
            "shimmering guitars, pulsing basslines, dreamy vocals, and left-of-center pop "
            "hooks.\n\n"
            "Now based in Los Angeles, Strand Luck has become a fixture of the city's "
            "independent music scene, performing everywhere from intimate clubs to packed local "
            "showcases. Their sound is nostalgic without feeling retro — somewhere between a "
            "late-night dance floor, a hazy 1990s indie record, and the soundtrack to a summer "
            "you don't quite remember."
        ),
        "meetup": {"name": "Third Street Ramen", "cuisine": "Ramen", "walk": 5},
    },
]


def main():
    shows = build()

    # Featured shows replace any generated show sharing their venue — or their
    # artist — that night, so nobody is double-booked.
    featured_venues = {(f["date"], f["venue"]) for f in FEATURED}
    featured_artists = {(f["date"], f["artist"]) for f in FEATURED}
    shows = [
        s
        for s in shows
        if (s["date"], s["venue"]) not in featured_venues
        and (s["date"], s["artist"]) not in featured_artists
    ]

    rng = random.Random(SEED + 1)
    for f in FEATURED:
        dlat, dlng = rng_offset(rng, 240)
        f = dict(f)
        f["meetup"] = dict(
            f["meetup"], lat=round(f["lat"] + dlat, 5), lng=round(f["lng"] + dlng, 5)
        )
        shows.append(f)

    shows.sort(key=lambda s: (s["date"], s["time"], s["venue"]))
    for i, s in enumerate(shows, 1):
        s["id"] = i

    by_date = {}
    for s in shows:
        by_date[s["date"]] = by_date.get(s["date"], 0) + 1

    payload = {
        "generatedAt": date.today().isoformat(),
        "note": "Fake data for the B-Scene demo. Venues are real LA rooms; artists, shows, prices and meetup spots are invented.",
        "dates": sorted(by_date),
        "counts": by_date,
        "shows": shows,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        "window.DEMO_SHOWS = "
        + json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
        + ";\n"
    )
    print(f"Wrote {len(shows)} demo shows across {len(by_date)} nights → {OUT.name}")
    print("per-night:", ", ".join(f"{d[5:]}:{n}" for d, n in sorted(by_date.items())))


if __name__ == "__main__":
    main()
