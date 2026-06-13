// app.js — the hub. Loads the genre list, then fetches each genre's games.json
// and renders touch cards. Because every genre repo is served from the same
// gamf.github.io domain, these fetches are same-origin (no CORS).

const genresEl = document.getElementById('genres');

init();

async function init() {
  let config;
  try {
    config = await fetchJSON('genres.json');
  } catch (err) {
    genresEl.innerHTML = `<p class="error">Couldn't load genres.json — ${err.message}</p>`;
    return;
  }

  document.getElementById('hub-title').textContent = config.title || 'Gamf';
  document.getElementById('hub-tagline').textContent = config.tagline || '';
  document.title = `${config.title || 'Gamf'} — touch games`;

  // Render each genre in parallel so a slow genre doesn't block the others.
  await Promise.all((config.genres || []).map(renderGenre));
}

async function renderGenre(genre) {
  const section = document.createElement('section');
  section.className = 'genre-section';
  section.innerHTML = `
    <h2 class="genre-heading">
      <span class="icon">${genre.icon || '🎮'}</span>
      <span>${genre.title}</span>
      <span class="count"></span>
    </h2>
    <div class="card-grid"><p class="empty">Loading…</p></div>`;
  genresEl.appendChild(section);

  const grid = section.querySelector('.card-grid');
  const countEl = section.querySelector('.count');

  // Resolve the genre's base URL relative to this page. With base "../puzzle/"
  // this becomes gamf.github.io/puzzle/ in production and the right local path
  // when previewing from the parent folder.
  const base = new URL(genre.base, document.baseURI);

  let manifest;
  try {
    manifest = await fetchJSON(new URL('games.json', base));
  } catch (err) {
    grid.innerHTML = `<p class="error">No games.json for ${genre.title} yet.</p>`;
    return;
  }

  const games = manifest.games || [];
  countEl.textContent = `${games.length} game${games.length === 1 ? '' : 's'}`;

  if (!games.length) {
    grid.innerHTML = `<p class="empty">No games here yet.</p>`;
    return;
  }

  grid.innerHTML = '';
  for (const game of games) {
    const url = new URL(game.path, base);          // e.g. games/sample-2048/
    const a = document.createElement('a');
    a.className = 'card';
    a.href = url.href;
    a.innerHTML = `
      <div class="card-thumb" style="--c:${genre.color || '#2a2f42'}">${game.icon || genre.icon || '🎮'}</div>
      <div class="card-body">
        <div class="card-title">${escapeHtml(game.title)}</div>
        <div class="card-tags">${(game.tags || []).map(escapeHtml).join(' · ')}</div>
      </div>`;
    grid.appendChild(a);
  }
}

async function fetchJSON(url) {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function escapeHtml(s = '') {
  return String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

// Register the service worker for offline/installable behaviour (production only).
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
