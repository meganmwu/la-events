// LA Local — frontend. Loads pre-scraped events.json and renders a filterable,
// day/week-paginated list. No dependencies.

const state = {
  view: 'week', // 'day' | 'week'
  anchor: todayStr(), // date the day/week view is centered on
  category: 'all',
  genres: new Set(),
  freeOnly: false,
  q: '',
  calOpen: false,
  calMonth: todayStr().slice(0, 7), // 'YYYY-MM' shown in the calendar popover
};

let DATA = { events: [], categories: {} };
let datesWithEvents = new Set();

// ---------- date helpers (all local-time; event dates are LA-local strings) ----------

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseDate(str) {
  return new Date(`${str}T12:00:00`); // noon avoids DST edge cases
}

function fmtDate(str, opts) {
  return parseDate(str).toLocaleDateString('en-US', opts);
}

function shiftDate(str, days) {
  const d = parseDate(str);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Sunday-start week containing the anchor date.
function weekRange(anchor) {
  const start = shiftDate(anchor, -parseDate(anchor).getDay());
  return [start, shiftDate(start, 6)];
}

function fmtTime(hhmm) {
  if (!hhmm) return '';
  let [h, m] = hhmm.split(':').map(Number);
  const ampm = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return m ? `${h}:${String(m).padStart(2, '0')} ${ampm}` : `${h} ${ampm}`;
}

// ---------- filtering ----------

function visibleRange() {
  if (state.view === 'day') return [state.anchor, state.anchor];
  return weekRange(state.anchor);
}

// Filter with optional overrides so chip counts can ignore their own dimension.
function filterEvents({ ignoreCategory = false, ignoreGenres = false } = {}) {
  const [from, to] = visibleRange();
  const q = state.q.trim().toLowerCase();
  return DATA.events.filter((e) => {
    if (e.date < from || e.date > to) return false;
    if (state.freeOnly && e.isFree !== true) return false;
    if (!ignoreCategory && state.category !== 'all' && e.category !== state.category) return false;
    if (!ignoreGenres && state.category === 'music' && state.genres.size > 0) {
      if (!e.genres.some((g) => state.genres.has(g))) return false;
    }
    if (q) {
      const hay = `${e.title} ${e.venue || ''} ${e.description || ''} ${e.genres.join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

// ---------- rendering ----------

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

function renderMeta() {
  const when = DATA.scrapedAt ? new Date(DATA.scrapedAt) : null;
  $('#meta').textContent = when
    ? `${DATA.events.length} events · updated ${when.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${when.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
    : '';
}

function renderPeriodLabel() {
  const label = $('#period-label');
  if (state.view === 'day') {
    label.textContent = fmtDate(state.anchor, { weekday: 'short', month: 'long', day: 'numeric' });
  } else {
    const [from, to] = weekRange(state.anchor);
    const sameMonth = from.slice(0, 7) === to.slice(0, 7);
    label.textContent = `${fmtDate(from, { month: 'short', day: 'numeric' })} – ${fmtDate(to, sameMonth ? { day: 'numeric' } : { month: 'short', day: 'numeric' })}`;
  }
}

function renderCategoryChips() {
  const counts = {};
  for (const e of filterEvents({ ignoreCategory: true, ignoreGenres: true })) {
    counts[e.category] = (counts[e.category] || 0) + 1;
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const box = $('#category-chips');
  box.replaceChildren(
    chipButton('All', total, state.category === 'all', () => {
      state.category = 'all';
      render();
    }),
    ...Object.entries(DATA.categories)
      .filter(([key]) => counts[key])
      .map(([key, label]) =>
        chipButton(label, counts[key], state.category === key, () => {
          state.category = state.category === key ? 'all' : key;
          if (state.category !== 'music') state.genres.clear();
          render();
        })
      )
  );
}

function chipButton(label, count, active, onClick) {
  const btn = el('button', { class: `chip${active ? ' active' : ''}`, onclick: onClick });
  btn.append(label);
  if (count !== null && count !== undefined) btn.append(el('span', { class: 'count', text: String(count) }));
  return btn;
}

function renderGenreChips() {
  const row = $('#genre-chips');
  if (state.category !== 'music') {
    row.classList.add('hidden');
    return;
  }
  const counts = {};
  for (const e of filterEvents({ ignoreGenres: true })) {
    for (const g of e.genres) counts[g] = (counts[g] || 0) + 1;
  }
  const genres = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  row.classList.toggle('hidden', genres.length === 0);
  row.replaceChildren(
    ...genres.map(([g, n]) =>
      chipButton(g, n, state.genres.has(g), () => {
        state.genres.has(g) ? state.genres.delete(g) : state.genres.add(g);
        render();
      })
    )
  );
}

function badge(text, cls) {
  return el('span', { class: `badge ${cls}`, text });
}

function eventBadges(e) {
  const badges = [];
  if (e.org === 'USC') badges.push(badge('USC', 'badge-org-usc'));
  if (e.org === 'UCLA') badges.push(badge('UCLA', 'badge-org-ucla'));
  if (e.isFree === true) badges.push(badge('Free', 'badge-free'));
  if (e.soldOut) badges.push(badge('Sold out', 'badge-soldout'));
  return badges;
}

function eventTags(e) {
  // Category tag is only useful when the list is mixed; once a category filter
  // is active, rely on subcategory + genre tags to differentiate.
  const tags = [];
  if (state.category === 'all') {
    tags.push({ text: DATA.categories[e.category] || e.category, cls: 'tag tag-category' });
  }
  if (e.subcategory) tags.push({ text: e.subcategory, cls: 'tag' });
  for (const g of e.genres) tags.push({ text: g, cls: 'tag' });
  const seen = new Set();
  return tags
    .filter((t) => !seen.has(t.text.toLowerCase()) && seen.add(t.text.toLowerCase()))
    .map((t) => el('span', { class: t.cls, text: t.text }));
}

// Minimal card; full details live in the click-through modal.
function card(e) {
  const body = el('div', { class: 'card-body' });

  const top = el('div', { class: 'card-top' });
  if (e.time) top.append(el('span', { class: 'card-time', text: fmtTime(e.time) }));
  top.append(...eventBadges(e));
  body.append(top);

  body.append(el('h3', { class: 'card-title', text: e.title }));
  if (e.venue) body.append(el('div', { class: 'card-venue', text: e.venue }));
  if (e.shortDesc) body.append(el('div', { class: 'card-desc', text: e.shortDesc }));

  const tagEls = eventTags(e);
  if (tagEls.length) body.append(el('div', { class: 'card-tags' }, tagEls));

  const cardEl = el('article', {
    class: 'card',
    role: 'button',
    tabindex: '0',
    onclick: () => openModal(e),
    onkeydown: (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        openModal(e);
      }
    },
  });
  cardEl.append(body);
  return cardEl;
}

// ---------- detail modal (progressive disclosure) ----------

function closeModal() {
  const overlay = $('.modal-overlay');
  if (overlay) overlay.remove();
  document.body.style.overflow = '';
}

function openModal(e) {
  closeModal();
  const dialog = el('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true' });

  dialog.append(
    el('button', { class: 'modal-close', 'aria-label': 'Close', text: '×', onclick: closeModal })
  );

  if (e.imageUrl) {
    dialog.append(el('img', { class: 'modal-img', src: e.imageUrl, alt: '' }));
  }

  const body = el('div', { class: 'modal-body' });

  const top = el('div', { class: 'card-top' });
  top.append(...eventBadges(e));
  if (top.children.length) body.append(top);

  body.append(el('h2', { class: 'modal-title', text: e.title }));

  const when = `${fmtDate(e.date, { weekday: 'long', month: 'long', day: 'numeric' })}${e.time ? ` · ${fmtTime(e.time)}` : ''}`;
  const facts = el('dl', { class: 'modal-facts' });
  const fact = (label, value) => {
    facts.append(el('dt', { text: label }), el('dd', { text: value }));
  };
  fact('When', when);
  if (e.venue) fact('Where', e.address ? `${e.venue} — ${e.address}` : e.venue);
  if (e.isFree === true) fact('Price', 'Free');
  else if (e.priceText) fact('Price', e.priceText);
  fact('Listed on', e.sourceLabel);
  body.append(facts);

  const tagEls = eventTags(e);
  if (tagEls.length) body.append(el('div', { class: 'card-tags' }, tagEls));

  const desc = e.description && e.description !== e.shortDesc ? e.description : e.shortDesc;
  if (desc) body.append(el('p', { class: 'modal-desc', text: desc }));

  const actions = el('div', { class: 'modal-actions' });
  actions.append(el('a', { class: 'btn btn-primary', href: e.url, target: '_blank', rel: 'noopener', text: 'Event page ↗' }));
  if (e.ticketUrl && e.ticketUrl !== e.url) {
    actions.append(el('a', { class: 'btn', href: e.ticketUrl, target: '_blank', rel: 'noopener', text: 'Tickets ↗' }));
  }
  body.append(actions);
  dialog.append(body);

  const overlay = el('div', {
    class: 'modal-overlay',
    onclick: (ev) => {
      if (ev.target === overlay) closeModal();
    },
  });
  overlay.append(dialog);
  document.body.append(overlay);
  document.body.style.overflow = 'hidden';
}

function renderResults() {
  const box = $('#results');
  const events = filterEvents();

  if (events.length === 0) {
    box.replaceChildren(
      el('div', { class: 'empty' }, [
        el('p', {}, [el('strong', { text: 'No events match.' })]),
        el('p', { text: 'Try a different day or week, or loosen the filters above.' }),
      ])
    );
    return;
  }

  const byDay = new Map();
  for (const e of events) {
    if (!byDay.has(e.date)) byDay.set(e.date, []);
    byDay.get(e.date).push(e);
  }

  const groups = [...byDay.entries()].map(([date, dayEvents]) => {
    const heading = el('h2', {
      class: `day-heading${date === todayStr() ? ' today-heading' : ''}`,
    });
    heading.append(fmtDate(date, { weekday: 'long', month: 'long', day: 'numeric' }));
    heading.append(el('span', { class: 'day-count', text: `${dayEvents.length} event${dayEvents.length === 1 ? '' : 's'}` }));
    return el('section', { class: 'day-group' }, [
      heading,
      el('div', { class: 'card-grid' }, dayEvents.map(card)),
    ]);
  });

  box.replaceChildren(...groups);
}

// Month-grid popover. In week view a whole week highlights and gets picked;
// in day view a single day does.
function renderCalendar() {
  const cal = $('#calendar');
  $('#cal-btn').setAttribute('aria-expanded', String(state.calOpen));
  cal.classList.toggle('hidden', !state.calOpen);
  if (!state.calOpen) return;

  const monthStart = `${state.calMonth}-01`;
  const monthDate = parseDate(monthStart);
  const gridStart = shiftDate(monthStart, -monthDate.getDay()); // back to Sunday
  const [weekFrom, weekTo] = weekRange(state.anchor);
  const today = todayStr();

  const header = el('div', { class: 'cal-header' }, [
    el('button', {
      class: 'cal-nav',
      'aria-label': 'Previous month',
      text: '‹',
      onclick: (ev) => {
        ev.stopPropagation();
        state.calMonth = shiftDate(monthStart, -1).slice(0, 7);
        renderCalendar();
      },
    }),
    el('span', {
      class: 'cal-title',
      text: monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    }),
    el('button', {
      class: 'cal-nav',
      'aria-label': 'Next month',
      text: '›',
      onclick: (ev) => {
        ev.stopPropagation();
        state.calMonth = shiftDate(monthStart, 31).slice(0, 7);
        renderCalendar();
      },
    }),
  ]);

  const dow = el('div', { class: 'cal-row cal-dow' },
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => el('span', { text: d }))
  );

  const rows = [];
  let cursor = gridStart;
  for (let w = 0; w < 6; w++) {
    const cells = [];
    for (let d = 0; d < 7; d++) {
      const date = cursor;
      const classes = ['cal-cell'];
      if (date.slice(0, 7) !== state.calMonth) classes.push('other-month');
      if (date === today) classes.push('is-today');
      if (state.view === 'day' && date === state.anchor) classes.push('selected');
      if (state.view === 'week' && date >= weekFrom && date <= weekTo) classes.push('in-week');
      const cell = el('button', {
        class: classes.join(' '),
        onclick: () => {
          state.anchor = date;
          state.calOpen = false;
          render();
        },
      });
      cell.append(el('span', { class: 'cal-daynum', text: String(Number(date.slice(8, 10))) }));
      if (datesWithEvents.has(date)) cell.append(el('span', { class: 'cal-dot' }));
      cells.push(cell);
      cursor = shiftDate(cursor, 1);
    }
    rows.push(el('div', { class: 'cal-row' }, cells));
  }

  cal.className = `calendar${state.view === 'week' ? ' week-mode' : ''}`;
  cal.replaceChildren(header, dow, ...rows);
}

function render() {
  renderPeriodLabel();
  renderCategoryChips();
  renderGenreChips();
  renderCalendar();
  renderResults();
}

// ---------- events ----------

function bindControls() {
  $('#view-toggle').addEventListener('click', (ev) => {
    const btn = ev.target.closest('button[data-view]');
    if (!btn) return;
    state.view = btn.dataset.view;
    $('#view-toggle').querySelectorAll('button').forEach((b) => b.classList.toggle('active', b === btn));
    render();
  });

  $('#cal-btn').addEventListener('click', () => {
    state.calOpen = !state.calOpen;
    if (state.calOpen) state.calMonth = state.anchor.slice(0, 7);
    renderCalendar();
  });

  document.addEventListener('click', (ev) => {
    // A click that re-rendered the popover leaves its target detached from the
    // DOM — that's an inside interaction, not an outside click.
    if (!document.contains(ev.target)) return;
    if (state.calOpen && !ev.target.closest('#cal-btn') && !ev.target.closest('#calendar')) {
      state.calOpen = false;
      renderCalendar();
    }
  });

  document.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Escape') return;
    if ($('.modal-overlay')) {
      closeModal();
    } else if (state.calOpen) {
      state.calOpen = false;
      renderCalendar();
    }
  });

  const step = () => (state.view === 'day' ? 1 : 7);
  $('#prev').addEventListener('click', () => {
    state.anchor = shiftDate(state.anchor, -step());
    render();
  });
  $('#next').addEventListener('click', () => {
    state.anchor = shiftDate(state.anchor, step());
    render();
  });
  $('#today-btn').addEventListener('click', () => {
    state.anchor = todayStr();
    render();
  });

  $('#free-only').addEventListener('change', (ev) => {
    state.freeOnly = ev.target.checked;
    render();
  });

  $('#search').addEventListener('input', (ev) => {
    state.q = ev.target.value;
    render();
  });
}

// ---------- theme switcher ----------
// Palette experiment: each entry mirrors a theme block in styles.css.

const THEMES = [
  { id: 'fuchsia', name: 'Fuchsia (dark)', swatches: ['#0a0a0c', '#ff1053', '#a7d49b', '#623cea'] },
  { id: 'aqua', name: 'Aqua (dark)', swatches: ['#0a0a0c', '#97ead2', '#fdcff3', '#a42cd6'] },
  { id: 'light', name: 'Mint (light)', swatches: ['#ffffff', '#0d9668', '#9bedcb', '#7c2d2d'] },
];

function currentTheme() {
  return document.documentElement.getAttribute('data-theme') || THEMES[0].id;
}

function applyTheme(id) {
  document.documentElement.setAttribute('data-theme', id);
  try {
    localStorage.setItem('bscene-theme', id);
  } catch (err) {
    /* private browsing — theme just won't persist */
  }
  renderThemeSwitcher();
}

function renderThemeSwitcher() {
  const box = $('#theme-options');
  if (!box) return;
  const active = currentTheme();
  box.replaceChildren(
    ...THEMES.map((theme) => {
      const btn = el('button', {
        class: 'theme-option',
        type: 'button',
        title: theme.name,
        'aria-label': theme.name,
        'aria-pressed': String(theme.id === active),
        onclick: () => applyTheme(theme.id),
      });
      for (const color of theme.swatches) {
        btn.append(el('span', { class: 'sw', style: `background:${color}` }));
      }
      return btn;
    })
  );
}

// ---------- hero sequencer grid ----------
// Full-bleed grid of "sequencer" cells spelling the wordmark; a playhead
// column sweeps left to right, pulsing the cells it crosses.

const HERO_GLYPHS = {
  B: ['XXXX.', 'X...X', 'X...X', 'XXXX.', 'X...X', 'X...X', 'XXXX.'],
  '-': ['.....', '.....', '.....', '.XXX.', '.....', '.....', '.....'],
  S: ['.XXXX', 'X....', 'X....', '.XXX.', '....X', '....X', 'XXXX.'],
  C: ['.XXX.', 'X...X', 'X....', 'X....', 'X....', 'X...X', '.XXX.'],
  E: ['XXXXX', 'X....', 'X....', 'XXXX.', 'X....', 'X....', 'XXXXX'],
  N: ['X...X', 'XX..X', 'X.X.X', 'X..XX', 'X...X', 'X...X', 'X...X'],
};
const HERO_WORD = 'B-SCENE';
const GLYPH_W = 5;
const GLYPH_H = 7;
const WORD_COLS = HERO_WORD.length * (GLYPH_W + 1) - 1;
// Extra rows below leave room for the tagline/meta overlaid on the grid.
const PAD_TOP = 5;
const PAD_BOTTOM = 9;

let heroTimer = null;

function buildHero() {
  const grid = $('#hero-grid');
  if (!grid) return;
  if (heroTimer) clearInterval(heroTimer);

  const width = document.documentElement.clientWidth;
  const gap = width < 640 ? 3 : 4;
  // Fit the word with a little margin, but never let cells get huge.
  const pitch = Math.min(20, (width - 24) / (WORD_COLS + 4));
  const cell = Math.max(5, Math.floor(pitch - gap));
  const cols = Math.ceil(width / (cell + gap)) + 1; // overshoot to bleed off both edges
  const rows = GLYPH_H + PAD_TOP + PAD_BOTTOM;

  grid.style.setProperty('--hero-cell', `${cell}px`);
  grid.style.setProperty('--hero-gap', `${gap}px`);
  grid.style.gridTemplateColumns = `repeat(${cols}, ${cell}px)`;

  const lit = new Set();
  let x0 = Math.floor((cols - WORD_COLS) / 2);
  for (const ch of HERO_WORD) {
    const glyph = HERO_GLYPHS[ch];
    for (let r = 0; r < GLYPH_H; r++) {
      for (let c = 0; c < GLYPH_W; c++) {
        if (glyph[r][c] === 'X') lit.add(`${PAD_TOP + r},${x0 + c}`);
      }
    }
    x0 += GLYPH_W + 1;
  }

  const cells = [];
  const frag = document.createDocumentFragment();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const d = document.createElement('div');
      if (lit.has(`${r},${c}`)) {
        const roll = Math.random();
        d.className = `hero-cell ${roll < 0.07 ? 'mint' : roll < 0.12 ? 'maroon' : 'on'}`;
      } else {
        d.className = 'hero-cell off';
      }
      frag.append(d);
      cells.push(d);
    }
  }
  grid.replaceChildren(frag);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let head = -1;
  heroTimer = setInterval(() => {
    head = (head + 1) % (cols + 10); // brief pause off-screen between sweeps
    for (let i = 0; i < cells.length; i++) {
      cells[i].classList.toggle('head', i % cols === head);
    }
  }, 120);
}

let heroResizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(heroResizeTimer);
  heroResizeTimer = setTimeout(buildHero, 150);
});

async function init() {
  renderThemeSwitcher();
  buildHero();
  bindControls();
  // Served over HTTP: always fetch fresh JSON (script-tag data can go stale in
  // the browser cache). Opened from disk (file://) fetch is blocked, so fall
  // back to the data/events.js copy.
  try {
    const res = await fetch('data/events.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    DATA = await res.json();
  } catch (err) {
    if (window.EVENTS_DATA) {
      DATA = window.EVENTS_DATA;
    } else {
      $('#results').replaceChildren(
        el('div', { class: 'empty' }, [
          el('p', {}, [el('strong', { text: 'Could not load event data.' })]),
          el('p', { text: 'Run `python3 scraper/run.py` first to generate it.' }),
        ])
      );
      console.error(err);
      return;
    }
  }
  datesWithEvents = new Set(DATA.events.map((e) => e.date));
  renderMeta();
  render();
}

init();
