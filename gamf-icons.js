/* gamf-icons.js — injects a hidden inline SVG sprite. Use:
   <svg class="gx-ico"><use href="#i-play"/></svg>. Include right after <body>.
   Arcade line-icon set (viewBox 0 0 24 24, stroke 1.6, round, currentColor) from
   the Claude Designer handoff, plus the in-game control icons. Canonical in
   Gamf.github.io/; copied verbatim into every repo. */
(function () {
  var L = 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
  var SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true"><defs>' +
  // genre icons (match the design exactly)
  sym('i-puzzle','<rect x="3.5" y="3.5" width="7.5" height="7.5" '+L+'/><rect x="13" y="3.5" width="7.5" height="7.5" '+L+'/><rect x="3.5" y="13" width="7.5" height="7.5" '+L+'/><rect x="13" y="13" width="7.5" height="7.5" '+L+'/>') +
  sym('i-arcade','<circle cx="12" cy="6.5" r="3" '+L+'/><line x1="12" y1="9.5" x2="12" y2="16" '+L+'/><path d="M6.5 20c0-2.8 2.4-4.5 5.5-4.5s5.5 1.7 5.5 4.5" '+L+'/>') +
  sym('i-cube','<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" '+L+'/><path d="M12 12v9" '+L+'/><path d="M4 7.5l8 4.5 8-4.5" '+L+'/>') +
  sym('i-target','<circle cx="12" cy="12" r="7.5" '+L+'/><line x1="12" y1="2" x2="12" y2="6" '+L+'/><line x1="12" y1="18" x2="12" y2="22" '+L+'/><line x1="2" y1="12" x2="6" y2="12" '+L+'/><line x1="18" y1="12" x2="22" y2="12" '+L+'/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/>') +
  sym('i-flag','<line x1="6" y1="3" x2="6" y2="21" '+L+'/><path d="M6 4.5h12l-3 4 3 4H6" '+L+'/>') +
  sym('i-coin','<circle cx="12" cy="12" r="8.2" '+L+'/><circle cx="12" cy="12" r="3.4" '+L+'/>') +
  // racing alias used by some pages
  sym('i-car','<path d="M3 13l2-5a3 3 0 0 1 2.8-2h8.4A3 3 0 0 1 19 8l2 5v5h-3v-2H6v2H3z" '+L+'/><path d="M3 13h18M7 16h.01M17 16h.01" '+L+'/>') +
  sym('i-globe','<circle cx="12" cy="12" r="8.2" '+L+'/><circle cx="12" cy="12" r="3.4" '+L+'/>') +
  // UI icons
  sym('i-search','<circle cx="11" cy="11" r="6" '+L+'/><line x1="20" y1="20" x2="15.6" y2="15.6" '+L+'/>') +
  sym('i-x','<line x1="5.5" y1="5.5" x2="18.5" y2="18.5" '+L+'/><line x1="18.5" y1="5.5" x2="5.5" y2="18.5" '+L+'/>') +
  sym('i-play','<polygon points="7,4 20,12 7,20" fill="currentColor"/>') +
  sym('i-trophy','<path d="M7 4h10v5a5 5 0 0 1-10 0z" '+L+'/><path d="M7 6H4.5v1A3 3 0 0 0 7.5 10" '+L+'/><path d="M17 6h2.5v1A3 3 0 0 1 16.5 10" '+L+'/><line x1="12" y1="14" x2="12" y2="17" '+L+'/><path d="M8.5 20h7l-.6-3h-5.8z" '+L+'/>') +
  sym('i-bolt','<polygon points="13,2 5,13 11,13 10,22 19,10 13,10" fill="currentColor"/>') +
  sym('i-stats','<path d="M4 20V10M10 20V4M16 20v-7M22 20H2" '+L+'/>') +
  sym('i-info','<circle cx="12" cy="12" r="9" '+L+'/><line x1="12" y1="11" x2="12" y2="16" '+L+'/><circle cx="12" cy="7.7" r="1" fill="currentColor" stroke="none"/>') +
  // in-game control icons (kept for the 20 games)
  sym('i-back','<path d="M15 5l-7 7 7 7" '+L+'/>') +
  sym('i-pause','<line x1="9" y1="5" x2="9" y2="19" '+L+'/><line x1="15" y1="5" x2="15" y2="19" '+L+'/>') +
  sym('i-restart','<path d="M21 12a9 9 0 1 1-3-6.7M21 4v4h-4" '+L+'/>') +
  sym('i-up','<path d="M6 15l6-6 6 6" '+L+'/>') +
  sym('i-down','<path d="M6 9l6 6 6-6" '+L+'/>') +
  sym('i-left','<path d="M15 6l-6 6 6 6" '+L+'/>') +
  sym('i-right','<path d="M9 6l6 6-6 6" '+L+'/>') +
  sym('i-logo','<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" '+L+'/><path d="M12 12v9M4 7.5l8 4.5 8-4.5" '+L+'/>') +
  '</defs></svg>';

  function sym(id, inner) { return '<symbol id="' + id + '" viewBox="0 0 24 24">' + inner + '</symbol>'; }
  function inject() {
    if (document.getElementById('gx-sprite')) return;
    var d = document.createElement('div');
    d.id = 'gx-sprite'; d.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    d.innerHTML = SVG;
    document.body.insertBefore(d, document.body.firstChild);
  }
  if (document.body) inject(); else document.addEventListener('DOMContentLoaded', inject);
})();
