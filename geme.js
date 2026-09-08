'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const STORE = 'musclegeme-v2';
  const poseArtwork = ['emerald','crimson','platinum'].map(name => `images/pose-${name}-v3.png`);
  document.querySelectorAll('[data-pose]').forEach(button => button.addEventListener('click', () => {
    const index = Number(button.dataset.pose);
    if (!Number.isInteger(index) || !poseArtwork[index]) return;
    $('hero-character').src = poseArtwork[index];
    $('studio-character').src = poseArtwork[index];
    $('hero-character').alt = ['ダブルバイセップスポーズの成人女性','ラットスプレッドポーズの成人女性','サイドチェストポーズの成人女性'][index];
    document.querySelectorAll('[data-pose]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  }));
  const catalog = Object.freeze(window.ML_CATALOG || []);
  const validIds = new Set(catalog.map(g => g.id));
  const state = { favorites: new Set(), best: {}, save: false, reduced: matchMedia('(prefers-reduced-motion: reduce)').matches };
  try {
    const raw = localStorage.getItem(STORE);
    const saved = raw && raw.length < 30000 ? JSON.parse(raw) : null;
    if (saved && saved.version === 2 && saved.save === true) {
      state.save = true;
      state.reduced = typeof saved.reduced === 'boolean' ? saved.reduced : state.reduced;
      state.favorites = new Set(Array.isArray(saved.favorites) ? saved.favorites.filter(id => validIds.has(id)) : []);
      for (const mode of ['timing', 'memory', 'sequence']) {
        const score = saved.best?.[mode];
        if (Number.isInteger(score) && score >= 0 && score <= 10000) state.best[mode] = score;
      }
    }
  } catch { /* Storage is optional, including private mode and malformed data. */ }
  function save() {
    if (!state.save) return;
    try { localStorage.setItem(STORE, JSON.stringify({version: 2, save: true, reduced: state.reduced, favorites: [...state.favorites], best: state.best})); }
    catch { $('settings-status').textContent = 'このブラウザでは保存できません。閉じるまではそのまま遊べます。'; }
  }
  document.body.classList.toggle('reduced-motion', state.reduced);
  $('save-setting').checked = state.save;
  $('motion-setting').checked = state.reduced;
  function node(tag, text, cls) { const el = document.createElement(tag); if (text !== undefined) el.textContent = text; if (cls) el.className = cls; return el; }
  const local = ['127.0.0.1', 'localhost'].includes(location.hostname);
  function destination(game) {
    // Only repository-generated paths/hosts; URL/hash/search input cannot become a destination.
    if (local) return `${location.protocol}//${game.folder.toLowerCase()}.localhost:${location.port}/${game.entry}`;
    const u = new URL(game.url);
    if (u.protocol !== 'https:' || !/^[a-z0-9-]+\.vercel\.app$/.test(u.hostname)) throw new Error('Invalid game destination');
    return u.href;
  }
  let category = 'すべて', onlyFavorites = false, visible = 16;
  const categories = ['すべて', ...new Set(catalog.map(g => g.category))];
  const filterButtons = categories.map(cat => {
    const b = node('button', cat, 'filter'); b.setAttribute('aria-pressed', String(cat === category));
    b.addEventListener('click', () => { category = cat; visible = 16; render(); }); $('filters').append(b); return b;
  });
  function filtered() {
    const query = $('search').value.trim().slice(0,100).toLocaleLowerCase();
    return catalog.filter(g => (!onlyFavorites || state.favorites.has(g.id)) && (category === 'すべて' || g.category === category) && (!query || (g.title+' '+g.desc_ja+' '+g.genre).toLocaleLowerCase().includes(query)));
  }
  function render() {
    const matches = filtered(); $('games').replaceChildren();
    filterButtons.forEach((b, i) => b.setAttribute('aria-pressed', String(categories[i] === category)));
    $('favorites').setAttribute('aria-pressed', String(onlyFavorites));
    $('result-count').textContent = `${matches.length}作品${onlyFavorites ? 'のお気に入り' : ''} · ${Math.min(matches.length, visible)}作品を表示`;
    $('empty').hidden = matches.length !== 0; $('more').hidden = matches.length <= visible;
    for (const g of matches.slice(0, visible)) {
      const card = node('article', undefined, 'catalog-card'); const a = node('a'); a.href = destination(g);
      const art = node('div', undefined, 'catalog-thumb'); const portrait = node('img'); portrait.src = poseArtwork[(Number(g.color) || 0) % poseArtwork.length]; portrait.alt = ''; portrait.loading = 'lazy'; portrait.width = 1536; portrait.height = 1024; art.append(portrait); art.dataset.color = String(g.color); art.setAttribute('aria-hidden', 'true');
      const body = node('div', undefined, 'catalog-body'); body.append(node('small', g.category), node('h3', g.title), node('p', g.desc_ja)); a.append(art, body);
      const favorite = node('button', state.favorites.has(g.id) ? '♥' : '♡', 'favorite');
      favorite.setAttribute('aria-label', `${g.title}をお気に入り${state.favorites.has(g.id) ? 'から外す' : 'に追加'}`);
      favorite.setAttribute('aria-pressed', String(state.favorites.has(g.id)));
      favorite.addEventListener('click', () => {
        if (state.favorites.has(g.id)) state.favorites.delete(g.id); else state.favorites.add(g.id); save();
        if (onlyFavorites) { render(); $('favorites').focus(); }
        else { favorite.textContent = state.favorites.has(g.id) ? '♥' : '♡'; favorite.setAttribute('aria-pressed', String(state.favorites.has(g.id))); favorite.setAttribute('aria-label', `${g.title}をお気に入り${state.favorites.has(g.id) ? 'から外す' : 'に追加'}`); }
      }); card.append(a, favorite); $('games').append(card);
    }
  }
  $('total').textContent = `${catalog.length} GAMES + 3 NEW`;
  $('search').addEventListener('input', () => {visible = 16; render();});
  $('favorites').addEventListener('click', () => { onlyFavorites = !onlyFavorites; visible = 16; render(); });
  $('more').addEventListener('click', () => {visible += 16; render();});
  $('random').addEventListener('click', () => {const options = filtered(); if (options.length) location.assign(destination(options[Math.floor(Math.random()*options.length)]));});
  render();
  for (const id of ['settings-button','privacy-button']) $(id).addEventListener('click', () => $('settings-dialog').showModal());
  $('close-settings').addEventListener('click', () => $('settings-dialog').close());
  $('save-setting').addEventListener('change', e => {
    state.save = e.target.checked;
    try { if (!state.save) localStorage.removeItem(STORE); else save(); $('settings-status').textContent = state.save ? '保存をオンにしました。' : '保存をオフにして、保存済みデータを消しました。'; }
    catch { $('settings-status').textContent = 'ブラウザの保存機能が使えません。'; }
  });
  $('motion-setting').addEventListener('change', e => {state.reduced = e.target.checked; document.body.classList.toggle('reduced-motion', state.reduced); save();});
  $('clear-data').addEventListener('click', () => {try {localStorage.removeItem(STORE);} catch {} state.favorites.clear(); state.best = {}; state.save = false; $('save-setting').checked = false; render(); $('settings-status').textContent = 'この新画面のお気に入りと記録を消しました。';});

  const poses = [ ['Y', '両腕アップ'], ['W', 'ダブルポーズ'], ['↑', '上へストレッチ'], ['↗', 'サイドストレッチ'], ['◇', 'ひじをひらく'], ['✳', 'リラックス'] ];
  const names = {timing: 'ポーズキャッチ', memory: 'ポーズペア', sequence: 'ポーズメモリー'};
  let mode = 'timing', playing = false, paused = false, score = 0, round = 0, elapsed = 0, lastTime = 0, animation = 0, timers = new Set(), generation = 0;
  let sequence = [], inputIndex = 0, accepting = false, buttons = [], cards = [], flipped = [], matches = 0, moves = 0, locked = false, canvas, marker = 0;
  function later(fn, ms) { const epoch = generation; const id = setTimeout(() => {timers.delete(id); if (generation === epoch && $('game-dialog').open) fn();}, ms); timers.add(id); }
  function cleanup() { generation++; for(const id of timers) clearTimeout(id); timers.clear(); cancelAnimationFrame(animation); playing = false; accepting = false; }
  function updateStats() { $('round').textContent = mode === 'timing' ? `${round} / 12 ポーズ` : mode === 'memory' ? `${matches} / 6 ペア · ${moves} 手` : `${round} / 5 ステージ`; $('score').textContent = `${score} pt`; }
  function openGame(next) {
    cleanup(); mode = next; score = round = moves = matches = elapsed = 0; paused = false;
    $('game-title').textContent = names[mode];
    $('instructions').textContent = mode === 'timing' ? '緑のゾーンでタップ、またはスペース。12回で終了。ポーズは全部、最初から楽しめます。' : mode === 'memory' ? 'カードを2枚ずつめくって、同じポーズを6ペアそろえよう。時間制限はありません。' : '光る順番を覚えて、同じ順に押そう。間違えても同じステージを練習できます。';
    $('game-board').replaceChildren(); $('feedback').textContent = '準備ができたらスタート。'; $('coach-message').textContent = 'ポーズに、力を込めて。';
    $('start-game').hidden = false; $('start-game').textContent = 'スタート'; $('pause-game').hidden = true;
    updateStats(); $('game-dialog').showModal(); $('start-game').focus();
  }
  document.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => openGame(b.dataset.mode)));
  $('close-game').addEventListener('click', () => $('game-dialog').close());
  $('game-dialog').addEventListener('close', cleanup);
  $('game-dialog').addEventListener('cancel', cleanup);
  function finish() {
    cleanup(); $('pause-game').hidden = true; $('start-game').hidden = false; $('start-game').textContent = 'もう一度遊ぶ';
    state.best[mode] = Math.max(state.best[mode] || 0, score); save();
    const card = node('div', undefined, 'result-card'); card.append(node('span', 'おつかれさま！'), node('strong', `${score} pt`), node('p', `最高記録 ${state.best[mode]} pt${state.save ? '' : '（この画面を閉じるまで）'}`));
    $('game-board').replaceChildren(card); $('feedback').textContent = 'いいポーズ！また自分のペースで遊ぼう。'; $('coach-message').textContent = 'その記録が、あなたの強さ。'; updateStats();
  }
  function shuffle(list) {const a = [...list]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function start() {
    cleanup(); playing = true; paused = false; score = round = elapsed = moves = matches = 0; locked = false; flipped = [];
    $('game-board').replaceChildren(); $('feedback').textContent = '楽しんでいこう！'; $('start-game').hidden = true; $('pause-game').hidden = mode !== 'timing'; $('pause-game').textContent = '一時停止';
    if (mode === 'timing') {
      canvas = node('canvas', undefined, 'track'); canvas.width = 720; canvas.height = 156; canvas.tabIndex = 0; canvas.setAttribute('role', 'button'); canvas.setAttribute('aria-label', '緑のゾーンでポーズを決める。スペースまたはエンター');
      canvas.addEventListener('pointerdown', e => {if(e.button===0) tap();});
      canvas.addEventListener('keydown', e => {if([' ', 'Enter'].includes(e.key)){e.preventDefault();if(!e.repeat)tap();}});
      $('game-board').append(canvas); lastTime = performance.now(); animation = requestAnimationFrame(frame); canvas.focus();
    } else if (mode === 'memory') {
      const board = node('div', undefined, 'memory-board'); cards = shuffle([...poses.keys(), ...poses.keys()]);
      buttons = cards.map((_, i) => { const b = node('button','？','pose-card'); b.setAttribute('aria-label', `カード${i+1}をめくる`); b.addEventListener('click', () => flip(i)); board.append(b); return b; }); $('game-board').append(board);
    } else {
      round = 1; sequence = []; createSequenceBoard(); nextSequence();
    }
    updateStats();
  }
  function frame(now) {
    if(!playing || paused) return;
    elapsed += Math.min(now-lastTime, 100); lastTime = now; marker = (Math.sin(elapsed / 520 - Math.PI/2)+1)/2;
    const ctx = canvas.getContext('2d'); ctx.clearRect(0,0,720,156); ctx.fillStyle = '#e7e7da';ctx.fillRect(0,0,720,156);ctx.fillStyle='#afd7bc';ctx.fillRect(720*.35,0,720*.3,156);
    ctx.fillStyle='#315846';ctx.font='bold 21px sans-serif';ctx.textAlign='center';ctx.fillText('ここでポーズ！',360,36);
    ctx.fillStyle='#202c2a';ctx.beginPath();ctx.arc(16+marker*688,100,16,0,Math.PI*2);ctx.fill(); animation=requestAnimationFrame(frame);
  }
  function tap() {
    if (!playing || paused || locked) return;
    const distance = Math.abs(marker-.5); const gain = distance <= .075 ? 100 : distance <= .15 ? 60 : 10;
    score += gain; round++; locked = true; later(() => {locked = false;}, 220);
    $('feedback').textContent = `${gain === 100 ? 'ぴったり！' : gain === 60 ? 'いいポーズ！' : '次のポーズにいこう！'} +${gain} pt`;
    $('coach-message').textContent = poses[(round-1)%poses.length][1]; updateStats(); if(round===12) finish();
  }
  $('pause-game').addEventListener('click', () => {
    if(!playing || mode !== 'timing')return; paused=!paused; $('pause-game').textContent=paused?'再開':'一時停止';
    if(paused){cancelAnimationFrame(animation);$('feedback').textContent='休憩中。再開すると続きを遊べます。';}else{lastTime=performance.now();animation=requestAnimationFrame(frame);$('feedback').textContent='続けよう！';canvas.focus();}
  });
  document.addEventListener('visibilitychange', () => {if(document.hidden && playing && !paused && mode==='timing') $('pause-game').click();});
  function reveal(i) {buttons[i].replaceChildren(node('span',poses[cards[i]][0],'pose-symbol'),node('span',poses[cards[i]][1]));buttons[i].setAttribute('aria-label',poses[cards[i]][1]);}
  function flip(i) {
    if(!playing||locked||buttons[i].disabled||flipped.includes(i))return;
    reveal(i);flipped.push(i); if(flipped.length<2)return; moves++; updateStats(); const [a,b]=flipped;
    if(cards[a]===cards[b]){
      for(const j of flipped){buttons[j].disabled=true;buttons[j].classList.add('matched');}flipped=[];matches++;score+=100;$('feedback').textContent='ペアになった！ +100 pt'; updateStats();if(matches===6){score+=Math.max(0,30-moves)*10;later(finish,650);}
    } else {locked=true;$('feedback').textContent='もう一度、よく見てみよう。';later(()=>{for(const j of [a,b]){buttons[j].textContent='？';buttons[j].setAttribute('aria-label',`カード${j+1}をめくる`);}flipped=[];locked=false;},900);}
  }
  function createSequenceBoard(){const board=node('div',undefined,'sequence-board');buttons=poses.slice(0,4).map((p,i)=>{const b=node('button',undefined,'pose-card');b.append(node('span',p[0],'pose-symbol'),node('span',p[1]));b.addEventListener('click',()=>sequenceTap(i));board.append(b);return b;});$('game-board').append(board);}
  function nextSequence(replay=false) {
    accepting=false;inputIndex=0;buttons.forEach(b=>b.disabled=true);
    if(!replay) sequence.push(Math.floor(Math.random()*4));
    $('feedback').textContent='順番を覚えよう。';
    sequence.forEach((v,i)=>{later(()=>{buttons[v].classList.add('lit');$('coach-message').textContent=`${i+1}：${poses[v][1]}`;},500+i*900);later(()=>buttons[v].classList.remove('lit'),1100+i*900);});
    later(()=>{accepting=true;buttons.forEach(b=>b.disabled=false);$('feedback').textContent='同じ順に押してみよう。';buttons[0].focus();},500+sequence.length*900);
  }
  function sequenceTap(i){
    if(!playing||!accepting)return;
    if(i!==sequence[inputIndex]){$('feedback').textContent='もう一度、同じ順番を見てみよう。';accepting=false;later(()=>nextSequence(true),850);return;}
    buttons[i].classList.add('lit');later(()=>buttons[i].classList.remove('lit'),200);inputIndex++;
    if(inputIndex===sequence.length){accepting=false;score+=round*100;updateStats();if(round===5){later(finish,500);}else{$('feedback').textContent='正解！次は少し長くなるよ。';later(()=>{round++;updateStats();nextSequence();},850);}}
  }
  $('start-game').addEventListener('click', start);
})();
