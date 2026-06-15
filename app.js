// app.js — GAMF Quarterly homepage. Loads genres.json + each genre's games.json
// (same-origin), renders a cover-story + an editorial catalogue. Scores shown are
// the reader's REAL local bests (localStorage) — nothing fabricated.

const ICON = { puzzle:'i-puzzle', arcade:'i-arcade', '3d':'i-cube', fps:'i-target', racing:'i-flag', 'others-games':'i-coin' };
const fKey = (slug) => (slug === 'others-games' ? 'classics' : slug);
const esc = (s='') => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = (n) => Number(n).toLocaleString('en-US');
const ico = (id) => `<svg class="gx-ico"><use href="#${id}"/></svg>`;
const bestOf = (genre, slug) => { try { return +(localStorage.getItem(`gamf-${genre}-${slug}-best`)) || 0; } catch { return 0; } };
// warm cover tints — varied per game from its slug (the catalogue's coloured plates)
const TINTS = ['#e7dcc2', '#e3cfa6', '#dcc7a3', '#cdbf9f', '#dbcaa0', '#e0c79a', '#d8b48a', '#cdb892'];
const hsh = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
const tint = (s) => TINTS[hsh(s || '') % TINTS.length];

// one editor's voice, per genre — concrete, not "supercharge your gameplay"
const BLURB = {
  puzzle:  "A puzzle to chew on. No clock breathing down your neck — just you and the wrong moves you haven't made yet.",
  arcade:  "Old-fashioned arcade nerve. You'll say one more go and you will be lying.",
  '3d':    "A small world with depth to it. Mind the edges; they don't forgive much.",
  fps:     "Point, shoot, try not to blink. It notices when you do.",
  racing:  "Foot down, hands loose. The corner has been there longer than you have.",
  'others-games': "Borrowed from someone with taste — credited, never stolen.",
};

const state = { query:'', filter:'all' };
let GAMES = [], GENRES = [], featured = null;
const el = (id) => document.getElementById(id);

init();

async function init() {
  if (window.gamfVisit) window.gamfVisit();
  let cfg;
  try { cfg = await fetchJSON('genres.json'); }
  catch (e) { el('grid').innerHTML = `<p class="gx-error">The press jammed — couldn't load genres.json (${esc(e.message)}).</p>`; return; }
  GENRES = cfg.genres || [];

  const loaded = await Promise.all(GENRES.map(async (g) => {
    const base = new URL(g.base, document.baseURI);
    const label = g.slug === 'others-games' ? 'Borrowed' : (g.title || g.slug);
    try {
      const m = await fetchJSON(new URL('games.json', base));
      return (m.games || []).map((game) => decorate(game, g, base, label));
    } catch { return []; }
  }));
  GAMES = loaded.flat();
  el('dl-count').textContent = GAMES.length;

  pickFeatured();
  renderHero();
  buildPills();
  buildScores();
  wireSearch();
  render();
}

function decorate(game, genre, base, label) {
  return {
    slug: game.slug, title: game.title, genre: genre.slug, genreLabel: label,
    icon: ICON[genre.slug] || 'i-coin', dims: game.dims || '2D',
    tags: game.tags || [], best: bestOf(genre.slug, game.slug),
    url: new URL(game.path, base).href, fkey: fKey(genre.slug),
  };
}

function pickFeatured() {
  if (!GAMES.length) return;
  const own = GAMES.filter((g) => g.genre !== 'others-games');
  const pool = own.length ? own : GAMES;
  const day = Math.floor(Date.now() / 86400000);
  featured = pool[day % pool.length];
}

function renderHero() {
  if (!featured) return;
  const g = featured, hero = el('hero');
  hero.hidden = false;
  const best = g.best > 0 ? `Your best so far: ${fmt(g.best)}.` : "You haven't set a score here yet.";
  hero.innerHTML = `
    <div class="gx-hero__left">
      <div class="gx-eyebrow"><span class="gx-eyebrow__l">Nº 01 — In rotation</span><span class="gx-eyebrow__n">${esc(g.genreLabel)}</span></div>
      <h1 class="gx-hero__title">${esc(g.title)}</h1>
      <p class="gx-hero__sub">${esc(BLURB[g.genre] || 'A small game for idle thumbs.')}</p>
      <div class="gx-hero__actions">
        <a class="gx-playbtn" id="heroPlay" href="${g.url}">${ico('i-play')} Play it</a>
        <span class="gx-hero__hs">${esc(best)}</span>
      </div>
    </div>`;
  el('heroPlay').addEventListener('click', () => window.gamfPlay && window.gamfPlay(g.slug));
}

