/* gamf-stats.js — real visit + game-play counters.
   Global counts via a free keyed counter API (Abacus, no signup); per-device
   counts via localStorage. Both degrade silently if offline / rate-limited.
   Canonical in Gamf.github.io/; copied verbatim into genre + catalog repos.

   Exposes:
     window.gamfVisit()            -> count a site visit (global + local)
     window.gamfPlay(slug)         -> count a game launch (global + local)
     window.gamfStats.getGlobal(key)        -> Promise<number|null>
     window.gamfStats.getGlobalMany(keys)   -> Promise<{key:number}>
     window.gamfStats.local(key)            -> number (this device)
     window.gamfStats.localPlays()          -> { slug:count } (this device)
*/
(function () {
  var NS = 'gamf';
  var API = 'https://abacus.jasoncameron.dev';
  var LP = 'gamf-stats-';

  function hit(key) {
    try { return fetch(API + '/hit/' + NS + '/' + enc(key), { keepalive: true, cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }); }
    catch (e) { return Promise.resolve(null); }
  }
  function get(key) {
    return fetch(API + '/get/' + NS + '/' + enc(key), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { return j && typeof j.value === 'number' ? j.value : (j && typeof j.count === 'number' ? j.count : null); })
      .catch(function () { return null; });
  }
  function enc(k) { return encodeURIComponent(String(k).replace(/[^a-zA-Z0-9_-]/g, '-')).slice(0, 64); }

  function lbump(k) { try { var n = (+localStorage.getItem(LP + k) || 0) + 1; localStorage.setItem(LP + k, n); return n; } catch (e) { return 0; } }
  function lget(k) { try { return +localStorage.getItem(LP + k) || 0; } catch (e) { return 0; } }

  window.gamfVisit = function () { lbump('visits'); hit('visits'); };
  window.gamfPlay = function (slug) {
    if (!slug) return;
    lbump('plays');
    // remember the set of slugs played on this device
    try {
      var key = LP + 'play-' + slug;
      localStorage.setItem(key, (+localStorage.getItem(key) || 0) + 1);
    } catch (e) {}
    hit('plays'); hit('play-' + slug);
  };

  window.gamfStats = {
    getGlobal: get,
    getGlobalMany: function (keys) {
      return Promise.all(keys.map(function (k) { return get(k).then(function (v) { return [k, v]; }); }))
        .then(function (pairs) { var o = {}; pairs.forEach(function (p) { o[p[0]] = p[1]; }); return o; });
    },
    local: lget,
    localPlays: function () {
      var out = {};
      try {
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i);
          if (k && k.indexOf(LP + 'play-') === 0) out[k.slice((LP + 'play-').length)] = +localStorage.getItem(k) || 0;
        }
      } catch (e) {}
      return out;
    }
  };
})();
