/*! MuscleLove Games shared analytics + cross-play layer v1
 * Hosted at https://musclelove-games.vercel.app/ml-events.js
 * Loaded by every game via <script defer src=... data-ml-events>.
 * Sends GA4 custom events (G-HJLCFVY5TF, hostName tells the game apart):
 *   game_start / play_heartbeat / game_over_shown / replay_click
 *   share_click / patreon_click / portal_click / next_game_click / pill_shown
 * Also shows a small "next game" pill to deepen cross-game sessions.
 */
(function () {
  'use strict';
  if (window.__mlEventsLoaded) return;
  window.__mlEventsLoaded = true;

  var HOST = location.hostname;
  var GAME_ID = (HOST.split('.')[0] || 'unknown').toLowerCase();
  var IS_PORTAL = GAME_ID === 'musclelove-games';
  var PORTAL_URL = 'https://musclelove-games.vercel.app/';

  window.dataLayer = window.dataLayer || [];
  function gtagSafe() {
    if (typeof window.gtag === 'function') {
      window.gtag.apply(null, arguments);
    } else {
      window.dataLayer.push(arguments);
    }
  }

  function track(name, params) {
    var p = params || {};
    p.game_id = GAME_ID;
    try { gtagSafe('event', name, p); } catch (e) { /* never break the game */ }
  }
  window.mlTrack = track; // games may call mlTrack('game_over', {score: 123}) directly

  /* ---------- game_start: first real interaction ---------- */
  var started = IS_PORTAL; // portal counts as "started" so heartbeats run there too
  function onFirstInput() {
    if (!started) {
      started = true;
      track('game_start');
    }
    ['pointerdown', 'keydown', 'touchstart'].forEach(function (t) {
      document.removeEventListener(t, onFirstInput, true);
    });
  }
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (t) {
    document.addEventListener(t, onFirstInput, true);
  });

  /* ---------- play_heartbeat: active visible seconds ---------- */
  var activeSec = 0;
  var MARKS = { 15: 1, 30: 1, 60: 1, 120: 1, 300: 1 };
  var PILL_AT = 40;
  setInterval(function () {
    if (document.visibilityState !== 'visible' || !started) return;
    activeSec++;
    if (MARKS[activeSec]) track('play_heartbeat', { seconds: activeSec });
    if (activeSec === PILL_AT) showPill('idle');
  }, 1000);

  /* ---------- click tracking (delegated, capture) ---------- */
  document.addEventListener('click', function (ev) {
    var el = ev.target && ev.target.closest ? ev.target.closest('a,button') : null;
    if (!el) return;
    var href = (el.tagName === 'A' && el.href) ? el.href : '';
    var meta = (el.id || '') + ' ' + (typeof el.className === 'string' ? el.className : '');
    var label = (meta + ' ' + (el.textContent || '')).slice(0, 160);
    if (/patreon\.com/i.test(href)) {
      track('patreon_click');
    } else if (/(twitter|x)\.com\/intent/i.test(href) || /share/i.test(meta)) {
      track('share_click');
    } else if (href.indexOf('musclelove-games.vercel.app') !== -1 && !IS_PORTAL) {
      track('portal_click');
    } else if (/\.vercel\.app/i.test(href) && href.indexOf(HOST) === -1) {
      track('next_game_click', { to_game: (href.split('//')[1] || '').split('.')[0] });
    }
    if (/(retry|replay|restart|new-?game|try-?again|もう一度|リトライ|再挑戦)/i.test(label)) {
      track('replay_click');
    }
  }, true);

  /* ---------- game_over heuristic (id/class contains gameover) ---------- */
  var lastGO = 0;
  function isVisible(el) {
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }
  function checkGameOver(el) {
    if (!el || el.nodeType !== 1) return;
    var s = ((el.id || '') + ' ' + (typeof el.className === 'string' ? el.className : '')).toLowerCase();
    if (!/(game-?over|gameover)/.test(s)) return;
    if (!isVisible(el)) return;
    var now = Date.now();
    if (now - lastGO < 10000) return; // debounce 10s
    lastGO = now;
    track('game_over_shown');
    setTimeout(function () { showPill('gameover'); }, 1500);
  }
  function startObserver() {
    if (IS_PORTAL || !document.body || !window.MutationObserver) return;
    new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var m = muts[i];
        if (m.type === 'attributes') checkGameOver(m.target);
        else if (m.type === 'childList') {
          for (var j = 0; j < m.addedNodes.length; j++) checkGameOver(m.addedNodes[j]);
        }
      }
    }).observe(document.body, {
      subtree: true, childList: true,
      attributes: true, attributeFilter: ['class', 'style']
    });
  }

  /* ---------- "next game" pill ---------- */
  var NEXT_GAMES = [
    ['https://muscle-2048.vercel.app', '筋肉2048'],
    ['https://muscle-tetris.vercel.app', '筋肉テトリス'],
    ['https://muscle-snake.vercel.app', '筋肉スネーク'],
    ['https://muscle-breakout.vercel.app', '筋肉ブロック崩し'],
    ['https://muscle-whack.vercel.app', '筋肉モグラ叩き'],
    ['https://muscle-gacha.vercel.app', '筋肉ガチャ'],
    ['https://muscle-quiz.vercel.app', '筋肉クイズ'],
    ['https://muscle-typing.vercel.app', '筋肉タイピング'],
    ['https://muscle-wordle.vercel.app', '筋肉ワードル'],
    ['https://muscle-survivor.vercel.app', '筋肉サバイバー'],
    ['https://musclelove-fps.vercel.app', '筋肉FPS'],
    ['https://musclelove-runner.vercel.app', '筋肉ランナー3D'],
    ['https://muscle-sling-crash.vercel.app', '筋肉スリングクラッシュ'],
    ['https://muscle-arrow-fit.vercel.app', '筋肉アローフィット']
  ];
  var pillShown = false;
  function showPill(reason) {
    if (IS_PORTAL || pillShown || !document.body) return;
    try { if (sessionStorage.getItem('mlPillOff')) return; } catch (e) {}
    var pool = NEXT_GAMES.filter(function (g) { return g[0].indexOf(HOST) === -1; });
    if (!pool.length) return;
    var pick = pool[Math.floor(Math.random() * pool.length)];
    pillShown = true;
    track('pill_shown', { reason: reason });

    var css = document.createElement('style');
    css.textContent =
      '#ml-pill{position:fixed;right:12px;bottom:12px;z-index:2147483000;' +
      'background:#15151d;color:#fff;border:1px solid #ff2d3a;border-radius:14px;' +
      'padding:10px 12px;font-family:system-ui,sans-serif;font-size:13px;line-height:1.5;' +
      'box-shadow:0 6px 24px rgba(0,0,0,.45);max-width:230px;' +
      'animation:mlPillIn .35s ease}' +
      '@keyframes mlPillIn{from{transform:translateY(16px);opacity:0}to{transform:none;opacity:1}}' +
      '#ml-pill a{display:block;color:#fff;text-decoration:none;margin-top:6px;' +
      'background:#ff2d3a;border-radius:9px;padding:7px 10px;text-align:center;font-weight:700}' +
      '#ml-pill a.ml-pill-alt{background:transparent;border:1px solid #555;font-weight:400}' +
      '#ml-pill button{position:absolute;top:4px;right:7px;background:none;border:none;' +
      'color:#888;font-size:15px;cursor:pointer;padding:2px}';
    document.head.appendChild(css);

    var div = document.createElement('div');
    div.id = 'ml-pill';
    div.innerHTML =
      '<button type="button" aria-label="閉じる">✕</button>' +
      '<div>💪 ほかのゲームも遊ぶ？</div>' +
      '<a href="' + pick[0] + '">▶ ' + pick[1] + '</a>' +
      '<a class="ml-pill-alt" href="' + PORTAL_URL + '">🎮 全ゲーム一覧</a>';
    div.querySelector('button').addEventListener('click', function () {
      div.remove();
      try { sessionStorage.setItem('mlPillOff', '1'); } catch (e) {}
    });
    document.body.appendChild(div);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObserver);
  } else {
    startObserver();
  }
})();
