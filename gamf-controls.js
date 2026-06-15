/* gamf-controls.js — real mobile thumb-zone controls for Gamf's own games.
   Movement lives in the bottom-LEFT thumb zone (a D-pad); actions live in the
   bottom-RIGHT thumb zone (a big round primary button + smaller secondaries in
   an arc). Big targets, semi-transparent, hold-to-repeat where asked. Editorial
   (cream stock, oxblood press). Call window.gamfControls({...}); call again to replace.

   window.gamfControls({
     move: { left:fn, right:fn, up:fn, down:fn },  // bottom-left D-pad; omit unused dirs
     hold: true,                                   // auto-repeat move while held (tetris/runner)
     actions: [ { label:'Fire', press:fn, release:fn }, ... ],  // first = big primary, rest arc up-left
   });

   Rule of thumb: 2D games map movement to the D-pad + every other control to action
   buttons. 3D games usually pass only actions (shoot/jump) and keep drag for aim. */
(function () {
  var STYLE =
  '#gxc{position:fixed;inset:0;z-index:60;pointer-events:none;font-family:"Newsreader",Georgia,serif}' +
  '#gxc .gxc-z{position:absolute;bottom:max(20px,calc(env(safe-area-inset-bottom) + 14px));display:flex;align-items:flex-end}' +
  '#gxc .gxc-l{left:max(14px,env(safe-area-inset-left))}' +
  '#gxc .gxc-r{right:max(14px,env(safe-area-inset-right));flex-direction:row-reverse;align-items:flex-end;gap:14px}' +
  '#gxc .gxc-dpad{display:grid;grid-template-columns:repeat(3,62px);grid-template-rows:repeat(3,62px);gap:6px}' +
  '#gxc button{pointer-events:auto;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;' +
  'touch-action:none;cursor:pointer;color:#221f17;background:rgba(246,240,225,.84);border:none;' +
  'display:grid;place-items:center;font-weight:600;line-height:1;' +
  'box-shadow:0 1px 2px rgba(40,28,10,.22),0 6px 16px rgba(60,42,16,.18);transition:transform .05s,background .08s,color .08s}' +
  '#gxc button:active{background:#9b3a22;color:#f6f0e1;transform:scale(.93)}' +
  '#gxc .gxc-dpad button{border-radius:9px;font-size:26px}' +
  '#gxc .gxc-act{border-radius:50%;padding:0}' +
  '#gxc .gxc-p{width:80px;height:80px;font-size:16px}' +            /* primary action */
  '#gxc .gxc-s{width:60px;height:60px;font-size:13px;margin-bottom:10px}' +  /* arc secondaries, raised */
  '#gxc .gxc-u{grid-area:1/2}#gxc .gxc-l3{grid-area:2/1}#gxc .gxc-r3{grid-area:2/3}#gxc .gxc-d{grid-area:3/2}';

  function el(t, c, txt) { var e = document.createElement(t); if (c) e.className = c; if (txt != null) e.textContent = txt; return e; }

  function bindPress(btn, press, release, repeat) {
    var timer = null, down = false;
    btn.addEventListener('pointerdown', function (e) {
      e.preventDefault(); if (down) return; down = true;
      try { press && press(); } catch (x) {}
      if (repeat) timer = setInterval(function () { try { press && press(); } catch (x) {} }, 110);
    });
    var up = function (e) {
      if (!down) return; down = false; if (e) e.preventDefault();
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

    // bottom-left: D-pad
    var m = cfg.move;
    if (m && (m.up || m.down || m.left || m.right)) {
      var lz = el('div', 'gxc-z gxc-l');
      var pad = el('div', 'gxc-dpad');
      [['gxc-u', m.up, '▲'], ['gxc-l3', m.left, '◀'], ['gxc-r3', m.right, '▶'], ['gxc-d', m.down, '▼']].forEach(function (b) {
        if (!b[1]) return; var btn = el('button', b[0], b[2]); btn.setAttribute('aria-label', b[0]); bindPress(btn, b[1], null, !!cfg.hold); pad.appendChild(btn);
      });
      lz.appendChild(pad); root.appendChild(lz);
    }

    // bottom-right: action cluster (first = big primary, rest = smaller, raised into an arc)
    var acts = cfg.actions || [];
    if (acts.length) {
      var rz = el('div', 'gxc-z gxc-r');
      acts.forEach(function (a, i) {
        var btn = el('button', 'gxc-act ' + (i === 0 ? 'gxc-p' : 'gxc-s'), a.label || '●');
        // stagger secondaries up a little more the further from the thumb
        if (i > 1) btn.style.marginBottom = (10 + i * 12) + 'px';
        bindPress(btn, a.press, a.release, !!a.hold);
        rz.appendChild(btn);
      });
      root.appendChild(rz);
    }

    document.body.appendChild(root);
    return root;
  };
})();
