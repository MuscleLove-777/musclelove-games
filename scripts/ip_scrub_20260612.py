# -*- coding: utf-8 -*-
# 他社IP表記の一括置換（表示文言・メタのみ。識別子/セーブキーは触らない）
import io, os, sys

ROOT = r"C:\Users\atsus\000_ClaudeCode\40_MuscleLove\005_MuscleLove_Game"
DIRS = [
    "muscle-battle", "muscle-shiren", "muscle-cards", "muscle-merge", "muscle-flick",
    "muscle-idle", "muscle-tetris", "muscle-tetris-3d", "muscle-wordle", "muscle-survivor",
    "muscle-archery-3d", "muscle-bowling-3d", "muscle-darts-3d", "muscle-fps", "muscle-golf-3d",
    "muscle-mahjong-pro", "muscle-pinball-3d", "muscle-runner", "muscle-slasher",
]
EXTS = (".html", ".js", ".json", ".md")
SKIP_PARTS = ("node_modules", ".shots", ".git", ".vercel", "lib")

# 順序が重要：長いフレーズから先に
REPL = [
    # --- 文脈специфичные（長い順） ---
    ("Tinder風にスワイプ！推しコレクションを作ろう", "スワイプで好みを選別！推しコレクションを作ろう"),
    ("スイカゲーム風 落としもの物理マージ", "落として合体！物理マージパズル"),
    ("スイカゲーム風 物理マージ", "落として合体！物理マージ"),
    ("スイカゲーム風！", "落として合体！"),
    ("風来のシレン系筋肉ローグライク", "ターン制の筋肉ローグライク"),
    ("風来のシレン系筋肉ローグ", "ターン制筋肉ローグ"),
    ("放置少女系！", "本格放置RPG！"),
    ("Vampire Survivors風の筋肉美女オートバトル", "筋肉美女の見下ろしオートバトルサバイバル"),
    ("4列揃いのテトリスは大得点", "4列揃いの同時消しは大得点"),
    ("4-line Tetris combo", "4-line combo"),
    ("4ライン同時消し（テトリス）", "4ライン同時消し（クアッド）"),
    ("4-line clears (Tetris)", "4-line clears (QUAD)"),
    ("🏆 TETRIS! 🏆", "🏆 QUAD! 🏆"),
    ("リアル3Dブロックのテトリス！", "リアル3Dブロックの落ちものパズル！"),
    ("テトリスブラウザゲーム", "落ちものパズルブラウザゲーム"),
    ("ワードルブラウザゲーム", "単語当てブラウザゲーム"),
    ("ワードルの暇つぶし", "単語当ての暇つぶし"),
    ("Wordle風マッスルゲーム", "毎日1問のマッスル単語ゲーム"),
    ("Doodle Jump系", "縦スクロールジャンプ系"),
    ("Hearthstone-style", "Strategy-style"),
    ("Hearthstone 風", "戦略系"),
    ("Hearthstone風", "戦略系"),
    ("ハースストーン風", "戦略系"),
    ("にゃんこ大戦争風", "レーン進軍型"),
    ("風来のシレン系", "ターン制ローグライク"),
    ("スイカゲーム風", "落として合体系"),
    ("放置少女系", "本格放置系"),
    # --- タイトル名（長い順） ---
    ("筋肉3Dテトリス", "筋肉3Dブロック"),
    ("筋肉テトリス", "筋肉ブロックパズル"),
    ("筋肉シレン", "筋肉ダンジョン"),
    ("筋肉ワードル", "筋肉ワード当て"),
    ("MUSCLE SHIREN", "MUSCLE DUNGEON"),
    ("Muscle Tetris 3D", "Muscle Block 3D"),
    ("MUSCLE TETRIS", "MUSCLE BLOCK PUZZLE"),
    ("Muscle Tetris", "Muscle Block Puzzle"),
    ("TETRIS&nbsp;3D", "BLOCK&nbsp;3D"),
    ("TETRIS 3D", "BLOCK 3D"),
    ("#MuscleWordle", "#MuscleWordQuiz"),
    ("Muscle Wordle", "Muscle Word Quiz"),
    ("3D Tetris", "3D Block Puzzle"),
    ("3Dテトリス", "3D落ちものパズル"),
    ("立体テトリス", "立体落ちものパズル"),
]

changed = []
for d in DIRS:
    base = os.path.join(ROOT, d)
    for dirpath, dirnames, filenames in os.walk(base):
        if any(p in dirpath for p in SKIP_PARTS):
            continue
        for fn in filenames:
            if not fn.endswith(EXTS):
                continue
            p = os.path.join(dirpath, fn)
            with io.open(p, encoding="utf-8", newline="") as f:
                s = f.read()
            orig = s
            n = 0
            for old, new in REPL:
                if old in s:
                    n += s.count(old)
                    s = s.replace(old, new)
            if s != orig:
                with io.open(p, "w", encoding="utf-8", newline="") as f:
                    f.write(s)
                changed.append((os.path.relpath(p, ROOT), n))

for p, n in changed:
    print(f"{p}: {n}")
print(f"TOTAL files={len(changed)} repl={sum(n for _, n in changed)}")
