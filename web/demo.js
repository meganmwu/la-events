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

  // ---------- icons ----------
  // Microsoft Fluent System Icons (MIT), 20px regular set, inlined as path data.
  const ICONS = {
    payment: 'M13.5 13C13.2239 13 13 13.2239 13 13.5C13 13.7761 13.2239 14 13.5 14H15.5C15.7761 14 16 13.7761 16 13.5C16 13.2239 15.7761 13 15.5 13H13.5ZM2 6.75C2 5.23122 3.23122 4 4.75 4H15.25C16.7688 4 18 5.23122 18 6.75V13.25C18 14.7688 16.7688 16 15.25 16H4.75C3.23122 16 2 14.7688 2 13.25V6.75ZM4.75 5C3.7835 5 3 5.7835 3 6.75V8H17V6.75C17 5.7835 16.2165 5 15.25 5H4.75ZM17 9H3V13.25C3 14.2165 3.7835 15 4.75 15H15.25C16.2165 15 17 14.2165 17 13.25V9Z',
    checkmark_circle: 'M10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2ZM13.3584 7.64645C13.1849 7.47288 12.9154 7.4536 12.7206 7.58859L12.6513 7.64645L9 11.298L7.35355 9.65131L7.28431 9.59346C7.08944 9.45846 6.82001 9.47775 6.64645 9.65131C6.47288 9.82488 6.4536 10.0943 6.58859 10.2892L6.64645 10.3584L8.64645 12.3584L8.71569 12.4163C8.8862 12.5344 9.1138 12.5344 9.28431 12.4163L9.35355 12.3584L13.3584 8.35355L13.4163 8.28431C13.5513 8.08944 13.532 7.82001 13.3584 7.64645Z',
    ticket: 'M9.9434 2.59083C10.7244 1.80976 11.9905 1.80982 12.7715 2.59083L13.6788 3.49806C13.9793 3.79901 13.9439 4.23684 13.7423 4.51076C13.5897 4.71792 13.5001 4.97297 13.5001 5.25002C13.5002 5.94025 14.0598 6.50003 14.7501 6.50003C15.0262 6.49996 15.2801 6.40972 15.4874 6.25686L15.5977 6.18948C15.8501 6.06123 16.1859 6.05661 16.4434 6.2676L16.5011 6.32034L17.4181 7.23734C18.1988 8.01842 18.199 9.28548 17.4181 10.0665L10.0645 17.42C9.28355 18.201 8.0174 18.2007 7.23636 17.42L6.31936 16.503C6.01845 16.2019 6.05367 15.7634 6.25588 15.4893L6.3594 15.3253C6.44939 15.1532 6.49998 14.9578 6.50002 14.7501C6.50002 14.0598 5.94024 13.5002 5.25002 13.5001C4.97219 13.5001 4.71702 13.5905 4.50978 13.7432C4.23601 13.9451 3.79735 13.9804 3.4961 13.6798L2.58985 12.7735C1.80882 11.9924 1.80882 10.7254 2.58985 9.94438L9.9434 2.59083ZM12.0645 3.29786C11.674 2.90734 11.0409 2.90736 10.6504 3.29786L8.83207 5.11525L9.90239 6.18557C10.0974 6.38083 10.0976 6.69744 9.90239 6.89261C9.70722 7.08778 9.39061 7.08763 9.19535 6.89261L8.12503 5.82229L3.29688 10.6514C2.90637 11.042 2.90636 11.6759 3.29688 12.0665L4.06642 12.836C4.41032 12.623 4.81643 12.5001 5.25002 12.5001C6.49253 12.5002 7.50003 13.5075 7.50003 14.7501C7.49997 15.1839 7.37508 15.5886 7.16214 15.9317L7.94339 16.713C8.33395 17.1032 8.96708 17.1034 9.35746 16.713L14.1866 11.8838L13.1094 10.8067C12.9142 10.6114 12.9142 10.2949 13.1094 10.0997C13.3047 9.90442 13.6212 9.90441 13.8165 10.0997L14.8936 11.1768L16.711 9.35942C17.1014 8.96898 17.1012 8.33493 16.711 7.94437L15.9298 7.16312C15.5873 7.37542 15.1834 7.49998 14.7501 7.50003C13.5075 7.50003 12.5002 6.49253 12.5001 5.25002C12.5001 4.81696 12.6226 4.41159 12.835 4.06837L12.0645 3.29786ZM10.6094 7.59964C10.8047 7.4044 11.1212 7.4044 11.3165 7.59964L12.4024 8.68559C12.5974 8.88084 12.5976 9.19745 12.4024 9.39262C12.2072 9.58779 11.8906 9.58764 11.6954 9.39262L10.6094 8.30668C10.4142 8.11143 10.4142 7.79488 10.6094 7.59964Z',
    location: 'M5.05043 4.05139C7.7841 1.31653 12.2162 1.31653 14.9498 4.05139C17.6833 6.78621 17.6833 11.2199 14.9498 13.9547L13.8219 15.069L11.3864 17.4391C10.6565 18.1455 9.52149 18.1843 8.74672 17.5563L8.61391 17.4391L6.57094 15.4537L5.05043 13.9547C2.31681 11.2199 2.3168 6.78625 5.05043 4.05139ZM14.2448 4.75647C11.9003 2.41099 8.09899 2.41099 5.75454 4.75647C3.47055 7.04183 3.41265 10.7109 5.57973 13.067L5.75454 13.2496L6.32582 13.817L9.30727 16.7223L9.40004 16.8024C9.7542 17.0701 10.2461 17.07 10.6002 16.8024L10.693 16.7223L12.9235 14.5543L14.2448 13.2496L14.4206 13.067C16.5877 10.7107 16.5291 7.04181 14.2448 4.75647ZM9.99965 6.24963C11.5183 6.24963 12.7495 7.48102 12.7497 8.99963C12.7497 10.5184 11.5184 11.7496 9.99965 11.7496C8.48103 11.7494 7.24965 10.5183 7.24965 8.99963C7.24985 7.48113 8.48115 6.24982 9.99965 6.24963ZM9.99965 7.24963C9.03343 7.24982 8.24985 8.03342 8.24965 8.99963C8.24965 9.96602 9.03331 10.7494 9.99965 10.7496C10.9662 10.7496 11.7497 9.96613 11.7497 8.99963C11.7495 8.0333 10.966 7.24963 9.99965 7.24963Z',
    chevron_left: 'M12.3534 15.8537C12.1585 16.0493 11.8419 16.0499 11.6463 15.855L6.16178 10.39C5.94607 10.1751 5.94607 9.82574 6.16178 9.6108L11.6463 4.14582C11.8419 3.9509 12.1585 3.95147 12.3534 4.14708C12.5483 4.34269 12.5477 4.65927 12.3521 4.85418L7.18753 10.0004L12.3521 15.1466C12.5477 15.3415 12.5483 15.6581 12.3534 15.8537Z',
    chevron_right: 'M7.64582 4.14708C7.84073 3.95147 8.15731 3.9509 8.35292 4.14582L13.8374 9.6108C14.0531 9.82574 14.0531 10.1751 13.8374 10.39L8.35292 15.855C8.15731 16.0499 7.84073 16.0493 7.64582 15.8537C7.4509 15.6581 7.45147 15.3415 7.64708 15.1466L12.8117 10.0004L7.64708 4.85418C7.45147 4.65927 7.4509 4.34269 7.64582 4.14708Z',
    dismiss: 'M4.08859 4.21569L4.14645 4.14645C4.32001 3.97288 4.58944 3.9536 4.78431 4.08859L4.85355 4.14645L10 9.293L15.1464 4.14645C15.32 3.97288 15.5894 3.9536 15.7843 4.08859L15.8536 4.14645C16.0271 4.32001 16.0464 4.58944 15.9114 4.78431L15.8536 4.85355L10.707 10L15.8536 15.1464C16.0271 15.32 16.0464 15.5894 15.9114 15.7843L15.8536 15.8536C15.68 16.0271 15.4106 16.0464 15.2157 15.9114L15.1464 15.8536L10 10.707L4.85355 15.8536C4.67999 16.0271 4.41056 16.0464 4.21569 15.9114L4.14645 15.8536C3.97288 15.68 3.9536 15.4106 4.08859 15.2157L4.14645 15.1464L9.293 10L4.14645 4.85355C3.97288 4.67999 3.9536 4.41056 4.08859 4.21569L4.14645 4.14645L4.08859 4.21569Z',
    arrow_expand: 'M3.5 3C3.22386 3 3 3.22386 3 3.5V7.5C3 7.77614 3.22386 8 3.5 8C3.77614 8 4 7.77614 4 7.5V4.70711L7.14645 7.85355C7.34171 8.04882 7.65829 8.04882 7.85355 7.85355C8.04882 7.65829 8.04882 7.34171 7.85355 7.14645L4.70711 4H7.5C7.77614 4 8 3.77614 8 3.5C8 3.22386 7.77614 3 7.5 3H3.5ZM3.5 17C3.22386 17 3 16.7761 3 16.5V12.5C3 12.2239 3.22386 12 3.5 12C3.77614 12 4 12.2239 4 12.5V15.2929L7.14645 12.1464C7.34171 11.9512 7.65829 11.9512 7.85355 12.1464C8.04882 12.3417 8.04882 12.6583 7.85355 12.8536L4.70711 16H7.5C7.77614 16 8 16.2239 8 16.5C8 16.7761 7.77614 17 7.5 17H3.5ZM17 3.5C17 3.22386 16.7761 3 16.5 3H12.5C12.2239 3 12 3.22386 12 3.5C12 3.77614 12.2239 4 12.5 4H15.2929L12.1464 7.14645C11.9512 7.34171 11.9512 7.65829 12.1464 7.85355C12.3417 8.04882 12.6583 8.04882 12.8536 7.85355L16 4.70711V7.5C16 7.77614 16.2239 8 16.5 8C16.7761 8 17 7.77614 17 7.5V3.5ZM16.5 17C16.7761 17 17 16.7761 17 16.5V12.5C17 12.2239 16.7761 12 16.5 12C16.2239 12 16 12.2239 16 12.5V15.2929L12.8536 12.1464C12.6583 11.9512 12.3417 11.9512 12.1464 12.1464C11.9512 12.3417 11.9512 12.6583 12.1464 12.8536L15.2929 16H12.5C12.2239 16 12 16.2239 12 16.5C12 16.7761 12.2239 17 12.5 17H16.5Z',
    add: 'M10 2.5C10.2761 2.5 10.5 2.72386 10.5 3V9.5H17C17.2761 9.5 17.5 9.72386 17.5 10C17.5 10.2761 17.2761 10.5 17 10.5H10.5V17C10.5 17.2761 10.2761 17.5 10 17.5C9.72386 17.5 9.5 17.2761 9.5 17V10.5H3C2.72386 10.5 2.5 10.2761 2.5 10C2.5 9.72386 2.72386 9.5 3 9.5H9.5V3C9.5 2.72386 9.72386 2.5 10 2.5Z',
    checkmark: 'M7.03212 13.9072L3.56056 10.0017C3.28538 9.69214 2.81132 9.66425 2.50174 9.93944C2.19215 10.2146 2.16426 10.6887 2.43945 10.9983L6.43945 15.4983C6.72614 15.8208 7.2252 15.8355 7.53034 15.5303L18.0303 5.03033C18.3232 4.73744 18.3232 4.26256 18.0303 3.96967C17.7374 3.67678 17.2626 3.67678 16.9697 3.96967L7.03212 13.9072Z'
  };

  function icon(name, cls = '') {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 20 20');
    svg.setAttribute('class', `fi${cls ? ' ' + cls : ''}`);
    svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', ICONS[name]);
    path.setAttribute('fill', 'currentColor');
    svg.append(path);
    return svg;
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
        ]),
        el('div', { class: 'demo-row-artist', text: show.artist }),
        el('div', { class: 'demo-row-venue' }, [
          icon('location', 'demo-loc-icon'),
          el('span', { text: `${show.venue} · ${show.neighborhood} · ${fmtMiles(show.miles)}` }),
        ]),
        el('div', { class: 'demo-row-tags' }, [el('span', { class: 'tag', text: show.genre })])
      );
      return row;
    });

    listEl.replaceChildren(
      el('div', { class: 'demo-list-head' }, [
        el('span', { class: 'demo-list-count', text: `${state.shows.length} shows` }),
      ]),
      el('div', { class: 'demo-rows' }, rows)
    );
  }

  function ticketRow(show) {
    const row = el('div', { class: 'demo-ticket-row' });
    const free = show.price === 0;

    if (purchased.has(show.id)) {
      const owned = el('div', { class: 'demo-owned' });
      owned.append(icon('checkmark_circle'), document.createTextNode(free ? 'Spot reserved' : 'Tickets bought'));
      row.append(
        owned,
        el('button', {
          class: 'demo-buy-more',
          type: 'button',
          text: free ? 'Reserve another spot' : 'Buy more tickets',
          onclick: () => openCheckout(show),
        })
      );
    } else {
      row.append(
        el('button', {
          class: 'btn btn-primary',
          type: 'button',
          text: free ? 'Reserve a spot' : `Buy ticket · ${show.priceText}`,
          onclick: () => openCheckout(show),
        })
      );
    }
    return row;
  }

  // Checkout runs on top of the open detail pane — swap its ticket area once
  // the purchase lands.
  function refreshTicketRow(show) {
    const existing = $('.demo-ticket-row');
    if (existing && state.selected && state.selected.id === show.id) {
      existing.replaceWith(ticketRow(show));
    }
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
      (() => {
        const b = el('button', { class: 'demo-back', type: 'button', onclick: closeDetail });
        b.append(icon('chevron_left'), document.createTextNode('All shows'));
        return b;
      })(),
      el('div', { class: 'demo-detail-body' }, [
        el('div', { class: 'demo-detail-eyebrow' }, [
          el('span', { class: 'tag tag-category', text: show.genre }),
          ...(show.price === 0 ? [el('span', { class: 'badge badge-free', text: 'Free' })] : []),
        ]),
        ...(show.poster
          ? [
              el('div', { class: 'demo-poster-wrap' }, [
                el('button', {
                  class: 'demo-poster-btn',
                  type: 'button',
                  'aria-label': `${show.artist} poster — click to enlarge`,
                  onclick: () => openPoster(show),
                }, [el('img', { class: 'demo-poster', src: show.poster, alt: `${show.artist} poster` })]),
                (() => {
                  const b = el('button', { class: 'demo-poster-expand', type: 'button', 'aria-label': 'Expand poster', onclick: () => openPoster(show) });
                  b.append(icon('arrow_expand'));
                  return b;
                })(),
              ]),
            ]
          : []),
        el('div', { class: 'demo-artist-row' }, [
          el('button', {
            class: 'demo-avatar-btn',
            type: 'button',
            'aria-label': `${show.artist} profile`,
            onclick: () => openArtist(show),
          }, [artistAvatar(show.artist)]),
          el('h2', { class: 'demo-detail-artist' }, [
            el('button', { class: 'demo-artist-name', type: 'button', text: show.artist, onclick: () => openArtist(show) }),
          ]),
          followButton(show.artist, 'demo-follow-sm'),
        ]),
        ...(show.title ? [el('p', { class: 'demo-detail-title', text: show.title })] : []),
        facts,
        ticketRow(show),
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

  // ---------- artist profile ----------

  const followed = (() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('bscene-follows') || '[]'));
    } catch (err) {
      return new Set();
    }
  })();

  function seedFollows() {
    if (followed.size) return;
    for (const name of (DATA.profile && DATA.profile.following) || []) followed.add(name);
    saveFollows();
  }

  function saveFollows() {
    try {
      localStorage.setItem('bscene-follows', JSON.stringify([...followed]));
    } catch (err) {
      /* private browsing */
    }
  }

  function toggleFollow(artist) {
    if (followed.has(artist)) followed.delete(artist);
    else followed.add(artist);
    saveFollows();
    resolveArtistImages();
    // The same artist can have a follow button in the detail pane and the
    // profile popup at once — keep every copy in step.
    const on = followed.has(artist);
    document.querySelectorAll('.demo-follow').forEach((btn) => {
      if (btn.dataset.artist === artist) paintFollow(btn, on);
    });
  }

  function paintFollow(btn, on) {
    btn.replaceChildren(icon(on ? 'checkmark' : 'add'), document.createTextNode(on ? 'Following' : 'Follow'));
    btn.classList.toggle('following', on);
  }

  function followButton(artist, extraClass = '') {
    const btn = el('button', {
      class: `demo-follow${extraClass ? ' ' + extraClass : ''}`,
      type: 'button',
      'data-artist': artist,
      onclick: (ev) => {
        ev.stopPropagation();
        toggleFollow(artist);
      },
    });
    paintFollow(btn, followed.has(artist));
    return btn;
  }

  function initials(name) {
    return name
      .replace(/^The\s+/i, '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');
  }

  const ARTIST_IMAGES = DATA.artistImages || {};
  const IMAGE_POOL = [...new Set(Object.values(ARTIST_IMAGES))];
  let artistImageMap = { ...ARTIST_IMAGES };

  // There are fewer filler photos than artists, so the base mapping repeats.
  // Artists shown side by side (the ones you follow) get pushed onto unused
  // photos, and the result is reused everywhere so an artist looks the same
  // in their tile, the show detail and their profile.
  function resolveArtistImages() {
    const resolved = { ...ARTIST_IMAGES };
    const used = new Set();
    for (const name of [...followed].sort()) {
      let src = resolved[name];
      if (!src || used.has(src)) {
        const free = IMAGE_POOL.find((candidate) => !used.has(candidate));
        if (free) src = free;
      }
      resolved[name] = src;
      used.add(src);
    }
    artistImageMap = resolved;
  }

  // Photo when we have one, initials otherwise.
  function avatarEl(name, src, sizeClass = '') {
    const wrap = el('span', { class: `demo-avatar${sizeClass ? ' ' + sizeClass : ''}${src ? ' has-img' : ''}` });
    if (src) wrap.append(el('img', { class: 'demo-avatar-img', src, alt: '' }));
    else wrap.textContent = initials(name);
    return wrap;
  }

  function artistAvatar(name, sizeClass = '') {
    return avatarEl(name, artistImageMap[name], sizeClass);
  }

  function profileAvatar(sizeClass = '') {
    return avatarEl(PROFILE ? PROFILE.name : '', PROFILE && PROFILE.image, sizeClass);
  }

  function handleFor(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '');
  }

  function closeArtist() {
    const box = $('.demo-artist-overlay');
    if (box) box.remove();
    if (!$('.demo-lightbox')) document.body.classList.remove('lightbox-open');
  }

  function openArtist(show) {
    closeArtist();
    const artist = show.artist;
    const handle = handleFor(artist);
    const bio = (show.description || '').split('\n\n')[0];
    const upcoming = DATA.shows
      .filter((s) => s.artist === artist && s.date >= state.date)
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

    const followBtn = followButton(artist);

    const socials = ['Instagram', 'Spotify', 'Bandcamp'].map((net) =>
      el('a', {
        class: 'demo-social',
        href: '#',
        onclick: (ev) => ev.preventDefault(),
      }, [
        el('span', { class: 'demo-social-net', text: net }),
        el('span', { class: 'demo-social-handle', text: `@${handle}` }),
      ])
    );

    const shows = upcoming.map((s) =>
      el('button', {
        class: `demo-artist-show${s.id === show.id ? ' current' : ''}`,
        type: 'button',
        onclick: () => {
          closeArtist();
          if (s.date !== state.date) setDate(s.date);
          const target = state.shows.find((x) => x.id === s.id);
          if (target) openDetail(target);
        },
      }, [
        el('span', { class: 'demo-artist-show-date', text: fmtDate(s.date, { weekday: 'short', month: 'short', day: 'numeric' }) }),
        el('span', { class: 'demo-artist-show-venue', text: `${s.venue} · ${s.neighborhood}` }),
        el('span', { class: 'demo-artist-show-price', text: s.priceText }),
      ])
    );

    const modal = el('div', { class: 'demo-artist-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': artist });
    modal.append(
      (() => {
        const b = el('button', { class: 'demo-artist-close', type: 'button', 'aria-label': 'Close', onclick: closeArtist });
        b.append(icon('dismiss'));
        return b;
      })(),
      el('div', { class: 'demo-artist-head' }, [
        artistAvatar(artist, 'demo-avatar-lg'),
        el('div', { class: 'demo-artist-headtext' }, [
          el('h2', { class: 'demo-artist-name-lg', text: artist }),
          el('div', { class: 'demo-artist-genre', text: show.genre }),
        ]),
        followBtn,
      ]),
      el('div', { class: 'demo-artist-section' }, [
        el('h3', { class: 'demo-section-title', text: 'Bio' }),
        el('p', { class: 'demo-para', text: bio }),
      ]),
      el('div', { class: 'demo-artist-section' }, [
        el('h3', { class: 'demo-section-title', text: 'Social' }),
        el('div', { class: 'demo-socials' }, socials),
      ]),
      el('div', { class: 'demo-artist-section' }, [
        el('h3', { class: 'demo-section-title', text: `Upcoming on B-Scene (${upcoming.length})` }),
        el('div', { class: 'demo-artist-shows' }, shows),
      ])
    );

    const overlay = el('div', {
      class: 'demo-artist-overlay',
      onclick: (ev) => {
        if (ev.target === ev.currentTarget) closeArtist();
      },
    });
    overlay.append(modal);
    document.body.append(overlay);
    document.body.classList.add('lightbox-open');
  }


  // ---------- checkout (demo only) ----------
  // Nothing is transmitted and no card can be typed in — the saved card is
  // fabricated and rendered read-only, so this is a mock of the flow only.

  const SERVICE_FEE = 4.5;

  const purchased = (() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('bscene-purchases') || '[]'));
    } catch (err) {
      return new Set();
    }
  })();

  function savePurchases() {
    try {
      localStorage.setItem('bscene-purchases', JSON.stringify([...purchased]));
    } catch (err) {
      /* private browsing */
    }
  }

  function orderRef() {
    let out = 'BSC-';
    for (let i = 0; i < 6; i++) out += 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)];
    return out;
  }

  function closeCheckout() {
    const box = $('.demo-checkout-overlay');
    if (box) box.remove();
    if (!$('.demo-lightbox') && !$('.demo-artist-overlay') && !$('.demo-profile-overlay')) {
      document.body.classList.remove('lightbox-open');
    }
  }

  function openCheckout(show) {
    closeCheckout();
    const free = show.price === 0;
    const card = (PROFILE && PROFILE.payment) || { brand: 'Visa', last4: '4242', exp: '04/29' };
    const total = free ? 0 : show.price + SERVICE_FEE;

    const panel = el('div', { class: 'demo-checkout', role: 'dialog', 'aria-modal': 'true', 'aria-label': free ? 'Reserve a spot' : 'Checkout' });
    const overlay = el('div', {
      class: 'demo-checkout-overlay',
      onclick: (ev) => {
        if (ev.target === ev.currentTarget) closeCheckout();
      },
    });
    overlay.append(panel);
    document.body.append(overlay);
    document.body.classList.add('lightbox-open');

    const money = (n) => `$${n.toFixed(2)}`;

    function summaryRows() {
      const rows = el('dl', { class: 'demo-checkout-lines' });
      const line = (k, v, cls = '') => rows.append(el('dt', { text: k }), el('dd', { class: cls, text: v }));
      if (free) {
        line('Admission', 'Free');
      } else {
        line('Ticket · General admission', money(show.price));
        line('Service fee', money(SERVICE_FEE));
        line('Total', money(total), 'demo-total');
      }
      return rows;
    }

    function showHeader() {
      return el('div', { class: 'demo-checkout-show' }, [
        artistAvatar(show.artist, 'demo-avatar-sm'),
        el('div', {}, [
          el('div', { class: 'demo-checkout-artist', text: show.artist }),
          el('div', { class: 'demo-checkout-meta', text: `${fmtDate(show.date, { weekday: 'short', month: 'short', day: 'numeric' })} · ${fmtTime(show.time)} · ${show.venue}` }),
        ]),
      ]);
    }

    function renderReview() {
      const close = el('button', { class: 'demo-artist-close', type: 'button', 'aria-label': 'Close', onclick: closeCheckout });
      close.append(icon('dismiss'));

      const payBtn = el('button', {
        class: 'btn btn-primary demo-pay-btn',
        type: 'button',
        onclick: renderProcessing,
      });
      payBtn.append(free ? icon('ticket') : icon('payment'), document.createTextNode(free ? 'Confirm RSVP' : `Pay ${money(total)}`));

      panel.replaceChildren(
        close,
        el('h2', { class: 'demo-checkout-title', text: free ? 'Reserve a spot' : 'Checkout' }),
        showHeader(),
        summaryRows(),
        ...(free
          ? []
          : [
              el('div', { class: 'demo-checkout-section' }, [
                el('h3', { class: 'demo-section-title', text: 'Payment method' }),
                el('div', { class: 'demo-card' }, [
                  icon('payment', 'demo-card-icon'),
                  el('div', { class: 'demo-card-text' }, [
                    el('div', { class: 'demo-card-num', text: `${card.brand} ···· ${card.last4}` }),
                    el('div', { class: 'demo-card-exp', text: `Expires ${card.exp} · saved to your account` }),
                  ]),
                  el('span', { class: 'demo-card-change', text: 'Change' }),
                ]),
              ]),
            ]),
        payBtn,
        el('p', { class: 'demo-fineprint', text: 'Demo checkout — no payment is processed.' })
      );
    }

    function renderProcessing() {
      panel.replaceChildren(
        el('div', { class: 'demo-checkout-state' }, [
          el('div', { class: 'demo-spinner' }),
          el('p', { class: 'demo-para', text: free ? 'Reserving your spot…' : 'Processing payment…' }),
        ])
      );
      setTimeout(renderDone, 1100);
    }

    function renderDone() {
      purchased.add(show.id);
      savePurchases();
      refreshTicketRow(show);

      const close = el('button', { class: 'demo-artist-close', type: 'button', 'aria-label': 'Close', onclick: closeCheckout });
      close.append(icon('dismiss'));

      const done = el('button', { class: 'btn btn-primary demo-pay-btn', type: 'button', text: 'Done', onclick: closeCheckout });

      panel.replaceChildren(
        close,
        el('div', { class: 'demo-confirm-head' }, [
          icon('checkmark_circle', 'demo-confirm-icon'),
          el('h2', { class: 'demo-checkout-title', text: free ? "You're on the list" : "You're going" }),
          el('p', { class: 'demo-para', text: free ? 'Your spot is reserved. Show this at the door.' : `Paid ${money(total)} with ${card.brand} ···· ${card.last4}.` }),
        ]),
        showHeader(),
        el('dl', { class: 'demo-checkout-lines' }, [
          el('dt', { text: 'Order' }),
          el('dd', { text: orderRef() }),
          el('dt', { text: 'Doors' }),
          el('dd', { text: fmtTime(show.doors) }),
          el('dt', { text: 'Meetup' }),
          el('dd', { text: `${show.meetup.name} · ${show.meetup.walk} min walk` }),
        ]),
        el('p', { class: 'demo-para', text: 'Added to your upcoming shows.' }),
        done
      );
    }

    renderReview();
  }

  // ---------- user profile ----------

  const PROFILE = DATA.profile || null;

  function showById(id) {
    return DATA.shows.find((s) => s.id === id);
  }

  function closeProfile() {
    const box = $('.demo-profile-overlay');
    if (box) box.remove();
    if (!$('.demo-lightbox') && !$('.demo-artist-overlay')) {
      document.body.classList.remove('lightbox-open');
    }
  }

  function openProfile() {
    if (!PROFILE) return;
    closeProfile();

    const overlay = el('div', { class: 'demo-profile-overlay', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Your profile' });
    const body = el('div', { class: 'demo-profile-body' });
    overlay.append(body);
    document.body.append(overlay);
    document.body.classList.add('lightbox-open');
    renderProfileHome(body);
  }

  // ---- shared row builders ----

  function goToShow(s) {
    closeProfile();
    if (s.date !== state.date) setDate(s.date);
    const target = state.shows.find((x) => x.id === s.id);
    if (target) openDetail(target);
  }

  function showRow(date, artist, venue, hood, onclick) {
    return el(onclick ? 'button' : 'div', {
      class: 'demo-artist-show',
      ...(onclick ? { type: 'button', onclick } : {}),
    }, [
      el('span', { class: 'demo-artist-show-date', text: fmtDate(date, { month: 'short', day: 'numeric', year: 'numeric' }) }),
      el('span', { class: 'demo-artist-show-venue' }, [
        icon('location', 'demo-loc-icon'),
        el('span', { text: `${artist} · ${venue}` }),
      ]),
      el('span', { class: 'demo-artist-show-price', text: hood }),
    ]);
  }

  function friendRow(f) {
    return el('div', { class: 'demo-friend' }, [
      el('span', { class: 'demo-avatar demo-avatar-sm', text: initials(f.name) }),
      el('div', { class: 'demo-friend-text' }, [
        el('div', { class: 'demo-friend-name', text: f.name }),
        el('div', { class: 'demo-friend-handle', text: `@${f.handle}` }),
      ]),
      ...(f.sharedCount
        ? [el('span', { class: 'demo-friend-badge', text: `Attended ${f.sharedCount} concert${f.sharedCount === 1 ? '' : 's'} together` })]
        : []),
    ]);
  }

  function artistTile(name) {
    return el('button', {
      class: 'demo-artist-tile',
      type: 'button',
      onclick: () => {
        const next = DATA.shows
          .filter((s) => s.artist === name && s.date >= state.date)
          .sort((a, b) => a.date.localeCompare(b.date))[0];
        if (next) goToShow(next);
      },
    }, [
      artistAvatar(name, 'demo-avatar-xl'),
      el('span', { class: 'demo-artist-tile-name', text: name }),
    ]);
  }

  function sectionHead(title, viewAllLabel, onViewAll) {
    const head = el('div', { class: 'demo-section-head' }, [
      el('h3', { class: 'demo-profile-title', text: title }),
    ]);
    if (onViewAll) {
      const link = el('button', { class: 'demo-viewall', type: 'button', onclick: onViewAll });
      link.append(document.createTextNode(viewAllLabel), icon('chevron_right'));
      head.append(link);
    }
    return head;
  }

  function profileSubpage(body, title, content) {
    const back = el('button', { class: 'demo-back-link', type: 'button', onclick: () => renderProfileHome(body) });
    back.append(icon('chevron_left'), document.createTextNode('Back'));
    body.replaceChildren(
      back,
      el('h2', { class: 'demo-subpage-title', text: title }),
      content
    );
    body.parentElement.scrollTop = 0;
  }

  function upcomingShows() {
    return [...new Set([...PROFILE.going, ...purchased])].map(showById).filter(Boolean)
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  }

  function renderProfileHome(body) {
    const going = upcomingShows();
    const followingNames = [...followed].sort();

    const close = el('button', { class: 'demo-profile-close', type: 'button', 'aria-label': 'Close profile', onclick: closeProfile });
    close.append(icon('dismiss'));

    body.replaceChildren(
      close,
      el('div', { class: 'demo-artist-head' }, [
        profileAvatar('demo-avatar-lg'),
        el('div', { class: 'demo-artist-headtext' }, [
          el('h2', { class: 'demo-artist-name-lg', text: PROFILE.name }),
          el('div', { class: 'demo-artist-genre', text: `@${PROFILE.handle} · ${PROFILE.city}` }),
        ]),
      ]),

      el('div', { class: 'demo-artist-section' }, [
        sectionHead(`Upcoming shows (${going.length})`, 'See all shows', () => renderAllShows(body)),
        going.length
          ? el('div', { class: 'demo-artist-shows' }, going.map((s) => showRow(s.date, s.artist, s.venue, s.neighborhood, () => goToShow(s))))
          : el('p', { class: 'demo-para', text: 'Nothing on the calendar yet.' }),
      ]),

      el('div', { class: 'demo-artist-section' }, [
        sectionHead(`Your artists (${followingNames.length})`, 'View all', followingNames.length > 6 ? () => renderAllArtists(body) : null),
        followingNames.length
          ? el('div', { class: 'demo-artist-grid' }, followingNames.slice(0, 6).map(artistTile))
          : el('p', { class: 'demo-para', text: 'Follow artists from their profile to see them here.' }),
      ]),

      el('div', { class: 'demo-artist-section' }, [
        sectionHead(`Friends (${PROFILE.friends.length})`, 'View all', PROFILE.friends.length > 4 ? () => renderAllFriends(body) : null),
        el('div', { class: 'demo-friends' }, PROFILE.friends.slice(0, 4).map(friendRow)),
      ])
    );
    body.parentElement.scrollTop = 0;
  }

  function renderAllShows(body) {
    const going = upcomingShows();
    const content = el('div', {});
    content.append(
      el('h3', { class: 'demo-profile-title', text: `Upcoming (${going.length})` }),
      el('div', { class: 'demo-artist-shows' },
        going.length
          ? going.map((s) => showRow(s.date, s.artist, s.venue, s.neighborhood, () => goToShow(s)))
          : [el('p', { class: 'demo-para', text: 'Nothing on the calendar yet.' })]
      ),
      el('h3', { class: 'demo-profile-title demo-spaced', text: `Past (${PROFILE.attended.length})` }),
      el('div', { class: 'demo-artist-shows' },
        PROFILE.attended.map((a) => showRow(a.date, a.artist, a.venue, a.neighborhood, null))
      )
    );
    profileSubpage(body, 'All shows', content);
  }

  function renderAllArtists(body) {
    const names = [...followed].sort();
    profileSubpage(body, 'Your artists', el('div', { class: 'demo-artist-grid' }, names.map(artistTile)));
  }

  function renderAllFriends(body) {
    profileSubpage(body, 'Friends', el('div', { class: 'demo-friends' }, PROFILE.friends.map(friendRow)));
  }

  function closePoster() {
    const box = $('.demo-lightbox');
    if (box) box.remove();
    document.body.classList.remove('lightbox-open');
  }

  function openPoster(show) {
    closePoster();
    const box = el('div', {
      class: 'demo-lightbox',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': `${show.artist} poster`,
      onclick: (ev) => {
        if (!ev.target.closest('.demo-lightbox-img')) closePoster();
      },
    });
    box.append(
      (() => {
        const b = el('button', { class: 'demo-lightbox-close', type: 'button', 'aria-label': 'Close poster', onclick: closePoster });
        b.append(icon('dismiss'));
        return b;
      })(),
      el('img', { class: 'demo-lightbox-img', src: show.poster, alt: `${show.artist} poster` })
    );
    document.body.append(box);
    document.body.classList.add('lightbox-open');
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


  // ---------- date picker ----------

  let calMonth = null; // 'YYYY-MM'

  function closeDemoCal() {
    $('#demo-calendar').classList.add('hidden');
    $('#demo-date-btn').setAttribute('aria-expanded', 'false');
  }

  function renderDemoCal() {
    const cal = $('#demo-calendar');
    const monthStart = `${calMonth}-01`;
    const monthDate = parseDate(monthStart);
    const gridStart = shiftDate(monthStart, -monthDate.getDay());
    const available = new Set(DATA.dates);

    const head = el('div', { class: 'cal-header' });
    const prev = el('button', { class: 'cal-nav', type: 'button', 'aria-label': 'Previous month', onclick: (ev) => { ev.stopPropagation(); calMonth = shiftDate(monthStart, -1).slice(0, 7); renderDemoCal(); } });
    prev.append(icon('chevron_left'));
    const next = el('button', { class: 'cal-nav', type: 'button', 'aria-label': 'Next month', onclick: (ev) => { ev.stopPropagation(); calMonth = shiftDate(monthStart, 31).slice(0, 7); renderDemoCal(); } });
    next.append(icon('chevron_right'));
    head.append(prev, el('span', { class: 'cal-title', text: monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }), next);

    const dow = el('div', { class: 'cal-row cal-dow' },
      ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => el('span', { text: d }))
    );

    const rows = [];
    let cursor = gridStart;
    for (let w = 0; w < 6; w++) {
      const cells = [];
      for (let d = 0; d < 7; d++) {
        const date = cursor;
        const has = available.has(date);
        const classes = ['cal-cell'];
        if (date.slice(0, 7) !== calMonth) classes.push('other-month');
        if (date === state.date) classes.push('selected');
        if (!has) classes.push('no-shows');
        const cell = el('button', {
          class: classes.join(' '),
          type: 'button',
          ...(has ? {} : { disabled: 'disabled' }),
          onclick: (ev) => {
            ev.stopPropagation();
            setDate(date);
            closeDemoCal();
          },
        });
        cell.append(el('span', { class: 'cal-daynum', text: String(Number(date.slice(8, 10))) }));
        if (has) cell.append(el('span', { class: 'cal-dot' }));
        cells.push(cell);
        cursor = shiftDate(cursor, 1);
      }
      rows.push(el('div', { class: 'cal-row' }, cells));
    }
    cal.replaceChildren(head, dow, ...rows);
  }

  function toggleDemoCal() {
    const cal = $('#demo-calendar');
    const open = cal.classList.contains('hidden');
    if (open) {
      calMonth = state.date.slice(0, 7);
      renderDemoCal();
      cal.classList.remove('hidden');
      $('#demo-date-btn').setAttribute('aria-expanded', 'true');
    } else {
      closeDemoCal();
    }
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

    seedFollows();
    resolveArtistImages();
    bindMap();
    mapEl.addEventListener('click', (ev) => {
      if (!ev.target.closest('.demo-pin')) setHover(null);
    });

    const profileBtn = $('#demo-profile-btn');
    if (profileBtn && PROFILE) {
      profileBtn.append(profileAvatar());
      profileBtn.addEventListener('click', openProfile);
    }

    document.addEventListener('keydown', (ev) => {
      if (ev.key !== 'Escape') return;
      if ($('.demo-checkout-overlay')) return closeCheckout();
      if (!$('#demo-calendar').classList.contains('hidden')) return closeDemoCal();
      if ($('.demo-profile-overlay')) return closeProfile();
      if ($('.demo-lightbox')) closePoster();
      else if ($('.demo-artist-overlay')) closeArtist();
    });

    const prevBtn = $('#demo-prev');
    prevBtn.append(icon('chevron_left'));
    prevBtn.addEventListener('click', () => {
      const i = DATA.dates.indexOf(state.date);
      if (i > 0) setDate(DATA.dates[i - 1]);
    });
    const nextBtn = $('#demo-next');
    nextBtn.append(icon('chevron_right'));
    nextBtn.addEventListener('click', () => {
      const i = DATA.dates.indexOf(state.date);
      if (i < DATA.dates.length - 1) setDate(DATA.dates[i + 1]);
    });

    $('#demo-date-btn').addEventListener('click', (ev) => {
      ev.stopPropagation();
      toggleDemoCal();
    });
    document.addEventListener('click', (ev) => {
      if (!document.contains(ev.target)) return;
      if (!ev.target.closest('#demo-calendar') && !ev.target.closest('#demo-date-btn')) closeDemoCal();
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
