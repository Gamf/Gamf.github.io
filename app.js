// app.js — Gamf Arcade homepage. Loads genres.json + each genre's games.json
// (same-origin), then renders attract-mode hero, filterable cabinet grid,
// leaderboard, and a CRT launch overlay. Retro-arcade design from the handoff.

const ICON = { puzzle: 'i-puzzle', arcade: 'i-arcade', '3d': 'i-cube', fps: 'i-target', racing: 'i-flag', 'others-games': 'i-coin' };
const fKey = (slug) => (slug === 'others-games' ? 'classics' : slug);
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (n) => Number(n).toLocaleString('en-US');
const ico = (id, cls) => `<svg class="gx-ico${cls ? ' ' + cls : ''}"><use href="#${id}"/></svg>`;
function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

const state = { query: '', filter: 'all' };
let GAMES = [], GENRES = [], featured = null;

const el = (id) => document.getElementById(id);

init();

async function init() {
  if (window.gamfVisit) window.gamfVisit();
  let cfg;
  try { cfg = await fetchJSON('genres.json'); }
  catch (e) { el('grid').innerHTML = `<p class="gx-error">Couldn't load genres.json — ${esc(e.message)}</p>`; return; }
  GENRES = cfg.genres || [];

  const loaded = await Promise.all(GENRES.map(async (g) => {
    const base = new URL(g.base, document.baseURI);
    const label = g.slug === 'others-games' ? 'CLASSICS' : (g.title || g.slug).toUpperCase();
    try {
      const m = await fetchJSON(new URL('games.json', base));
      return (m.games || []).map((game) => decorate(game, g, base, label));
    } catch { return []; }
  }));
  GAMES = loaded.flat();

  pickFeatured();
  renderHero();
  buildPills();
  buildLeaders();
  wireSearch();
  render();
}

function decorate(game, genre, base, label) {
  const h = hashStr((game.slug || game.title) + genre.slug);
  const rating = game.rating != null ? game.rating : 3 + (h % 3);
  const score = game.score != null ? game.score : 5000 + (h % 1495000);
  const hot = game.hot != null ? game.hot : ((game.tags || []).some((t) => /classic|retro|arcade/i.test(t)) || h % 5 === 0);
  return {
    slug: game.slug, title: game.title, genre: genre.slug, genreLabel: label,
    icon: ICON[genre.slug] || 'i-arcade', dims: game.dims || '2D',
    tags: game.tags || [], rating, score, hot,
    url: new URL(game.path, base).href, fkey: fKey(genre.slug),
  };
}

function pickFeatured() {
  const hot = GAMES.filter((g) => g.hot);
  const pool = hot.length ? hot : GAMES;
  if (!pool.length) return;
  const day = Math.floor(Date.now() / 86400000);
  featured = pool[day % pool.length];
}

/* ---- hero (attract mode) + count-up ---- */
function renderHero() {
  if (!featured) return;
  const g = featured, hero = el('hero');
  hero.hidden = false;
  hero.innerHTML = `
    <div class="gx-hero__left">
      <div class="gx-eyebrow"><span class="gx-eyebrow__sq"></span>
        <span class="gx-eyebrow__l">Featured Cabinet</span><span class="gx-eyebrow__n">No.01</span></div>
      <div class="gx-coin">Insert Coin</div>
      <h1 class="gx-hero__title">${esc(g.title.toUpperCase())}</h1>
      <p class="gx-hero__sub">${esc(g.genreLabel)} · ${esc(g.tags.slice(0, 4).join(' · ') || 'Play')}</p>
      <div class="gx-hero__actions">
        <button class="gx-playbtn" id="heroPlay">${ico('i-play')} Play Now</button>
        <div class="gx-hero__hs"><label>High Score</label><b id="heroScore">0</b></div>
      </div>
    </div>
    <div class="gx-attract">
      <div class="gx-attract__scan"></div><div class="gx-attract__sweep"></div>
      <div class="gx-attract__ghost">${esc(g.title.toUpperCase())}</div>
      <div class="gx-attract__row"><span>Attract Mode</span><span class="gx-attract__chip">${esc(g.dims)}</span></div>
      <div style="position:relative;display:grid;place-items:center;padding:8px 0">${ico(g.icon)}</div>
      <div class="gx-attract__hi"><span>1 Credit</span><b>HI ${fmt(g.score)}</b></div>
    </div>`;
  // make the attract icon large
  const big = hero.querySelector('.gx-attract .gx-ico');
  if (big) { big.style.width = '72px'; big.style.height = '72px'; big.style.color = 'var(--gx-text-2)'; }
  el('heroPlay').addEventListener('click', () => launch(g));
  countUp(el('heroScore'), g.score);
}

