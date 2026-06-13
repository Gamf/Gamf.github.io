/* gamf-icons.js — injects a hidden inline SVG sprite so any page can use
   <svg class="gx-ico"><use href="#i-play"/></svg>. Include right after <body>.
   Canonical in Gamf.github.io/; copied verbatim into every repo. */
(function () {
  var SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">' +
  '<defs>' +
  // line icons (stroke = currentColor)
  sym('i-back','<path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>') +
  sym('i-stats','<path d="M4 20V10M10 20V4M16 20v-7M22 20H2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>') +
  sym('i-search','<circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M21 21l-4.3-4.3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>') +
  sym('i-pad','<rect x="2" y="7" width="20" height="11" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 11v3M5.5 12.5h3M15.5 12h.01M18 13.5h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>') +
  sym('i-puzzle','<path d="M10 4a2 2 0 1 1 4 0v1h3a1 1 0 0 1 1 1v3h1a2 2 0 1 1 0 4h-1v3a1 1 0 0 1-1 1h-3v-1a2 2 0 1 0-4 0v1H6a1 1 0 0 1-1-1v-3H4a2 2 0 1 1 0-4h1V6a1 1 0 0 1 1-1h4V4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>') +
  sym('i-arcade','<circle cx="12" cy="7" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 10v6M7 20h10l-2-4H9l-2 4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>') +
  sym('i-cube','<path d="M12 2l9 5v10l-9 5-9-5V7l9-5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 12l9-5M12 12v10M12 12L3 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>') +
  sym('i-target','<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="1" fill="currentColor"/>') +
  sym('i-car','<path d="M3 13l2-5a3 3 0 0 1 2.8-2h8.4A3 3 0 0 1 19 8l2 5v5a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M3 13h18M7 16h.01M17 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>') +
  sym('i-globe','<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" fill="none" stroke="currentColor" stroke-width="2"/>') +
  sym('i-keyboard','<rect x="2" y="6" width="20" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>') +
  sym('i-touch','<path d="M9 11V6a2 2 0 0 1 4 0v5m0-2a2 2 0 0 1 4 0v5a6 6 0 0 1-6 6h-1a5 5 0 0 1-4-2l-3-4a1.6 1.6 0 0 1 2.4-2L11 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>') +
  sym('i-pause','<path d="M9 5v14M15 5v14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>') +
  sym('i-restart','<path d="M21 12a9 9 0 1 1-3-6.7M21 4v4h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>') +
  sym('i-trophy','<path d="M7 4h10v3a5 5 0 0 1-10 0V4zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 14h6l1 6H8l1-6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>') +
  sym('i-up','<path d="M6 15l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>') +
  sym('i-down','<path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>') +
  sym('i-left','<path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>') +
  sym('i-right','<path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>') +
  // filled
  sym('i-play','<path d="M8 5v14l11-7z" fill="currentColor"/>') +
  sym('i-logo','<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 8v8M8.5 10.2L12 12l3.5-1.8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>') +
  '</defs></svg>';

  function sym(id, inner) {
    return '<symbol id="' + id + '" viewBox="0 0 24 24">' + inner + '</symbol>';
  }
  function inject() {
    if (document.getElementById('gx-sprite')) return;
    var d = document.createElement('div');
    d.id = 'gx-sprite';
    d.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    d.innerHTML = SVG;
    document.body.insertBefore(d, document.body.firstChild);
  }
  if (document.body) inject();
  else document.addEventListener('DOMContentLoaded', inject);
})();
