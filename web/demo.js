// B-Scene "Demo" experience — map + list discovery over fake LA show data.
// Shares the visual language of the main experience; no map libraries, the
// map is drawn from projected coordinates so it themes like everything else.

(function () {
  const $ = (sel) => document.querySelector(sel);

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v);
    }
    for (const child of children) node.append(child);
    return node;
  }

  // ---------- geography ----------
  // Simplified LA reference geometry, drawn so the pins have context.

  const COASTLINE = [
    [34.038, -118.68], [34.027, -118.6], [34.033, -118.55], [34.023, -118.515],
    [34.01, -118.497], [33.985, -118.472], [33.962, -118.445], [33.945, -118.43],
    [33.92, -118.427], [33.902, -118.419], [33.862, -118.401], [33.844, -118.393],
    [33.809, -118.393], [33.777, -118.423], [33.742, -118.413], [33.718, -118.32],
    [33.742, -118.28], [33.754, -118.205], [33.76, -118.19], [33.744, -118.117],
    [33.735, -118.09],
  ];

  const FREEWAYS = [
    { name: '405', pts: [[34.28, -118.47], [34.15, -118.47], [34.06, -118.44], [33.98, -118.39], [33.93, -118.37], [33.87, -118.33], [33.79, -118.23]] },
    { name: '10', pts: [[34.03, -118.48], [34.03, -118.4], [34.04, -118.34], [34.04, -118.28], [34.03, -118.22], [34.02, -118.15]] },
    { name: '101', pts: [[34.05, -118.24], [34.09, -118.29], [34.13, -118.36], [34.16, -118.42], [34.19, -118.55]] },
    { name: '110', pts: [[34.13, -118.19], [34.09, -118.21], [34.06, -118.23], [34.03, -118.28], [33.93, -118.28], [33.83, -118.28], [33.78, -118.27]] },
    { name: '5', pts: [[34.28, -118.45], [34.19, -118.36], [34.15, -118.29], [34.09, -118.22], [34.02, -118.19], [33.92, -118.1]] },
    { name: '210', pts: [[34.19, -118.4], [34.18, -118.3], [34.16, -118.19], [34.14, -118.05]] },
  ];

  const PLACES = [
    ['Downtown', 34.05, -118.245], ['Hollywood', 34.101, -118.34],
    ['Silver Lake', 34.09, -118.27], ['Echo Park', 34.078, -118.26],
    ['Highland Park', 34.112, -118.193], ['Santa Monica', 34.02, -118.48],
    ['Venice', 33.99, -118.46], ['Westwood', 34.062, -118.446],
    ['Culver City', 34.02, -118.39], ['Koreatown', 34.058, -118.3],
    ['Los Feliz', 34.11, -118.29], ['Pasadena', 34.147, -118.145],
    ['Long Beach', 33.78, -118.16], ['San Pedro', 33.738, -118.29],
    ['Studio City', 34.14, -118.395], ['Burbank', 34.18, -118.31],
    ['Glendale', 34.15, -118.25], ['Inglewood', 33.96, -118.35],
    ['El Segundo', 33.92, -118.41], ['Hermosa Beach', 33.862, -118.4],
    ['Torrance', 33.84, -118.34], ['Boyle Heights', 34.03, -118.2],
    ['Eagle Rock', 34.14, -118.21], ['Sherman Oaks', 34.15, -118.45],
    ['Van Nuys', 34.19, -118.45], ['Beverly Hills', 34.07, -118.4],
    ['West Hollywood', 34.09, -118.375], ['Pacific Palisades', 34.045, -118.53],
    ['Malibu', 34.04, -118.68], ['Compton', 33.9, -118.22],
    ['Pomona', 34.06, -117.75], ['Whittier', 33.98, -118.03],
  ];


  // Major surface streets — context once you zoom past the freeway level.
  const STREETS = [
    { name: 'Sunset', pts: [[34.0779, -118.24], [34.09, -118.274], [34.098, -118.326], [34.0906, -118.3866], [34.0755, -118.44], [34.04, -118.53]] },
    { name: 'Santa Monica', pts: [[34.09, -118.29], [34.09, -118.356], [34.062, -118.416], [34.025, -118.49]] },
    { name: 'Wilshire', pts: [[34.053, -118.256], [34.0616, -118.309], [34.0624, -118.351], [34.067, -118.4], [34.025, -118.495]] },
    { name: 'Pico', pts: [[34.04, -118.26], [34.048, -118.323], [34.052, -118.362], [34.03, -118.45], [34.018, -118.49]] },
    { name: 'Venice', pts: [[34.04, -118.27], [34.027, -118.36], [34.01, -118.43], [33.99, -118.46]] },
    { name: 'Vermont', pts: [[34.12, -118.296], [34.09, -118.292], [34.058, -118.292], [33.93, -118.292]] },
    { name: 'Western', pts: [[34.1, -118.309], [34.058, -118.309], [33.93, -118.309]] },
    { name: 'Figueroa', pts: [[34.112, -118.198], [34.06, -118.26], [34.02, -118.28], [33.93, -118.283]] },
    { name: 'Fairfax', pts: [[34.09, -118.361], [34.048, -118.361]] },
    { name: 'Ventura', pts: [[34.145, -118.38], [34.15, -118.45], [34.155, -118.55]] },
    { name: 'Whittier', pts: [[34.023, -118.2], [34.018, -118.12], [34.0, -118.05]] },
    { name: 'PCH', pts: [[34.038, -118.68], [34.01, -118.497], [33.962, -118.445], [33.902, -118.419], [33.844, -118.393]] },
  ];

  // Stand-in for the user's location (no geolocation prompt in a demo).
  const ME = { lat: 34.0855, lng: -118.2637, label: 'Echo Park' };

  function milesFrom(lat, lng) {
    const R = 3958.8;
    const dLat = ((lat - ME.lat) * Math.PI) / 180;
    const dLng = ((lng - ME.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((ME.lat * Math.PI) / 180) * Math.cos((lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  function fmtMiles(mi) {
    return mi < 10 ? `${mi.toFixed(1)} mi` : `${Math.round(mi)} mi`;
  }

  const MIN_SCALE = 60000; // whole region in frame
  const MAX_SCALE = 30000000; // roughly street level

  function clampScale(v) {
    return Math.min(MAX_SCALE, Math.max(MIN_SCALE, v));
  }

  // Web Mercator into a 0..1 unit square.
  function project(lat, lng) {
    const x = (lng + 180) / 360;
    const rad = (lat * Math.PI) / 180;
    const y = (1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2;
    return { x, y };
  }

  // ---------- state ----------

  const DATA = window.DEMO_SHOWS || { shows: [], dates: [] };
  const state = {
    date: null,
    shows: [],
    selected: null, // show object when the detail pane is open
    hovered: null, // show id
    view: { cx: 0, cy: 0, scale: 1 }, // cx/cy = unit-space center, scale = px per unit
    ready: false,
  };

  let mapEl, listEl, svgEl, pinLayer, infoBox;
  const pinNodes = new Map(); // show id -> element

  // ---------- date helpers ----------

  function parseDate(str) {
    return new Date(`${str}T12:00:00`);
  }

  function fmtDate(str, opts) {
    return parseDate(str).toLocaleDateString('en-US', opts);
  }

  function fmtTime(hhmm) {
    if (!hhmm) return '';
    let [h, m] = hhmm.split(':').map(Number);
    const ampm = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return m ? `${h}:${String(m).padStart(2, '0')} ${ampm}` : `${h} ${ampm}`;
  }

  function shiftDate(str, days) {
    const d = parseDate(str);
    d.setDate(d.getDate() + days);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // ---------- map ----------

  function fitToShows(shows) {
    const rect = mapEl.getBoundingClientRect();
    if (!rect.width || !rect.height || !shows.length) return;
    const pts = shows.map((s) => project(s.lat, s.lng)).concat(project(ME.lat, ME.lng));
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const pad = 0.16;
    const spanX = (maxX - minX) || 0.001;
    const spanY = (maxY - minY) || 0.001;
    state.view.scale = Math.min(
      rect.width / (spanX * (1 + pad * 2)),
      rect.height / (spanY * (1 + pad * 2))
    );
    state.view.cx = (minX + maxX) / 2;
    state.view.cy = (minY + maxY) / 2;
  }

  function toScreen(lat, lng, rect) {
    const p = project(lat, lng);
    return {
      x: (p.x - state.view.cx) * state.view.scale + rect.width / 2,
      y: (p.y - state.view.cy) * state.view.scale + rect.height / 2,
    };
  }

  function pathFrom(points, rect) {
    return points
      .map(([lat, lng], i) => {
        const p = toScreen(lat, lng, rect);
        return `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
      })
      .join(' ');
  }

  function renderMapGeometry() {
    const rect = mapEl.getBoundingClientRect();
    svgEl.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);

    // Ocean: coastline closed off the bottom/left of the frame.
    const coast = pathFrom(COASTLINE, rect);
    const first = toScreen(COASTLINE[0][0], COASTLINE[0][1], rect);
    const last = toScreen(COASTLINE[COASTLINE.length - 1][0], COASTLINE[COASTLINE.length - 1][1], rect);
    const h = rect.height + 400;
    const w = rect.width + 400;
    svgEl.querySelector('.map-ocean').setAttribute(
      'd',
      `${coast} L${last.x.toFixed(1)} ${h} L${-400} ${h} L${-400} ${first.y.toFixed(1)} Z`
    );
    svgEl.querySelector('.map-coast').setAttribute('d', coast);

    const fw = svgEl.querySelector('.map-freeways');
    fw.replaceChildren(
      ...FREEWAYS.map((f) => {
        const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        p.setAttribute('d', pathFrom(f.pts, rect));
        p.setAttribute('class', 'map-freeway');
        return p;
      })
    );

    // Surface streets only matter once the freeways stop being enough.
    const streetLayer = svgEl.querySelector('.map-streets');
    if (state.view.scale > 400000) {
      streetLayer.replaceChildren(
        ...STREETS.map((st) => {
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('d', pathFrom(st.pts, rect));
          path.setAttribute('class', 'map-street');
          return path;
        })
      );
    } else {
      streetLayer.replaceChildren();
    }

    // Place labels thin out as you zoom out so the map never gets noisy.
    const labels = svgEl.querySelector('.map-places');
    const showLabels = state.view.scale > 260000;
    labels.replaceChildren(
      ...(showLabels ? PLACES : PLACES.slice(0, 14)).map(([name, lat, lng]) => {
        const p = toScreen(lat, lng, rect);
        const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        t.setAttribute('x', p.x.toFixed(1));
        t.setAttribute('y', p.y.toFixed(1));
        t.setAttribute('class', 'map-place');
        t.textContent = name;
        return t;
      })
    );
    void w;
  }

  function renderPins() {
    const rect = mapEl.getBoundingClientRect();
    for (const [id, node] of pinNodes) {
      const show = state.shows.find((s) => s.id === id);
      if (!show) continue;
      const p = toScreen(show.lat, show.lng, rect);
      node.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px)`;
      const off = p.x < -40 || p.y < -40 || p.x > rect.width + 40 || p.y > rect.height + 40;
      node.classList.toggle('offscreen', off);
    }
    const me = $('#demo-me-pin');
    if (me) {
      const p = toScreen(ME.lat, ME.lng, rect);
      me.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px)`;
    }

    const venueLabel = $('#demo-venue-label');
    if (venueLabel && state.selected) {
      const p = toScreen(state.selected.lat, state.selected.lng, rect);
      venueLabel.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px)`;
    }

    const meet = $('#demo-meetup-pin');
    const walk = svgEl && svgEl.querySelector('.map-walk');
    if (meet && state.selected) {
      const m = state.selected.meetup;
      const p = toScreen(m.lat, m.lng, rect);
      meet.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px)`;
      if (walk) {
        const v = toScreen(state.selected.lat, state.selected.lng, rect);
        walk.setAttribute('d', `M${v.x.toFixed(1)} ${v.y.toFixed(1)} L${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
        walk.removeAttribute('hidden');
      }
    } else if (walk) {
      walk.setAttribute('hidden', '');
    }
    positionInfoBox();
  }

  let rafPending = false;
  function drawMap() {
    renderMapGeometry();
    renderPins();
  }

  function renderMap() {
    if (document.hidden) {
      drawMap(); // rAF is suspended in background tabs
      return;
    }
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      drawMap();
    });
  }

  function buildPins() {
    pinNodes.clear();
    const frag = document.createDocumentFragment();
    for (const show of state.shows) {
      const pin = el('button', {
        class: 'demo-pin',
        type: 'button',
        'aria-label': `${show.artist} at ${show.venue}`,
        onmouseenter: () => setHover(show.id, 'map'),
        onmouseleave: () => setHover(null),
        onfocus: () => setHover(show.id, 'map'),
        onblur: () => setHover(null),
        onclick: (ev) => {
          ev.stopPropagation();
          openDetail(show);
        },
      });
      pin.append(el('span', { class: 'demo-pin-dot' }));
      pinNodes.set(show.id, pin);
      frag.append(pin);
    }
    const me = el('div', { class: 'demo-pin-me', id: 'demo-me-pin', title: 'Your location' });
    me.append(el('span', { class: 'demo-pin-me-dot' }));
    frag.append(me);
    pinLayer.replaceChildren(frag);
  }

  // ---------- hover linking ----------

  function setHover(id, source) {
    if (state.hovered === id) return;
    state.hovered = id;

    for (const [pinId, node] of pinNodes) {
      node.classList.toggle('active', pinId === id);
    }
    listEl.querySelectorAll('.demo-row').forEach((row) => {
      row.classList.toggle('active', Number(row.dataset.id) === id);
    });

    if (id == null) {
      infoBox.classList.add('hidden');
      return;
    }
    const show = state.shows.find((s) => s.id === id);
    if (!show) return;

    infoBox.replaceChildren(
      el('div', { class: 'demo-info-top' }, [
        el('span', { class: 'demo-info-time', text: fmtTime(show.time) }),
        el('span', { class: 'demo-info-price', text: show.priceText }),
      ]),
      el('div', { class: 'demo-info-artist', text: show.artist }),
      el('div', { class: 'demo-info-venue', text: `${show.venue} · ${show.neighborhood}` }),
      el('div', { class: 'demo-info-genre', text: `${show.genre} · ${fmtMiles(show.miles)} away` })
    );
    infoBox.classList.remove('hidden');
    positionInfoBox();

    // Hovering the list nudges an off-screen pin into view.
    if (source === 'list') {
      const rect = mapEl.getBoundingClientRect();
      const p = toScreen(show.lat, show.lng, rect);
      if (p.x < 20 || p.y < 20 || p.x > rect.width - 20 || p.y > rect.height - 20) {
        const target = project(show.lat, show.lng);
        state.view.cx = target.x;
        state.view.cy = target.y;
        renderMap();
      }
    }
  }

  function positionInfoBox() {
    if (infoBox.classList.contains('hidden') || state.hovered == null) return;
    const show = state.shows.find((s) => s.id === state.hovered);
    if (!show) return;
    const rect = mapEl.getBoundingClientRect();
    const p = toScreen(show.lat, show.lng, rect);
    const bw = infoBox.offsetWidth || 210;
    const bh = infoBox.offsetHeight || 90;
    let x = p.x + 14;
    let y = p.y - bh - 14;
    if (x + bw > rect.width - 8) x = p.x - bw - 14;
    if (y < 8) y = p.y + 16;
    infoBox.style.transform = `translate(${Math.max(8, x).toFixed(1)}px, ${Math.max(8, y).toFixed(1)}px)`;
  }

  // ---------- list ----------

  function renderList() {
    const rows = state.shows.map((show) => {
      const row = el('button', {
        class: 'demo-row',
        type: 'button',
        'data-id': String(show.id),
        onmouseenter: () => setHover(show.id, 'list'),
        onmouseleave: () => setHover(null),
        onclick: () => openDetail(show),
      });
      row.append(
        el('div', { class: 'demo-row-time' }, [
          el('span', { text: fmtTime(show.time) }),
          el('span', { class: `demo-row-price${show.price === 0 ? ' free' : ''}`, text: show.priceText }),
          el('span', { class: 'demo-row-dist', text: fmtMiles(show.miles) }),
        ]),
        el('div', { class: 'demo-row-artist', text: show.artist }),
        el('div', { class: 'demo-row-venue', text: `${show.venue} · ${show.neighborhood}` }),
        el('div', { class: 'demo-row-tags' }, [el('span', { class: 'tag', text: show.genre })])
      );
      return row;
    });

    listEl.replaceChildren(
      el('div', { class: 'demo-list-head' }, [
        el('span', { class: 'demo-list-count', text: `${state.shows.length} shows` }),
        el('span', { class: 'demo-list-hint', text: 'Hover to locate · click for details' }),
      ]),
      el('div', { class: 'demo-rows' }, rows)
    );
  }

  // ---------- detail ----------

  function openDetail(show) {
    state.selected = show;
    setHover(null);

    for (const [pinId, node] of pinNodes) {
      node.classList.toggle('selected', pinId === show.id);
      node.classList.toggle('dimmed', pinId !== show.id);
    }

    let venueLabel = $('#demo-venue-label');
    if (!venueLabel) {
      venueLabel = el('div', { class: 'demo-pin-label demo-pin-label-venue', id: 'demo-venue-label' });
      pinLayer.append(venueLabel);
    }
    venueLabel.textContent = show.venue;

    let meetPin = $('#demo-meetup-pin');
    if (!meetPin) {
      meetPin = el('div', { class: 'demo-pin-meetup', id: 'demo-meetup-pin' });
      meetPin.append(el('span', { class: 'demo-pin-meetup-dot' }), el('span', { class: 'demo-pin-meetup-label', text: 'Meetup' }));
      pinLayer.append(meetPin);
    }
    meetPin.querySelector('.demo-pin-meetup-label').textContent = show.meetup.name;

    // Centre on the show, zoomed in enough to see the meetup spot too.
    const target = project(show.lat, show.lng);
    state.view.cx = target.x;
    state.view.cy = target.y;
    state.view.scale = Math.max(state.view.scale, 2200000); // ~11km across: venue in context
    renderMap();

    const meetTime = (() => {
      const [h, m] = show.doors.split(':').map(Number);
      const d = new Date(2020, 0, 1, h, m);
      d.setMinutes(d.getMinutes() - 75);
      return fmtTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
    })();

    const facts = el('dl', { class: 'demo-facts' });
    const fact = (k, v) => facts.append(el('dt', { text: k }), el('dd', { text: v }));
    fact('When', `${fmtDate(show.date, { weekday: 'long', month: 'long', day: 'numeric' })} · doors ${fmtTime(show.doors)}, show ${fmtTime(show.time)}`);
    fact('Where', `${show.venue} — ${show.neighborhood}`);
    fact('Genre', show.genre);
    fact('Distance', `${fmtMiles(show.miles)} from you (${ME.label})`);
    fact('Tickets', show.price === 0 ? 'Free' : show.priceText);

    const detail = el('div', { class: 'demo-detail' }, [
      el('button', {
        class: 'demo-back',
        type: 'button',
        text: '‹ All shows',
        onclick: closeDetail,
      }),
      el('div', { class: 'demo-detail-body' }, [
        el('div', { class: 'demo-detail-eyebrow' }, [
          el('span', { class: 'tag tag-category', text: show.genre }),
          ...(show.price === 0 ? [el('span', { class: 'badge badge-free', text: 'Free' })] : []),
        ]),
        el('h2', { class: 'demo-detail-artist', text: show.artist }),
        ...(show.title ? [el('p', { class: 'demo-detail-title', text: show.title })] : []),
        facts,
        el('div', { class: 'demo-ticket-row' }, [
          el('button', {
            class: 'btn btn-primary',
            type: 'button',
            text: show.price === 0 ? 'Reserve a spot' : `Buy ticket · ${show.priceText}`,
            onclick: () => alert('Demo only — no real checkout is wired up.'),
          }),
        ]),
        el('div', { class: 'demo-section' }, [
          el('h3', { class: 'demo-section-title', text: 'About the show' }),
          ...show.description.split('\n\n').map((p) => el('p', { class: 'demo-para', text: p })),
        ]),
        el('div', { class: 'demo-section demo-meetup' }, [
          el('h3', { class: 'demo-section-title', text: 'Pre-show meetup spot' }),
          el('div', { class: 'demo-meetup-name', text: show.meetup.name }),
          el('div', { class: 'demo-meetup-meta', text: `${show.meetup.cuisine} · ${show.meetup.walk} min walk from ${show.venue}` }),
          el('p', { class: 'demo-para', text: `Meet other people going to the show from ${meetTime}. Look for the B-Scene table.` }),
        ]),
      ]),
    ]);

    listEl.replaceChildren(detail);
    listEl.scrollTop = 0;
  }

  function closeDetail() {
    state.selected = null;
    const meetPin = $('#demo-meetup-pin');
    if (meetPin) meetPin.remove();
    const venueLabel = $('#demo-venue-label');
    if (venueLabel) venueLabel.remove();
    for (const node of pinNodes.values()) {
      node.classList.remove('selected', 'dimmed');
    }
    renderList();
    fitToShows(state.shows);
    renderMap();
  }

  // ---------- date navigation ----------

  function setDate(dateStr) {
    const dates = DATA.dates || [];
    if (!dates.includes(dateStr)) return;
    state.date = dateStr;
    state.selected = null;
    const meetPin = $('#demo-meetup-pin');
    if (meetPin) meetPin.remove();
    const venueLabel = $('#demo-venue-label');
    if (venueLabel) venueLabel.remove();

    state.shows = DATA.shows
      .filter((s) => s.date === dateStr)
      .map((s) => ({ ...s, miles: milesFrom(s.lat, s.lng) }))
      .sort((a, b) => a.time.localeCompare(b.time) || a.artist.localeCompare(b.artist));

    $('#demo-date-label').textContent = fmtDate(dateStr, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
    const i = dates.indexOf(dateStr);
    $('#demo-prev').disabled = i <= 0;
    $('#demo-next').disabled = i >= dates.length - 1;

    buildPins();
    renderList();
    fitToShows(state.shows);
    renderMap();
  }

  // ---------- map interaction ----------

  function bindMap() {
    let dragging = false;
    let moved = false;
    let lastX = 0;
    let lastY = 0;

    mapEl.addEventListener('pointerdown', (ev) => {
      if (ev.target.closest('.demo-pin, .demo-map-btn')) return;
      dragging = true;
      moved = false;
      lastX = ev.clientX;
      lastY = ev.clientY;
      mapEl.setPointerCapture(ev.pointerId);
      mapEl.classList.add('dragging');
    });

    mapEl.addEventListener('pointermove', (ev) => {
      if (!dragging) return;
      const dx = ev.clientX - lastX;
      const dy = ev.clientY - lastY;
      if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
      lastX = ev.clientX;
      lastY = ev.clientY;
      state.view.cx -= dx / state.view.scale;
      state.view.cy -= dy / state.view.scale;
      renderMap();
    });

    const endDrag = (ev) => {
      if (!dragging) return;
      dragging = false;
      mapEl.classList.remove('dragging');
      try {
        mapEl.releasePointerCapture(ev.pointerId);
      } catch (err) {
        /* pointer already released */
      }
    };
    mapEl.addEventListener('pointerup', endDrag);
    mapEl.addEventListener('pointercancel', endDrag);

    mapEl.addEventListener(
      'wheel',
      (ev) => {
        ev.preventDefault();
        const rect = mapEl.getBoundingClientRect();
        const mx = ev.clientX - rect.left;
        const my = ev.clientY - rect.top;
        // Keep the point under the cursor fixed while scaling.
        const ux = state.view.cx + (mx - rect.width / 2) / state.view.scale;
        const uy = state.view.cy + (my - rect.height / 2) / state.view.scale;
        const factor = Math.exp(-ev.deltaY * 0.0015);
        state.view.scale = clampScale(state.view.scale * factor);
        state.view.cx = ux - (mx - rect.width / 2) / state.view.scale;
        state.view.cy = uy - (my - rect.height / 2) / state.view.scale;
        renderMap();
      },
      { passive: false }
    );

    const zoomBy = (factor) => {
      state.view.scale = clampScale(state.view.scale * factor);
      renderMap();
    };
    $('#demo-zoom-in').addEventListener('click', () => zoomBy(1.5));
    $('#demo-zoom-out').addEventListener('click', () => zoomBy(1 / 1.5));
    $('#demo-zoom-fit').addEventListener('click', () => {
      fitToShows(state.shows);
      renderMap();
    });

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!state.selected) fitToShows(state.shows);
        renderMap();
      }, 120);
    });
  }

  // ---------- experience switching ----------

  function showExperience(name) {
    const isDemo = name === 'demo';
    document.body.classList.toggle('demo-active', isDemo);
    $('#experience-fun').classList.toggle('hidden', isDemo);
    $('#experience-demo').classList.toggle('hidden', !isDemo);
    document.querySelectorAll('#experience-tabs button').forEach((b) => {
      b.classList.toggle('active', b.dataset.experience === name);
    });
    try {
      localStorage.setItem('bscene-experience', name);
    } catch (err) {
      /* private browsing */
    }
    if (isDemo) {
      if (!state.ready) {
        initDemo();
      } else {
        // Container had no size while hidden — refit now that it's visible.
        if (!state.selected) fitToShows(state.shows);
        renderMap();
      }
    }
  }

  function initDemo() {
    mapEl = $('#demo-map');
    listEl = $('#demo-list');
    svgEl = $('#demo-map-svg');
    pinLayer = $('#demo-pins');
    infoBox = $('#demo-infobox');
    state.ready = true;

    bindMap();
    mapEl.addEventListener('click', (ev) => {
      if (!ev.target.closest('.demo-pin')) setHover(null);
    });

    $('#demo-prev').addEventListener('click', () => {
      const i = DATA.dates.indexOf(state.date);
      if (i > 0) setDate(DATA.dates[i - 1]);
    });
    $('#demo-next').addEventListener('click', () => {
      const i = DATA.dates.indexOf(state.date);
      if (i < DATA.dates.length - 1) setDate(DATA.dates[i + 1]);
    });

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const first = DATA.dates.includes(todayStr) ? todayStr : DATA.dates[0];
    setDate(first);
  }

  function init() {
    const tabs = $('#experience-tabs');
    if (!tabs) return;
    tabs.addEventListener('click', (ev) => {
      const btn = ev.target.closest('button[data-experience]');
      if (btn) showExperience(btn.dataset.experience);
    });

    let saved = 'fun';
    try {
      saved = localStorage.getItem('bscene-experience') || 'fun';
    } catch (err) {
      /* private browsing */
    }
    showExperience(saved);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