function buildPills() {
  const counts = {};
  GAMES.forEach((g) => { counts[g.fkey] = (counts[g.fkey] || 0) + 1; });
  const defs = [['all','Everything']].concat(GENRES.map((g) => [fKey(g.slug), g.slug === 'others-games' ? 'Borrowed' : (g.title || g.slug)]));
  el('pills').innerHTML = defs.map(([id, label]) => {
    const n = id === 'all' ? GAMES.length : (counts[id] || 0);
    return `<button class="gx-fpill" data-f="${id}">${esc(label)}<span class="gx-fpill__n">${n}</span></button>`;
  }).join('');
  el('pills').querySelectorAll('.gx-fpill').forEach((b) => b.addEventListener('click', () => { state.filter = b.dataset.f; render(); }));
}

function results() {
  const q = state.query.trim().toLowerCase(), f = state.filter;
  return GAMES.filter((g) =>
    (f === 'all' || g.fkey === f) &&
    (!q || g.title.toLowerCase().includes(q) || g.tags.join(' ').toLowerCase().includes(q)));
}
function render() {
  const list = results();
  el('count').textContent = `${list.length} ${list.length === 1 ? 'entry' : 'entries'}`;
  el('pills').querySelectorAll('.gx-fpill').forEach((b) => b.classList.toggle('is-active', b.dataset.f === state.filter));
  const grid = el('grid');
  if (!list.length) {
    grid.innerHTML = '';
    el('empty').innerHTML = `<div class="gx-empty"><h3>Nothing under that.</h3><p>Try a different word, or browse the whole rack.</p></div>`;
    return;
  }
  el('empty').innerHTML = '';
  grid.innerHTML = list.map(entry).join('');
  grid.querySelectorAll('.gx-cabinet').forEach((a, i) => a.addEventListener('click', () => window.gamfPlay && window.gamfPlay(list[i].slug)));
}
function entry(g) {
  const meta = g.best > 0 ? `Best ${fmt(g.best)}` : (g.tags.slice(0, 2).join(', ') || g.dims);
  const thumb = g.genre === 'others-games' ? '' : g.url + 'thumb.svg';
  return `<a class="gx-cabinet" href="${g.url}">
    <div class="gx-cab__thumb" style="--cover:${tint(g.slug)}">${ico(g.icon)}${thumb ? `<img class="gx-cab__img" src="${thumb}" alt="" loading="lazy" onerror="this.remove()">` : ''}</div>
    <div class="gx-cab__body">
      <div class="gx-cab__plate"><span class="gx-cab__genre">${esc(g.genreLabel)}</span><span class="gx-cab__dims">${esc(g.dims)}</span></div>
      <h3 class="gx-cab__title">${esc(g.title)}</h3>
      <div class="gx-cab__ctrl"><span class="gx-cab__hi">${esc(meta)}</span><span class="gx-cab__play">Play</span></div>
    </div>
  </a>`;
}

// "Your Best" — real local scores only
function buildScores() {
  const scored = GAMES.filter((g) => g.best > 0).sort((a, b) => b.best - a.best).slice(0, 8);
  const box = el('leaders');
  if (!scored.length) {
    box.innerHTML = `<div class="gx-board__foot">The rack is fresh — play something and your scores show up here. Only you can see them; they live in this browser.</div>`;
    return;
  }
  box.innerHTML = scored.map((g, i) => `
    <div class="gx-lrow${i === 0 ? ' is-top' : ''}">
      <span class="gx-lrow__rank">${i + 1}.</span>
      <span class="gx-lrow__ini">${esc(g.title)}</span>
      <span class="gx-lrow__sc"><b>${fmt(g.best)}</b></span>
    </div>`).join('');
}

function wireSearch() {
  const q = el('q'), search = el('search'), clear = el('qclear');
  q.addEventListener('input', () => { state.query = q.value; search.classList.toggle('has-q', !!q.value); render(); });
  clear.addEventListener('click', () => { q.value = ''; state.query = ''; search.classList.remove('has-q'); render(); q.focus(); });
}

async function fetchJSON(url) {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
