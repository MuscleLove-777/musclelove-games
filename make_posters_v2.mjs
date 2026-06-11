// make_posters_v2.mjs
// Generate 45 posters: top half = imgN.png character photo, bottom half = title JP/EN + subtitle JP/EN.
// Output: images/poster_*.png and images/img_fps.png / img_slasher.png / img_runner.png (overwrite)
//
// Usage: node make_posters_v2.mjs

import path from 'path';
import fs from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Borrow puppeteer-core from the temp install
const PUP_PATH = 'C:/Users/atsus/AppData/Local/Temp/pupcheck/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
const { default: puppeteer } = await import(pathToFileURL(PUP_PATH).href);

const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const IMAGES_DIR  = path.join(__dirname, 'images');

// ============================================================
// GAMES array (mirrored from index.html)
// ============================================================
const GAMES = [
  { title: '筋肉パズル',       genre: 'Match-3 Puzzle',     img: 'images/poster_puzzle.png',        desc_ja: '筋肉美女のマッチ3パズル！3つ揃えて消せ！', desc_en: 'Match-3 puzzle with muscle girls! Line up 3 to clear!' },
  { title: '筋肉ガチャ',       genre: 'Gacha',              img: 'images/poster_gacha.png',         desc_ja: 'SSRを引け！筋肉美女ガチャ！レアキャラをコンプしよう', desc_en: 'Pull for SSR! Muscle girl gacha! Collect rare characters!' },
  { title: '筋肉神経衰弱',     genre: 'Memory',             img: 'images/poster_memory.png',        desc_ja: 'カードをめくってペアを見つけろ！記憶力×筋肉美女', desc_en: 'Flip cards and find pairs! Memory game with muscle girls!' },
  { title: '筋肉スライドパズル', genre: 'Slide Puzzle',     img: 'images/poster_slide.png',         desc_ja: 'バラバラの画像をスライドして完成させよう！', desc_en: 'Slide the tiles to complete the image!' },
  { title: '筋肉タイピング',   genre: 'Typing',             img: 'images/poster_typing.png',        desc_ja: '筋トレ用語を高速タイピング！WPMを競え！', desc_en: 'Speed-type fitness terms! Compete for the best WPM!' },
  { title: '筋肉クイズ',       genre: 'Quiz',               img: 'images/poster_quiz.png',          desc_ja: '筋肉の知識を試せ！全問正解で筋肉博士認定', desc_en: 'Test your muscle knowledge! Become Muscle Master!' },
  { title: '筋肉ジグソー',     genre: 'Jigsaw',             img: 'images/poster_jigsaw.png',        desc_ja: 'ドラッグ＆ドロップでジグソーパズルを完成させよう！', desc_en: 'Drag & drop to complete the jigsaw puzzle!' },
  { title: '筋肉おみくじ',     genre: 'Fortune',            img: 'images/poster_omikuji.png',       desc_ja: '毎日1回！今日の筋肉運を占おう', desc_en: 'Once a day! Draw your daily muscle fortune!' },
  { title: '筋肉相性診断',     genre: 'Personality',        img: 'images/poster_shindan.png',       desc_ja: '5つの質問であなたの筋肉タイプを診断！', desc_en: '5 questions to find your muscle personality type!' },
  { title: '筋肉リアクション', genre: 'Reaction',           img: 'images/poster_reaction.png',      desc_ja: '画像が出たら即タップ！反射神経テスト', desc_en: 'Tap when the image appears! Test your reflexes!' },
  { title: '筋肉キャッチ',     genre: 'Catch',              img: 'images/poster_catch.png',         desc_ja: '落ちてくる筋肉美女をキャッチ！ジャンクフードは避けろ', desc_en: 'Catch falling muscle girls! Avoid junk food!' },
  { title: '筋肉ランナー3D',   genre: 'Endless Runner 3D',  img: 'images/img_runner.png',           desc_ja: '3レーン無限ランナー！背後からゾンビ集団が迫る！', desc_en: '3-lane endless runner! Zombies chasing from behind!' },
  { title: '筋肉シューティング', genre: 'Shooter',          img: 'images/poster_shooter.png',       desc_ja: 'ポップアップするターゲットを撃て！命中率を競え', desc_en: 'Shoot pop-up targets! Compete for accuracy!' },
  { title: '筋肉ティアリスト', genre: 'Tier List',          img: 'images/poster_tierlist.png',      desc_ja: 'S〜Dランクに分類！俺のティアリストを作ろう', desc_en: 'Rank S to D! Create your own tier list!' },
  { title: '筋肉ビフォーアフター', genre: 'Before-After',   img: 'images/poster_beforeafter.png',   desc_ja: 'スライダーで筋トレ前後を比較！この変化ヤバい', desc_en: 'Slide to compare before & after! Amazing transformation!' },
  { title: '筋肉バトル',       genre: 'VS Vote',            img: 'images/poster_vs.png',            desc_ja: '2枚の画像、どっちが好き？投票バトル！', desc_en: 'Two images - which do you prefer? Vote battle!' },
  { title: '筋肉2048',         genre: '2048 Puzzle',        img: 'images/poster_2048.png',          desc_ja: 'タイルを合体させてLEGENDを目指せ！中毒性MAX', desc_en: 'Merge tiles to reach LEGEND! Super addictive!' },
  { title: '筋肉フリック',     genre: 'Swipe',              img: 'images/poster_flick.png',         desc_ja: 'Tinder風にスワイプ！推しコレクションを作ろう', desc_en: 'Tinder-style swipe! Build your favorites collection!' },
  { title: '筋肉タワー',       genre: 'Tower Stack',        img: 'images/poster_tower.png',         desc_ja: 'タイミングよくタップしてブロックを積め！', desc_en: 'Tap to stack blocks! How high can you go?' },
  { title: '筋肉カレンダー',   genre: 'Daily',              img: 'images/poster_calendar.png',      desc_ja: '毎日変わる画像＆筋トレメニュー！日めくりカレンダー', desc_en: 'Daily image & workout menu! Muscle calendar!' },
  { title: '筋肉スネーク',     genre: 'Snake',              img: 'images/poster_snake.png',         desc_ja: 'プロテインを食べて成長！クラシックスネークゲーム', desc_en: 'Eat protein and grow! Classic snake game!' },
  { title: '筋肉ブロック崩し', genre: 'Breakout',           img: 'images/poster_breakout.png',      desc_ja: 'ブロックを全部壊して隠された画像を解放せよ！', desc_en: 'Break all bricks to reveal the hidden image!' },
  { title: '筋肉ルーレット',   genre: 'Roulette',           img: 'images/poster_roulette.png',      desc_ja: 'ルーレットを回して筋トレチャレンジをゲット！', desc_en: 'Spin the wheel and get a workout challenge!' },
  { title: '筋肉リズム',       genre: 'Rhythm',             img: 'images/poster_rhythm.png',        desc_ja: 'リズムに合わせてノートをタップ！音ゲー×筋肉', desc_en: 'Tap notes to the beat! Rhythm meets muscle!' },
  { title: '筋肉間違い探し',   genre: 'Spot Diff',          img: 'images/poster_spotdiff.png',      desc_ja: '2枚の画像の違いを見つけろ！観察力テスト', desc_en: 'Find the differences between two images!' },
  { title: '筋肉ワードル',     genre: 'Wordle',             img: 'images/poster_wordle.png',        desc_ja: '筋トレ英単語を5文字で当てろ！毎日1問', desc_en: 'Guess the 5-letter fitness word! Daily challenge!' },
  { title: '筋肉スロット',     genre: 'Slots',              img: 'images/poster_slots.png',         desc_ja: '💪3つ揃えてメガジャックポット！', desc_en: 'Line up 3 muscles for MEGA JACKPOT!' },
  { title: '筋肉モグラ叩き',   genre: 'Whack-a-Mole',       img: 'images/poster_whack.png',         desc_ja: 'ダンベルを叩け！プロテインは逃すな！', desc_en: 'Whack dumbbells! Catch the protein!' },
  { title: '筋肉ポン',         genre: 'Pong',               img: 'images/poster_pong.png',          desc_ja: 'ダンベルを打ち返せ！ネオンポンバトル', desc_en: 'Bounce the dumbbell! Neon pong battle!' },
  { title: '筋肉ハングマン',   genre: 'Hangman',            img: 'images/poster_hangman.png',       desc_ja: '筋トレ英単語を1文字ずつ推理！', desc_en: 'Guess the fitness word letter by letter!' },
  { title: '筋肉迷路',         genre: 'Maze',               img: 'images/poster_maze.png',          desc_ja: 'ゴールのプロテインを目指して迷路を突破！', desc_en: 'Navigate the maze to reach the protein!' },
  { title: '筋肉バブル',       genre: 'Bubble Shooter',     img: 'images/poster_bubble.png',        desc_ja: '同じ色を3つ以上繋げてバブルを消せ！', desc_en: 'Connect 3+ same-color bubbles to pop!' },
  { title: '筋肉サイモン',     genre: 'Simon Says',         img: 'images/poster_simon.png',         desc_ja: '光った順番を覚えろ！記憶力チャレンジ', desc_en: 'Remember the sequence! Memory challenge!' },
  { title: '筋肉クリッカー',   genre: 'Clicker',            img: 'images/poster_clicker.png',       desc_ja: 'タップで筋トレ！筋肉の神を目指せ！', desc_en: 'Tap to train! Become the Muscle God!' },
  { title: '筋肉インベーダー', genre: 'Invaders',           img: 'images/poster_invaders.png',      desc_ja: 'ジャンクフードの侵略を阻止せよ！', desc_en: 'Stop the junk food invasion!' },
  { title: '筋肉テトリス',     genre: 'Tetris',             img: 'images/poster_tetris.png',        desc_ja: '落ちてくるブロックを並べてライン消去！', desc_en: 'Stack falling blocks and clear lines!' },
  { title: '筋肉マッチ3',     genre: 'Match-3',            img: 'images/poster_match3.png',        desc_ja: '筋肉アイコンを3つ揃えてコンボを決めろ！', desc_en: 'Match 3 muscle icons for combos!' },
  { title: '筋肉ダーツ',       genre: 'Darts',              img: 'images/poster_darts.png',         desc_ja: '動く的を狙ってダーツを投げろ！', desc_en: 'Aim and throw darts at the moving target!' },
  { title: '筋肉フィッシング', genre: 'Fishing',            img: 'images/poster_fishing.png',       desc_ja: 'タイミングよく釣り上げろ！レア筋肉魚を狙え', desc_en: 'Catch muscle fish with perfect timing!' },
  { title: '筋肉バランス',     genre: 'Balance Stack',      img: 'images/poster_balance.png',       desc_ja: 'ブロックをピッタリ積み上げろ！何段いける？', desc_en: 'Stack blocks perfectly! How high can you go?' },
  { title: '筋肉ローグライク', genre: 'Roguelike RPG',      img: 'images/poster_roguelike.png',     desc_ja: '筋肉美女でダンジョン攻略！レリック集めてボス撃破', desc_en: 'Dungeon crawl with muscle girls! Defeat bosses!' },
  { title: '筋肉バトルライン', genre: 'Tower Defense',      img: 'images/poster_battle.png',        desc_ja: '筋肉美女vsジャンクフード軍団！にゃんこ大戦争風TD！', desc_en: 'Muscle girls vs Junk Food army! Cat-battle TD!' },
  { title: '筋肉3Dテトリス',   genre: '3D Tetris',          img: 'images/poster_tetris3d.png',      desc_ja: 'ネオン光るリアル3Dブロックのテトリス！音も鳴る本格派', desc_en: 'Realistic 3D neon blocks with sound!' },
  { title: '筋肉FPS',         genre: 'FPS 3D',             img: 'images/img_fps.png',              desc_ja: 'ゾンビ美女の群れを撃ちまくる本格3D FPS！8武器×10ウェーブ', desc_en: 'Shoot hordes of muscle zombies! 8 weapons, 10 waves!' },
  { title: '筋肉スラッシャー', genre: 'Action 3D',          img: 'images/img_slasher.png',          desc_ja: '5種の近接武器で美少女ゾンビ無双！コンボ＆必殺技でぶっ飛ばせ', desc_en: 'Slash through zombies! 5 weapons, combos & skills!' },
];