function countUp(node, target) {
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { node.textContent = fmt(target); return; }
  const t0 = performance.now(), dur = 1200;
  const step = (t) => {
    const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
    node.textContent = fmt(Math.round(target * e));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ---- pills ---- */
function buildPills() {
  const counts = {};
  GAMES.forEach((g) => { counts[g.fkey] = (counts[g.fkey] || 0) + 1; });
  const defs = [['all', 'ALL']].concat(GENRES.map((g) => [fKey(g.slug), g.slug === 'others-games' ? 'CLASSICS' : (g.title || g.slug).toUpperCase()]));
  el('pills').innerHTML = defs.map(([id, label]) => {
    const n = id === 'all' ? GAMES.length : (counts[id] || 0);
    return `<button class="gx-fpill" data-f="${id}"><span>${esc(label)}</span><span class="gx-fpill__n">${n}</span></button>`;
  }).join('');
  el('pills').querySelectorAll('.gx-fpill').forEach((b) => b.addEventListener('click', () => { state.filter = b.dataset.f; render(); }));
}

/* ---- grid ---- */
function results() {
  const q = state.query.trim().toLowerCase(), f = state.filter;
  return GAMES.filter((g) =>
    (f === 'all' || g.fkey === f) &&
    (!q || g.title.toLowerCase().includes(q) || g.tags.join(' ').toLowerCase().includes(q)));
}
function render() {
  const list = results();
  el('count').textContent = `${list.length} ${list.length === 1 ? 'Cabinet' : 'Cabinets'}`;
  el('pills').querySelectorAll('.gx-fpill').forEach((b) => b.classList.toggle('is-active', b.dataset.f === state.filter));
  const grid = el('grid');
  if (!list.length) {
    grid.innerHTML = '';
    el('empty').innerHTML = `<div class="gx-empty"><h3>NO CABINETS FOUND</h3><p>Insert a different coin</p></div>`;
    return;
  }
  el('empty').innerHTML = '';
  grid.innerHTML = list.map(cabinet).join('');
  grid.querySelectorAll('.gx-cabinet').forEach((b, i) => b.addEventListener('click', () => launch(list[i])));
}
function ratingTicks(r) { let s = ''; for (let i = 0; i < 5; i++) s += `<span class="${i < r ? 'on' : ''}"></span>`; return `<div class="gx-rate">${s}</div>`; }
function cabinet(g) {
  return `<button class="gx-cabinet" aria-label="Play ${esc(g.title)}, ${esc(g.genreLabel)}">
    <div class="gx-cab__plate">${ico(g.icon)}<span class="gx-cab__genre">${esc(g.genreLabel)}</span><span class="gx-cab__dims">${esc(g.dims)}</span></div>
    <div class="gx-cab__cover${g.hot ? ' is-hot' : ''}">
      <span class="gx-cab__big">${ico(g.icon)}</span>
      ${g.hot ? `<span class="gx-cab__hot">${ico('i-bolt')} Hot</span>` : ''}
      <h3 class="gx-cab__title">${esc(g.title.toUpperCase())}</h3>
    </div>
    <div class="gx-cab__ctrl">
      <div style="min-width:0">${ratingTicks(g.rating)}<span class="gx-cab__hi">HI ${fmt(g.score)}</span></div>
      <span class="gx-cab__play">${ico('i-play')} Play</span>
    </div></button>`;
}

/* ---- leaderboard (mock, from the design) ---- */
function buildLeaders() {
  const raw = [['ACE', 1284500, 'Asteroids'], ['ZAP', 1098200, 'Pac-Man'], ['NEO', 987650, 'Tetris'],
    ['RAY', 842310, 'Drone Hunt'], ['KIM', 731900, 'Space Invaders'], ['FOX', 688420, 'Snake'], ['JET', 540170, 'Breakout']];
  el('leaders').innerHTML = raw.map((r, i) => `
    <div class="gx-lrow${i === 0 ? ' is-top' : ''}">
      <span class="gx-lrow__rank">${String(i + 1).padStart(2, '0')}</span>
      <span class="gx-lrow__ini">${esc(r[0])}</span>
      <div class="gx-lrow__sc"><b>${fmt(r[1])}</b><span>${esc(r[2])}</span></div>
    </div>`).join('') + `<div class="gx-board__foot">Enter your initials</div>`;
}

/* ---- search ---- */
function wireSearch() {
  const q = el('q'), search = el('search'), clear = el('qclear');
  q.addEventListener('input', () => { state.query = q.value; search.classList.toggle('has-q', !!q.value); render(); });
  clear.addEventListener('click', () => { q.value = ''; state.query = ''; search.classList.remove('has-q'); render(); q.focus(); });
}

/* ---- launch overlay → real navigation ---- */
let navigating = false;
function launch(g) {
  if (!g || navigating) return;
  navigating = true;
  if (window.gamfPlay) window.gamfPlay(g.slug);
  const ov = el('launch');
  ov.innerHTML = `
    <div class="gx-launch__panel" onclick="event.stopPropagation()">
      <div class="gx-launch__scan"></div>
      <div class="gx-launch__body">
        <div class="gx-launch__top">${ico(g.icon)} ${esc(g.genreLabel)} · Now Loading</div>
        <div class="gx-launch__title">${esc(g.title.toUpperCase())}</div>
        <div class="gx-launch__hs"><span>High Score</span><b>${fmt(g.score)}</b></div>
        <div class="gx-launch__bar"><i></i></div>
        <div class="gx-launch__skip">Tap to skip</div>
      </div></div>`;
  ov.classList.add('gx-show');
  const go = () => { window.location.href = g.url; };
  ov.onclick = go;
  setTimeout(go, 1600);
}

async function fetchJSON(url) {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
