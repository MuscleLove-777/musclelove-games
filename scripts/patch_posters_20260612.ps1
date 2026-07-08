# Poster text-band patcher (ASCII-only; JP via base64)
Add-Type -AssemblyName System.Drawing
$imgDir = "C:\Users\atsus\000_ClaudeCode\40_MuscleLove\005_MuscleLove_Game\musclelove-games\images"
$B64 = { param($s) [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($s)) }

function Patch-Poster {
  param($file, $badge, $jpB64, $en, $descJpB64, $descEn)
  $path = Join-Path $imgDir $file
  $src = [System.Drawing.Image]::FromFile($path)
  $bmp = New-Object System.Drawing.Bitmap($src.Width, $src.Height)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.DrawImage($src, 0, 0, $src.Width, $src.Height)
  $src.Dispose()
  $g.SmoothingMode = 'AntiAlias'
  $g.TextRenderingHint = 'AntiAliasGridFit'
  $W = $bmp.Width; $H = $bmp.Height
  $dark = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(10, 10, 15))
  $white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
  $pink = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 77, 160))
  $cyan = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(89, 194, 255))
  $gray = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(165, 165, 175))
  $gold = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(242, 201, 76))
  $cf = New-Object System.Drawing.StringFormat
  $cf.Alignment = 'Center'
  # badge (top-right)
  $g.FillRectangle($dark, [int]($W * 0.55), 0, [int]($W * 0.45), [int]($H * 0.058))
  $fBadge = New-Object System.Drawing.Font('Segoe UI', [float]($W * 0.024), [System.Drawing.FontStyle]::Bold)
  $rf = New-Object System.Drawing.StringFormat
  $rf.Alignment = 'Far'
  $g.DrawString($badge, $fBadge, $gold, [float]($W * 0.965), [float]($H * 0.016), $rf)
  # text band
  $g.FillRectangle($dark, 0, [int]($H * 0.585), $W, [int]($H * 0.292))
  $fJp = New-Object System.Drawing.Font('Yu Gothic UI', [float]($W * 0.072), [System.Drawing.FontStyle]::Bold)
  $fEn = New-Object System.Drawing.Font('Segoe UI', [float]($W * 0.040), [System.Drawing.FontStyle]::Bold)
  $fDj = New-Object System.Drawing.Font('Yu Gothic UI', [float]($W * 0.030), [System.Drawing.FontStyle]::Bold)
  $fDe = New-Object System.Drawing.Font('Segoe UI', [float]($W * 0.020), [System.Drawing.FontStyle]::Bold)
  $jp = & $B64 $jpB64
  $dj = & $B64 $descJpB64
  $g.DrawString($jp, $fJp, $pink, [float]($W / 2), [float]($H * 0.605), $cf)
  $g.DrawString($en, $fEn, $cyan, [float]($W / 2), [float]($H * 0.700), $cf)
  $g.DrawString($dj, $fDj, $white, [float]($W / 2), [float]($H * 0.775), $cf)
  $g.DrawString($descEn, $fDe, $gray, [float]($W / 2), [float]($H * 0.830), $cf)
  $g.Dispose()
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Host "patched: $file ($W x $H)"
}

Patch-Poster 'poster_tetris.png' 'BLOCK PUZZLE' '562L6IKJ44OW44Ot44OD44Kv44OR44K644Or' 'MUSCLE BLOCK PUZZLE' '6JC944Gh44Gm44GP44KL44OW44Ot44OD44Kv44KS5Lim44G544Gm44Op44Kk44Oz5raI5Y6777yB' 'STACK FALLING BLOCKS AND CLEAR LINES!'
Patch-Poster 'poster_tetris3d.png' '3D BLOCKS' '562L6IKJM0Tjg5bjg63jg4Pjgq8=' 'MUSCLE BLOCK 3D' '44ON44Kq44Oz5YWJ44KL44Oq44Ki44OrM0TokL3jgaHjgoLjga7jg5bjg63jg4Pjgq/vvIHpn7PjgoLps7TjgovmnKzmoLzmtL4=' 'REALISTIC 3D NEON BLOCKS WITH SOUND!'
Patch-Poster 'poster_shiren.png' 'ROGUELIKE DUNGEON' '562L6IKJ44OA44Oz44K444On44Oz' 'MUSCLE DUNGEON' '44Oe44OD44K544Or6L+35a6uQjMwRu+8geOCuOODo+ODs+OCr+ODleODvOODiei7jeWbo3Zz562L6IKJ576O5bCR5aWz5Ymj5aOr77yB' 'B30F DUNGEON CRAWL! TURN-BASED ROGUELIKE!'
Patch-Poster 'poster_wordle.png' 'WORD QUIZ' '562L6IKJ44Ov44O844OJ5b2T44Gm' 'MUSCLE WORD QUIZ' '562L44OI44Os6Iux5Y2Y6Kqe44KSNeaWh+Wtl+OBp+W9k+OBpuOCje+8geavjuaXpTHllY8=' 'GUESS THE 5-LETTER FITNESS WORD! DAILY!'