// ============================================================
// EN title dictionary
// ============================================================
const TITLE_EN = {
  '筋肉パズル': 'MUSCLE PUZZLE',
  '筋肉ガチャ': 'MUSCLE GACHA',
  '筋肉神経衰弱': 'MUSCLE MEMORY',
  '筋肉スライドパズル': 'MUSCLE SLIDE',
  '筋肉タイピング': 'MUSCLE TYPING',
  '筋肉クイズ': 'MUSCLE QUIZ',
  '筋肉ジグソー': 'MUSCLE JIGSAW',
  '筋肉おみくじ': 'MUSCLE OMIKUJI',
  '筋肉相性診断': 'MUSCLE SHINDAN',
  '筋肉リアクション': 'MUSCLE REFLEX',
  '筋肉キャッチ': 'MUSCLE CATCH',
  '筋肉シューティング': 'MUSCLE SHOOTER',
  '筋肉ティアリスト': 'MUSCLE TIER',
  '筋肉ビフォーアフター': 'BEFORE & AFTER',
  '筋肉バトル': 'MUSCLE VS',
  '筋肉2048': 'MUSCLE 2048',
  '筋肉フリック': 'MUSCLE FLICK',
  '筋肉タワー': 'MUSCLE TOWER',
  '筋肉カレンダー': 'MUSCLE CALENDAR',
  '筋肉スネーク': 'MUSCLE SNAKE',
  '筋肉ブロック崩し': 'MUSCLE BREAKOUT',
  '筋肉ルーレット': 'MUSCLE ROULETTE',
  '筋肉リズム': 'MUSCLE RHYTHM',
  '筋肉間違い探し': 'SPOT THE DIFF',
  '筋肉ワードル': 'MUSCLE WORDLE',
  '筋肉スロット': 'MUSCLE SLOTS',
  '筋肉モグラ叩き': 'MUSCLE WHACK',
  '筋肉ポン': 'MUSCLE PONG',
  '筋肉ハングマン': 'MUSCLE HANGMAN',
  '筋肉迷路': 'MUSCLE MAZE',
  '筋肉バブル': 'MUSCLE BUBBLE',
  '筋肉サイモン': 'MUSCLE SIMON',
  '筋肉クリッカー': 'MUSCLE CLICKER',
  '筋肉インベーダー': 'MUSCLE INVADER',
  '筋肉テトリス': 'MUSCLE TETRIS',
  '筋肉マッチ3': 'MUSCLE MATCH-3',
  '筋肉ダーツ': 'MUSCLE DARTS',
  '筋肉フィッシング': 'MUSCLE FISHING',
  '筋肉バランス': 'MUSCLE BALANCE',
  '筋肉ローグライク': 'MUSCLE ROGUE',
  '筋肉バトルライン': 'MUSCLE BATTLE',
  '筋肉3Dテトリス': 'MUSCLE TETRIS 3D',
  '筋肉ランナー3D': 'MUSCLE RUNNER',
  '筋肉FPS': 'MUSCLE FPS',
  '筋肉スラッシャー': 'MUSCLE SLASHER',
};

