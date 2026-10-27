"""Render the shared B. wordmark with Pillow, without generative image tools.

Usage: python3 assets/branding/build_icons.py --font '/path/to/Arial Bold.ttf'
The font file is read locally and is not copied or embedded in this repository.
"""
from pathlib import Path
import argparse
import hashlib
from PIL import Image, ImageDraw, ImageFont

parser = argparse.ArgumentParser()
parser.add_argument('--font', required=True, help='Local Arial Bold TrueType font')
args = parser.parse_args()
repo = Path(__file__).resolve().parents[2]
public = repo / 'public'
public.mkdir(exist_ok=True)
size, scale, font_size, radius = 256, 4, 176, 48
ink, paper = '#23232b', '#fffaf5'
font = ImageFont.truetype(args.font, font_size * scale)
canvas = Image.new('RGBA', (size * scale, size * scale), (0, 0, 0, 0))
draw = ImageDraw.Draw(canvas)
draw.rounded_rectangle((0, 0, size * scale - 1, size * scale - 1), radius=radius * scale, fill=ink)
left, top, right, bottom = draw.textbbox((0, 0), 'B.', font=font)
x = (size * scale - (right - left)) / 2 - left
y = (size * scale - (bottom - top)) / 2 - top
draw.text((x, y), 'B.', font=font, fill=paper)
ascent, _ = font.getmetrics()
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-label="B.">
  <rect width="256" height="256" rx="48" fill="{ink}"/>
  <text x="{x / scale:.4f}" y="{(y + ascent) / scale:.4f}" fill="{paper}" font-family="Arial, Helvetica, sans-serif" font-size="176" font-weight="700">B.</text>
</svg>
'''
(repo / 'assets/branding/b-mark.svg').write_text(svg)
(public / 'favicon.svg').write_text(svg)
for target in (16, 32):
    canvas.resize((target, target), Image.Resampling.LANCZOS).save(public / f'favicon-{target}.png', optimize=True)
master = canvas.resize((256, 256), Image.Resampling.LANCZOS)
master.save(public / 'favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
# Apple applies its own corner mask; keep its background fully opaque.
apple = Image.new('RGBA', canvas.size, ink)
apple.alpha_composite(canvas)
apple.convert('RGB').resize((180, 180), Image.Resampling.LANCZOS).save(public / 'apple-touch-icon.png', optimize=True)
for old in ('favicon-sakura-16.png', 'favicon-sakura-32.png'):
    (public / old).unlink(missing_ok=True)
paths = ['public/favicon.svg', 'public/favicon-16.png', 'public/favicon-32.png', 'public/favicon.ico', 'public/apple-touch-icon.png']
lines = [hashlib.sha256((repo / path).read_bytes()).hexdigest() + '  ' + path for path in paths]
(repo / 'assets/branding/sha256.txt').write_text('\n'.join(lines) + '\n')
print('\n'.join(lines))
