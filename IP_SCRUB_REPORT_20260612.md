# 他社IP表記 棚卸しレポート (2026-06-12)

ユーザー指示「公開文言に他社IP名を書かない」に基づく全ゲーム・ポータルの一括除去作業。
ルールの正本: メモリ `no-thirdparty-ip-in-public-copy.md`

## 実施済み（置換完了・デプロイ済み）

### 置換マップ（主要）
| 旧 | 新 |
|---|---|
| NIKKE風 | 後方視点 / バックビュー・カバーシューティング |
| CoD風 | （削除、本格3DミリタリーFPS） |
| 筋肉テトリス / Muscle Tetris | 筋肉ブロックパズル / Muscle Block Puzzle |
| 筋肉3Dテトリス / TETRIS 3D | 筋肉3Dブロック / BLOCK 3D |
| 筋肉シレン / MUSCLE SHIREN / 風来のシレン系 | 筋肉ダンジョン / MUSCLE DUNGEON / ターン制ローグライク |
| 筋肉ワードル / Muscle Wordle / Wordle風 | 筋肉ワード当て / Muscle Word Quiz / 毎日1問の単語当て |
| ハースストーン風 / Hearthstone-style | 戦略系 / Strategy-style |
| スイカゲーム風 / Suika-style | 落として合体（系）/ Drop & merge |
| にゃんこ大戦争風 | レーン進軍型 |
| 放置少女系 | 本格放置系 |
| Tinder風 | スワイプ式（スワイプで好みを選別） |
| Doodle Jump style/系 | 縦スクロールジャンプ系 |
| Vampire Survivors風 | 見下ろしオートバトル型 |
| 4ライン消し（テトリス）/ TETRIS! | クアッド / QUAD! |

### 対象と規模
- **ポータル** musclelove-games: games配列10エントリ修正（title 4件改名含む）、sitemap.xml image:title 4件、poster_rearguard.svg desc
- **個別ゲーム19サイト・51ファイル・113置換**: battle / shiren / cards / merge / flick / idle / tetris / tetris-3d / wordle / survivor ＋ クロスプロモ・フッターリンク経由の archery-3d / bowling-3d / darts-3d / fps / golf-3d / mahjong-pro / pinball-3d / runner / slasher（スクリプト: `scripts/ip_scrub_20260612.py`）
- **ポスターPNG 4枚再描画**（焼き込みテキスト帯を差し替え）: poster_tetris / poster_tetris3d / poster_shiren / poster_wordle（スクリプト: `scripts/patch_posters_20260612.ps1`）
- **前段で完了**: muscle-rear-guard の NIKKE 全除去（OG画像再生成込み）、muscle-warfare の CoD 全除去
- **温存（意図的）**: コード識別子 `sfxTetris`、ローカルストレージキー `muscleWordle`（セーブ互換のため）、utm_campaign等のURLパラメータ

### デプロイ
- Vercel CLI 18サイト + ポータル: 全て readyState READY（ログ: `ip_scrub_deploys_20260612.log`）
- muscle-flick: git push 経路（commit 3ded64c → GitHub連携で自動デプロイ）

### 本番検証（2026-06-12）
全サイトの表示文言・メタから対象IP語ゼロを確認。残存ヒットは **ドメイン名/URL文字列のみ**（下記）。

## 変更候補（未対応・要ユーザー判断）

1. **ドメイン/Vercelプロジェクト名**: `muscle-tetris` `muscle-tetris-3d` `muscle-wordle` `musclelove-shiren` `muscle-nyanko-cleansweep` — 変更には新プロジェクト+リダイレクト+被リンク/インデックス損失コストが伴う。Tetris Companyは執行に積極的な権利者なので、リスクを下げるなら tetris 2件のURL移行が最優先候補。
2. **「にゃんこ大清掃」タイトル**（にゃんこ大戦争の連想パロディ）— 説明文は除去済み。タイトル自体は「にゃんこ」(一般語)+「大清掃」でグレー。
3. **低リスク・経過観察**: 筋肉インベーダー/genre Invaders、筋肉ポン/Pong、genre Breakout、古龍・elder dragon（hunter、ゲーム内用語）、筋肉サイモン（Simon Says は伝承遊び）
4. **問題なしと判断**: 筋肉2048（原作MITオープンソース）、ローグライク/Roguelike（一般ジャンル名）、麻雀・ソリティア等の伝統ゲーム名

## 今後の運用
新規ゲーム納品前に `grep -riE "テトリス|tetris|シレン|wordle|ワードル|ハースストーン|hearthstone|スイカゲーム|suika|tinder|にゃんこ大戦争|放置少女|nikke|cod|doodle|vampire"` を公開ファイルにかけてから出す。