// ============================================================
// Genre -> accent color
// ============================================================
function accentFor(genre) {
  const g = (genre || '').toLowerCase();
  if (/(fps 3d|action 3d|endless runner 3d|3d tetris)/.test(g)) return '#FF2D3A';
  if (/(match-3|match3|tower stack|2048|balance)/.test(g)) return '#4ADE80';
  if (/(puzzle|slide|jigsaw)/.test(g)) return '#38BDF8';
  if (/(quiz|typing|hangman|wordle)/.test(g)) return '#FACC15';
  if (/(memory|simon|spot diff)/.test(g)) return '#67E8F9';
  if (/(gacha|roulette|slots|fortune|omikuji)/.test(g)) return '#FCD34D';
  if (/(reaction|catch|whack|darts|pong|invaders|shooter|clicker)/.test(g)) return '#FB923C';
  if (/(snake|breakout|bubble|maze|tetris)/.test(g)) return '#60A5FA';
  if (/(personality|tier list|before-after|vs vote|swipe|flick|fishing)/.test(g)) return '#C084FC';
  if (/(roguelike)/.test(g)) return '#F87171';
  if (/(tower defense)/.test(g)) return '#E879F9';
  if (/(daily|rhythm|calendar)/.test(g)) return '#CBD5E1';
  return '#FCA5A5';
}

