#!/usr/bin/env python3
"""
The guild crests' layers (Ayoub, 13/10/2026: the guild tabards' real patterns and colours), from the 3.3.5 client's own tabard textures
(common.MPQ, Textures/GuildEmblems): Background_<colour>, Border_<style>_<colour>, Emblem_<style>_<colour>, each in two halves (TU the
upper torso, TL the lower). The model mirrors these textures: their left half runs from the middle of the chest (x 0) to the side
(x 64), their right half from the side to the middle of the back, each drawn again flipped for the other side of the body; the emblem's
halves at the texture's edges are the front's and the back's (the same emblem, the back's a few pixels higher), not one emblem cut in
two. Each layer is put back together (TU over TL) and its front half (64x96, the middle of the chest on its left edge) written as a PNG
to public/img/guild-emblems/; components/guild-emblem.tsx stacks them (background, border, emblem), each beside its flipped copy.
Re-runnable.

Usage: python3 scripts/build-guild-emblems.py [client Data dir]   (default /home/ubuntu/lordaeron/client/Data)
PIL decodes these palette BLPs with an 8-bit alpha wrongly (all transparent): read_blp decodes them itself.
"""
import os, re, struct, subprocess, sys, tempfile
from PIL import Image

DATA = sys.argv[1] if len(sys.argv) > 1 else "/home/ubuntu/lordaeron/client/Data"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "img", "guild-emblems")
# the chest's front half in the put-together 128x96 layer, the middle of the chest on its left edge
FRONT = (0, 0, 64, 96)


def read_blp(path):
    b = open(path, "rb").read()
    assert b[:4] == b"BLP2", path
    comp, adepth = b[8], b[9]
    w, h = struct.unpack_from("<II", b, 12)
    off = struct.unpack_from("<16I", b, 20)[0]
    if comp != 1:
        return Image.open(path).convert("RGBA")
    pal = [(b[148 + i * 4 + 2], b[148 + i * 4 + 1], b[148 + i * 4]) for i in range(256)]
    n = w * h
    idx, ab = b[off:off + n], b[off + n:]
    px = []
    for i in range(n):
        if adepth == 8:
            a = ab[i]
        elif adepth == 4:
            a = ((ab[i >> 1] >> ((i & 1) * 4)) & 0xF) * 17
        elif adepth == 1:
            a = 255 if (ab[i >> 3] >> (i & 7)) & 1 else 0
        else:
            a = 255
        px.append(pal[idx[i]] + (a,))
    im = Image.new("RGBA", (w, h))
    im.putdata(px)
    return im


def main():
    mpq = os.path.join(DATA, "common.MPQ")
    names = [l.split()[-1] for l in subprocess.run(["smpq", "-l", mpq], capture_output=True, text=True).stdout.splitlines()]
    names = [n for n in names if n.lower().startswith("textures/guildemblems/") and n.lower().endswith(".blp")]
    os.makedirs(OUT, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        for i in range(0, len(names), 200):
            subprocess.run(["smpq", "-x", mpq, *[n.replace("/", "\\") for n in names[i:i + 200]]], cwd=tmp, capture_output=True)
        files = {}
        for root, _, fs in os.walk(tmp):
            for f in fs:
                files[f.lower()] = os.path.join(root, f)
        layers = sorted({re.sub(r"_t[ul]_u\.blp$", "", f) for f in files})
        written = 0
        for layer in layers:
            tu, tl = files.get(layer + "_tu_u.blp"), files.get(layer + "_tl_u.blp")
            if not tu or not tl:
                continue
            im = Image.new("RGBA", (128, 96))
            im.paste(read_blp(tu), (0, 0))
            im.paste(read_blp(tl), (0, 64))
            im = im.crop(FRONT)
            # the edge column bleeds the back's pixels: the next one in its place, so the mirrored halves meet without a line
            im.paste(im.crop((1, 0, 2, 96)), (0, 0))
            # a 128-colour palette with its alpha: the same look at a third of the weight
            im.quantize(colors=128, method=Image.Quantize.FASTOCTREE).save(os.path.join(OUT, layer + ".png"), optimize=True)
            written += 1
        print(f"{written} layers -> {os.path.normpath(OUT)}")


if __name__ == "__main__":
    main()
