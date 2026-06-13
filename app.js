// app.js — Gamf hub. Loads genres.json, fetches each genre's games.json
// (same-origin, no CORS), and renders a console-store layout: a featured hero
// plus one horizontal row per genre with cover-art cards.

const ICON = { puzzle: 'i-puzzle', arcade: 'i-arcade', '3d': 'i-cube', fps: 'i-target', racing: 'i-car', 'others-games': 'i-globe' };
const rowsEl = document.getElementById('rows');

init();

async function init() {
  let config;
  try { config = await fetchJSON('genres.json'); }
  catch (err) { rowsEl.innerHTML = `<p class="gx-error">Couldn't load genres.json — ${esc(err.message)}</p>`; return; }

  document.getElementById('tagline').textContent = config.tagline || 'Open-source games, made for your fingers.';
  if (window.gamfVisit) window.gamfVisit();

  // fetch every genre's manifest in parallel
  const genres = config.genres || [];
  const loaded = await Promise.all(genres.map(async (g) => {
    const base = new URL(g.base, document.baseURI);
    try {
      const m = await fetchJSON(new URL('games.json', base));
      const games = (m.games || []).map((game) => ({ ...game, _url: new URL(game.path, base).href, _genre: g }));
      return { genre: g, games };
    } catch { return { genre: g, games: [] }; }
  }));

  renderHero(loaded);
  renderRows(loaded);
}

function renderHero(loaded) {
  const all = loaded.flatMap((x) => x.games);
  if (!all.length) return;
  // rotate the featured pick daily (deterministic per day)
  const day = Math.floor(Date.now() / 86400000);
  const feat = all[day % all.length];
  const accent = feat.color || feat._genre.color || '#7c5cff';
  const hero = document.getElementById('hero');
  hero.style.setProperty('--gx-accent', accent);
  hero.hidden = false;
  document.getElementById('hero-glyph').textContent = feat.icon || feat._genre.icon || '🎮';
  document.getElementById('hero-title').textContent = feat.title;
  document.getElementById('hero-sub').textContent =
    `${feat._genre.title}${feat.tags && feat.tags.length ? ' · ' + feat.tags.join(' · ') : ''}`;
  const play = document.getElementById('hero-play');
  play.href = feat._url;
  play.addEventListener('click', () => window.gamfPlay && window.gamfPlay(feat.slug));
}

function renderRows(loaded) {
  rowsEl.innerHTML = '';
  for (const { genre, games } of loaded) {
    const section = document.createElement('section');
    section.className = 'gx-row';
    section.style.setProperty('--gx-accent', genre.color || '#7c5cff');
    section.innerHTML = `
      <div class="gx-row__head">
        <span class="gx-row__icon"><svg class="gx-ico"><use href="#${ICON[genre.slug] || 'i-pad'}"/></svg></span>
        <span class="gx-row__title">${esc(genre.title)}</span>
        <span class="gx-row__count">${games.length} game${games.length === 1 ? '' : 's'}</span>
      </div>
      <div class="gx-scroller"></div>`;
    const scroller = section.querySelector('.gx-scroller');
    if (!games.length) scroller.innerHTML = `<p class="gx-empty">Nothing here yet.</p>`;
    for (const game of games) scroller.appendChild(card(game, genre));
    rowsEl.appendChild(section);
  }
}

function card(game, genre) {
  const a = document.createElement('a');
  a.className = 'gx-card';
  a.href = game._url;
  const cover = game.color || genre.color || '#7c5cff';
  a.innerHTML = `
    <div class="gx-cover" style="--cover:${safeColor(cover)}">
      ${game.dims ? `<span class="gx-cover__dims">${esc(game.dims)}</span>` : ''}
      <span class="gx-cover__glyph">${esc(game.icon || genre.icon || '🎮')}</span>
      <span class="gx-cover__play"><svg class="gx-ico"><use href="#i-play"/></svg></span>
    </div>
    <div class="gx-card__body">
      <span class="gx-card__title">${esc(game.title)}</span>
      <span class="gx-card__meta">${(game.tags || []).slice(0, 3).map(esc).join(' · ')}</span>
      ${game.author ? `<span class="gx-card__by">by ${esc(game.author)}</span>` : ''}
    </div>`;
  a.addEventListener('click', () => window.gamfPlay && window.gamfPlay(game.slug));
  return a;
}

async function fetchJSON(url) {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
function esc(s = '') { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function safeColor(c) { return /^#[0-9a-fA-F]{3,8}$/.test(c) ? c : '#7c5cff'; }

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
