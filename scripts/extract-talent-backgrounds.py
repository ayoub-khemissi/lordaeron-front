#!/usr/bin/env python3
"""
The talent calculator's tree backgrounds (app/[locale]/[realm]/talents): the 3.3.5 client's Interface\\TalentFrame textures, each tree drawn
from four BLP quarters (TopLeft 256x256, TopRight 64x256, BottomLeft 256x128, BottomRight 64x128), put together and cropped to the 300x331 the game shows,
public/img/talents/<background file, lower case>.jpg (TalentTab.dbc BackgroundFile). Needs smpq and Pillow (BLP reader).
Usage: scripts/extract-talent-backgrounds.py [client Data dir]   (default /home/ubuntu/lordaeron/client/Data)
"""
import os, re, subprocess, sys, tempfile
from PIL import Image

data = sys.argv[1] if len(sys.argv) > 1 else "/home/ubuntu/lordaeron/client/Data"
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "img", "talents")
os.makedirs(out, exist_ok=True)
QUARTERS = {"topleft": (0, 0), "topright": (256, 0), "bottomleft": (0, 256), "bottomright": (256, 256)}

# the archives holding the talent frame, the later ones overriding the earlier
mpqs = []
for root, _, files in os.walk(data):
    for f in sorted(files):
        if f.lower().endswith(".mpq") and f.lower() != "patch-w.mpq":
            mpqs.append(os.path.join(root, f))
found = {}
for mpq in mpqs:
    listing = subprocess.run(["smpq", "-l", mpq], capture_output=True, text=True).stdout
    for line in listing.splitlines():
        path = line.split()[-1] if line.split() else ""
        m = re.match(r"interface/talentframe/(.+)-(topleft|topright|bottomleft|bottomright)\.blp$", path, re.I)
        if m:
            found[(m.group(1).lower(), m.group(2).lower())] = (mpq, path)

trees = sorted({name for name, _ in found})
with tempfile.TemporaryDirectory() as tmp:
    for name in trees:
        canvas = Image.new("RGB", (320, 384), "black")
        for quarter, (x, y) in QUARTERS.items():
            if (name, quarter) not in found:
                continue
            mpq, path = found[(name, quarter)]
            subprocess.run(["smpq", "-x", mpq, path], cwd=tmp, capture_output=True)
            local = os.path.join(tmp, path.replace("\\", "/"))
            if not os.path.exists(local):
                # smpq keeps the archive's case: look the file up case insensitively
                for r, _, fs in os.walk(tmp):
                    for f in fs:
                        if f.lower() == os.path.basename(path).lower():
                            local = os.path.join(r, f)
            canvas.paste(Image.open(local).convert("RGB"), (x, y))
        # the part the game shows (TalentFrame's texture coordinates: the right quarters 44 wide, the bottom ones 75 high)
        canvas.crop((0, 0, 300, 331)).save(os.path.join(out, f"{name}.jpg"), quality=86)
print(f"{len(trees)} tree backgrounds -> {os.path.normpath(out)}")
