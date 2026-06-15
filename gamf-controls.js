/* gamf-controls.js — shared on-screen touch controls for Gamf's own games.
   Editorial-styled (cream stock, oxblood accent, flat, no glow). Build a control
   layer once per game by calling window.gamfControls({...}); call again to replace.

   window.gamfControls({
     move: { left:fn, right:fn, up:fn, down:fn },  // optional D-pad; omit a dir to hide it
     hold: true,                                   // auto-repeat move while held (tetris/runner); default false
     actions: [ { label:'Fire', press:fn, release:fn }, ... ],  // action buttons (release optional)
   });

   Rule of thumb: 2D games map BOTH move (D-pad) + actions to buttons (everything is a
   button). 3D games usually pass only `actions` (shoot/jump/place) and keep drag for aim. */
(function () {
  var STYLE =
  '#gxc{position:fixed;left:0;right:0;bottom:0;z-index:50;pointer-events:none;' +
  'display:flex;justify-content:space-between;align-items:flex-end;gap:12px;' +
  'padding:0 max(14px,env(safe-area-inset-left)) calc(env(safe-area-inset-bottom) + 14px) max(14px,env(safe-area-inset-right));' +
  'font-family:"Newsreader",Georgia,serif}' +
  '#gxc .gxc-dpad{display:grid;grid-template-columns:repeat(3,58px);grid-template-rows:repeat(3,58px);gap:7px}' +
  '#gxc .gxc-acts{display:flex;flex-direction:column-reverse;align-items:flex-end;gap:11px}' +
  '#gxc button{pointer-events:auto;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;' +
  'touch-action:none;cursor:pointer;color:#221f17;background:#f6f0e1;border:none;border-radius:4px;' +
  'box-shadow:0 1px 2px rgba(40,28,10,.18),0 6px 16px rgba(60,42,16,.16);' +
  'display:grid;place-items:center;font-weight:600;transition:background .08s,transform .06s}' +
  '#gxc button:active{background:#9b3a22;color:#f6f0e1;transform:translateY(1px)}' +
  '#gxc .gxc-dpad button{font-size:22px}' +
  '#gxc .gxc-acts button{min-width:66px;height:58px;padding:0 16px;font-size:15px;letter-spacing:.01em}' +
  '#gxc .gxc-u{grid-area:1/2}#gxc .gxc-l{grid-area:2/1}#gxc .gxc-r{grid-area:2/3}#gxc .gxc-d{grid-area:3/2}';

  function el(t, c, txt) { var e = document.createElement(t); if (c) e.className = c; if (txt != null) e.textContent = txt; return e; }

  function bindPress(btn, press, release, repeat) {
    var timer = null, down = false;
    btn.addEventListener('pointerdown', function (e) {
      e.preventDefault(); if (down) return; down = true;
      try { press && press(); } catch (x) {}
      if (repeat) timer = setInterval(function () { try { press && press(); } catch (x) {} }, 120);
    });
    var up = function (e) {
      if (!down) return; down = false; e && e.preventDefault();
      if (timer) { clearInterval(timer); timer = null; }
      try { release && release(); } catch (x) {}
    };
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointercancel', up);
    btn.addEventListener('pointerleave', up);
  }

  window.gamfControls = function (cfg) {
    cfg = cfg || {};
    var old = document.getElementById('gxc'); if (old) old.remove();
    if (!document.getElementById('gxc-style')) {
      var s = el('style'); s.id = 'gxc-style'; s.textContent = STYLE; document.head.appendChild(s);
    }
    var root = el('div'); root.id = 'gxc';
    // left: D-pad
    var m = cfg.move;
    if (m && (m.up || m.down || m.left || m.right)) {
      var pad = el('div', 'gxc-dpad');
      [['gxc-u', m.up, '▲'], ['gxc-l', m.left, '◀'], ['gxc-r', m.right, '▶'], ['gxc-d', m.down, '▼']].forEach(function (b) {
        if (!b[1]) return; var btn = el('button', b[0], b[2]); btn.setAttribute('aria-label', b[0]); bindPress(btn, b[1], null, !!cfg.hold); pad.appendChild(btn);
      });
      root.appendChild(pad);
    } else { root.appendChild(el('span')); }   // spacer keeps actions on the right
    // right: action buttons
    var acts = el('div', 'gxc-acts');
    (cfg.actions || []).forEach(function (a) {
      var btn = el('button', null, a.label || '●'); bindPress(btn, a.press, a.release, false); acts.appendChild(btn);
    });
    root.appendChild(acts);
    document.body.appendChild(root);
    return root;
  };
})();
