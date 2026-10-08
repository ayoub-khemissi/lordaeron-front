#!/usr/bin/env python3
"""Web-sized copies of the /experience page backgrounds (python3 scripts/optimize-experience-images.py).

Every /img/... picture named in the page sources gets public/img/experience/bg/<slug>.webp (1920 px wide at most)
and <slug>-sm.webp (960 px) for phones (plus <slug>-xl.webp, 2880 px, from the giant ones: the hero); the page loads those (components/experience/primitives.tsx, bgSrc).
Re-runnable: the same sources give the same files.
"""
import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCES = [ROOT / "app/[locale]/experience/content.ts", ROOT / "app/[locale]/experience/experience-content.tsx"]
OUT = ROOT / "public/img/experience/bg"
SIZES = {"": 1920, "-sm": 960}


def slug(path: str) -> str:
    # same rule as bgSrc() in components/experience/primitives.tsx
    return re.sub(r"[^a-z0-9]+", "-", Path(path).stem.lower()).strip("-")


def main() -> None:
    paths = set()
    for src in SOURCES:
        paths.update(re.findall(r'"(/img/[^"]+\.(?:jpe?g|png|webp))"', src.read_text()))
    paths = sorted(p for p in paths if not p.startswith("/img/experience/icons/") and not p.startswith("/img/experience/bg/"))
    OUT.mkdir(parents=True, exist_ok=True)
    for p in paths:
        im = Image.open(ROOT / "public" / p.lstrip("/")).convert("RGB")
        sizes = dict(SIZES, **({"-xl": 2880} if im.width >= 5000 else {}))
        for suffix, width in sizes.items():
            w = min(width, im.width)
            out = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS) if w != im.width else im
            out.save(OUT / f"{slug(p)}{suffix}.webp", "WEBP", quality=72, method=6)
        print(slug(p))


if __name__ == "__main__":
    main()
