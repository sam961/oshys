#!/usr/bin/env bash
# Generates WebP variants for the three LCP-critical images using macOS `sips`.
# Run from the project root:  bash scripts/optimize-images.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "== About hero (1920x600, ~435 KB source) =="
sips -s format webp -s formatOptions 80 --resampleWidth 1920 \
  public/static/about/about-hero.jpg \
  --out public/static/about/about-hero.webp

sips -s format webp -s formatOptions 80 --resampleWidth 800 \
  public/static/about/about-hero.jpg \
  --out public/static/about/about-hero-mobile.webp

echo "== About team (1200x900, ~138 KB source) =="
sips -s format webp -s formatOptions 80 --resampleWidth 1600 \
  public/static/about/about-team.jpg \
  --out public/static/about/about-team.webp

sips -s format webp -s formatOptions 80 --resampleWidth 800 \
  public/static/about/about-team.jpg \
  --out public/static/about/about-team-mobile.webp

echo "== Logo (500x500, ~117 KB source) =="
# Backup original before shrinking
if [ ! -f public/images/logo-original.png ]; then
  cp public/images/logo.png public/images/logo-original.png
fi

# Replace logo.png with a 200x200 version — displayed at 80px, so 200px covers 2x DPR
sips --resampleWidth 200 public/images/logo-original.png \
  --out public/images/logo.png

echo ""
echo "== Result =="
ls -la public/static/about/*.webp public/static/about/*.jpg public/images/logo*.png