// ============================================================
// Resolve which character image (imgN.png) to embed
// ============================================================
function characterImageFor(game, idx) {
  // Override for 3D 3 titles
  if (game.genre === 'FPS 3D')           return 'images/img13.png';
  if (game.genre === 'Action 3D')        return 'images/img41.png';
  if (game.genre === 'Endless Runner 3D')return 'images/img12.png';
  // 1-based, cap at 42
  let n = idx + 1;
  if (n > 42) n = ((n - 1) % 42) + 1;
  return `images/img${n}.png`;
}

// ============================================================
// HTML template per poster
// ============================================================
function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildHtml({ titleJa, titleEn, subJa, subEn, genre, accent, characterUrl }) {
  return `<!doctype html>
<html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700;900&family=Bebas+Neue&family=Roboto:ital,wght@1,400&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{width:872px;height:1536px;overflow:hidden}
  body{
    background:radial-gradient(ellipse at top, #1a0010 0%, #0a0005 60%, #000 100%);
    position:relative;font-family:'Noto Sans JP',sans-serif;color:#fff;
  }
  .hero-img{
    position:absolute;top:0;left:0;width:872px;height:960px;
    background-image:url('${characterUrl}');
    background-size:cover;background-position:center top;
  }
  .hero-img::after{
    content:'';position:absolute;left:0;right:0;bottom:0;height:280px;
    background:linear-gradient(180deg, transparent 0%, rgba(10,0,5,0.6) 50%, #0a0005 100%);
  }
  .genre-tag{
    position:absolute;top:30px;right:30px;z-index:5;
    padding:12px 26px;
    background:rgba(0,0,0,0.78);
    border:2px solid ${accent};
    color:${accent};
    font-family:'Bebas Neue',sans-serif;
    font-size:30px;letter-spacing:4px;
    border-radius:6px;
    text-shadow:0 0 12px ${accent}80;
    box-shadow:0 0 24px ${accent}40;
  }
  .text-panel{
    position:absolute;top:880px;left:0;width:872px;height:656px;
    padding:40px 48px;text-align:center;
    background:linear-gradient(180deg, transparent 0%, #0a0005 12%, #0a0005 100%);
  }
  .title-jp{
    font-family:'Noto Sans JP',sans-serif;font-weight:900;
    font-size:88px;letter-spacing:6px;line-height:1.05;
    color:#fff;
    text-shadow:
      0 0 18px ${accent},
      0 0 36px ${accent}80,
      0 4px 8px rgba(0,0,0,0.9);
    margin-top:30px;
  }
  .title-en{
    font-family:'Bebas Neue',sans-serif;
    font-size:64px;letter-spacing:8px;
    color:${accent};
    text-shadow:
      0 4px 0 #000,
      0 0 24px ${accent}80;
    margin-top:18px;
  }
  .divider{
    width:480px;height:3px;margin:28px auto;
    background:linear-gradient(90deg, transparent 0%, ${accent} 50%, transparent 100%);
    border-radius:2px;
  }
  .subtitle-jp{
    font-family:'Noto Sans JP',sans-serif;font-weight:700;
    font-size:30px;color:#FFEEAA;line-height:1.4;
    margin:0 24px;
    text-shadow:0 2px 6px rgba(0,0,0,0.9);
  }
  .subtitle-en{
    font-family:'Roboto','Segoe UI',sans-serif;font-style:italic;
    font-size:22px;color:#CCC;line-height:1.4;
    margin:14px 32px 0;
    text-shadow:0 2px 4px rgba(0,0,0,0.9);
  }
  .brand{
    position:absolute;left:0;right:0;bottom:50px;
    text-align:center;
    font-family:'Bebas Neue',sans-serif;
    font-size:42px;letter-spacing:10px;
    color:#FFD700;
    text-shadow:0 0 16px #FFD70080, 0 4px 8px rgba(0,0,0,0.9);
  }
  .brand .e{
    font-size:36px;
    margin:0 14px;
    vertical-align:middle;
  }
</style></head>
<body>
  <div class="hero-img"></div>
  <div class="genre-tag">${escHtml(genre)}</div>
  <div class="text-panel">
    <div class="title-jp">${escHtml(titleJa)}</div>
    <div class="title-en">${escHtml(titleEn)}</div>
    <div class="divider"></div>
    <div class="subtitle-jp">${escHtml(subJa)}</div>
    <div class="subtitle-en">${escHtml(subEn)}</div>
  </div>
  <div class="brand"><span class="e">💪</span>MUSCLELOVE<span class="e">💪</span></div>
</body></html>`;
}

