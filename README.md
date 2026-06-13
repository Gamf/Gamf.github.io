# Gamf — hub

The portal/landing page, published at <https://gamf.github.io/>.

- `genres.json` — the list of genres + their base URLs. Add a genre here.
- `app.js` — loads `genres.json`, then fetches each genre's `games.json` and
  renders touch cards.
- `manifest.webmanifest` + `sw.js` — make the hub installable / offline-capable.

Adding a **genre**: create its repo, then add a row to `genres.json`:

```json
{ "slug": "cards", "title": "Cards", "icon": "🃏", "color": "#d6a85a", "base": "../cards/" }
```

Adding a **game** happens in the genre repo, not here — see
`../docs/ADD-GAME.md`.