// ============================================================
// Main
// ============================================================
async function main() {
  if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

  console.log('Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  let ok = 0, fail = 0;
  const samples = [];

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 872, height: 1536, deviceScaleFactor: 1 });

    for (let i = 0; i < GAMES.length; i++) {
      const g = GAMES[i];
      const titleJa = g.title;
      const titleEn = TITLE_EN[g.title] || ('MUSCLE ' + (g.genre || '').toUpperCase().replace(/[^A-Z0-9 -]/g, '').trim());
      const accent  = accentFor(g.genre);
      const charImg = characterImageFor(g, i);
      const charAbs = path.join(__dirname, charImg);
      if (!fs.existsSync(charAbs)) {
        console.log(`[skip ${i+1}/${GAMES.length}] missing character image: ${charImg}`);
        fail++;
        continue;
      }
      const charUrl = pathToFileURL(charAbs).href;

      const html = buildHtml({
        titleJa, titleEn,
        subJa: g.desc_ja, subEn: g.desc_en,
        genre: g.genre,
        accent,
        characterUrl: charUrl,
      });

      try {
        await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
        // small delay to ensure web fonts settled
        await page.evaluate(() => document.fonts && document.fonts.ready);

        const outAbs = path.join(__dirname, g.img);
        await page.screenshot({ path: outAbs, type: 'png', clip: { x: 0, y: 0, width: 872, height: 1536 } });
        ok++;
        if (samples.length < 3) samples.push(g.img);
        console.log(`[ok  ${i+1}/${GAMES.length}] ${g.img}  (${titleEn} / ${charImg})`);
      } catch (e) {
        fail++;
        console.log(`[ERR ${i+1}/${GAMES.length}] ${g.img}: ${e.message}`);
      }
    }
  } finally {
    await browser.close();
  }

  console.log(`\n=== DONE  ok=${ok} fail=${fail}  total=${GAMES.length} ===`);
  console.log('Samples:', samples.join(', '));
}

main().catch(e => { console.error(e); process.exit(1); });
