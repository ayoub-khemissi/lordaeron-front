#!/usr/bin/env python3
"""The realm's own creature looks for the site's 3D viewer (Ayoub, 18/10/2026: the custom mounts and companions in the shop's dressing
room, without Wowhead): every creature display of the realm's DBC that Blizzard's 3.3.5 does not have, written in the viewer's own data
format under /var/www/lordaeron-modelviewer (nginx serves it before its mirror of Wowhead's data, /etc/nginx/conf.d/lordaeron.conf).

- the model: the realm's custom models are edited copies of Blizzard's (a seat, a sound, a preview camera: the generator's
  content/exotic-mounts.js, named <Model>Lordaeron<id>), drawn the same: the viewer takes Blizzard's own model, its file found through
  a Blizzard display of it in the viewer's WotLK data;
- the skins (CreatureDisplayInfo TextureVariation, next to the model): ours, from patch-W's files then the client's archives, in WebP
  under our own file ids (data/modelviewer/custom-files.json: kept, so a skin keeps its id from one run to the next);
- a model of our own with no Blizzard original (the troll druid forms, the Sunwalker kodos: brought from a later client by the
  generator, lib/m2cata.js) is converted whole (convert_model): the WotLK model (MD20, version 264) wrapped in the chunks the viewer
  reads (MD21; SFID its .skin files, TXID its textures, AFID its external .anim files, all under our own file ids), its particle emitters
  given the 16 bytes a later emitter has (the viewer reads them: two multi-texture parameters, unused by WotLK's particles), its skins
  and animations as they are (the viewer reads WotLK's), its textures in WebP;
- meta/npc/<display>.json as the viewer reads Blizzard's: the model, the skins by their slot (11, 12, 13), the scale and alpha.

Re-runnable: the same files give the same output. A display whose model cannot be read is listed (it stays "no preview").
Usage: scripts/modelviewer-custom.py [--realm-dbc DIR] [--base-dbc DIR] [--stage DIR] [--out DIR]
"""
import argparse
import io
import json
import os
import struct
import subprocess
import sys
import tempfile
import urllib.request

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
REGISTRY = os.path.join(HERE, '..', 'data', 'modelviewer', 'custom-files.json')
CLIENT = '/home/ubuntu/lordaeron/client/Data'
ARCHIVES = ['patch-3', 'patch-2', 'patch', 'lichking', 'expansion', 'common-2', 'common']
MIRROR = 'https://lordaeron.eu/modelviewer/wrath/'
# our own file ids: far above Blizzard's (a few million), so they never meet theirs
FIRST_ID = 990_000_000


class Dbc:
    def __init__(self, path):
        data = open(path, 'rb').read()
        magic, self.count, self.fields, self.size, strings = struct.unpack('<4sIIII', data[:20])
        assert magic == b'WDBC', path
        self.records = data[20:20 + self.count * self.size]
        self.strings = data[20 + self.count * self.size:]
        self.index = {self.u(i, 0): i for i in range(self.count)}

    def u(self, row, field):
        return struct.unpack_from('<I', self.records, row * self.size + field * 4)[0]

    def f(self, row, field):
        return struct.unpack_from('<f', self.records, row * self.size + field * 4)[0]

    def s(self, row, field):
        off = self.u(row, field)
        return self.strings[off:self.strings.index(b'\0', off)].decode('utf-8', 'replace') if off else ''


# CreatureDisplayInfo: ID, ModelID, ..., CreatureModelScale 4, CreatureModelAlpha 5, TextureVariation 6-8; CreatureModelData: ModelName 2
CDI_MODEL, CDI_SCALE, CDI_ALPHA, CDI_TEXTURES = 1, 4, 5, (6, 7, 8)
CMD_NAME = 2


def client_file(path, stage):
    """A client file: patch-W's own (the generator's stage), else the archives, highest first; None when absent"""
    rel = path.replace('\\', '/')
    staged = os.path.join(stage, rel)
    if os.path.exists(staged):
        return open(staged, 'rb').read()
    low = rel.lower()
    for root, _, files in os.walk(os.path.join(stage, os.path.dirname(rel))) if os.path.isdir(os.path.join(stage, os.path.dirname(rel))) else []:
        for name in files:
            if os.path.join(os.path.relpath(root, stage), name).replace(os.sep, '/').lower() == low:
                return open(os.path.join(root, name), 'rb').read()
    with tempfile.TemporaryDirectory() as tmp:
        for archive in ARCHIVES:
            mpq = os.path.join(CLIENT, f'{archive}.MPQ')
            if not os.path.exists(mpq):
                continue
            subprocess.run(['smpq', '-e', '-f', '-q', mpq, rel], cwd=tmp, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            for root, _, files in os.walk(tmp):
                for name in files:
                    return open(os.path.join(root, name), 'rb').read()
    return None


# the WotLK M2 header (MD20, version 264): the arrays the conversion reads, at their offsets
M2_FLAGS, M2_SEQUENCES, M2_SKINS, M2_TEXTURES, M2_PARTICLES = 0x10, 0x1C, 0x44, 0x50, 0x128
SEQUENCE_SIZE, TEXTURE_SIZE = 64, 16
# a WotLK particle emitter (M2ParticleOld, 0x1DC bytes); the viewer reads 16 more (Cataclysm's multi-texture parameters)
PARTICLE_SIZE, PARTICLE_EXTRA = 0x1DC, 16
SEQUENCE_INTERNAL, SEQUENCE_ALIAS = 0x20, 0x40


def chunk(tag, data):
    return tag.encode() + struct.pack('<I', len(data)) + data


def webp(blp, out):
    Image.open(io.BytesIO(blp)).convert('RGBA').save(out + '.tmp', 'WEBP', quality=92, method=6)
    os.replace(out + '.tmp', out)


def convert_model(path, stage, out, file_id):
    """a WotLK model in the viewer's format (see above): its file id, or None when the model cannot be read"""
    m2_path = path.rsplit('.', 1)[0] + '.m2'
    data = client_file(m2_path, stage)
    if not data or data[:4] != b'MD20':
        return None
    model = bytearray(data)
    u32 = lambda o: struct.unpack_from('<I', model, o)[0]
    base = m2_path.rsplit('.', 1)[0]
    folder = path.rsplit('\\', 1)[0] if '\\' in path else ''

    # the textures named in the model (type 0); the creature skins (11, 12, 13...) come from the display
    txid = []
    count, offset = u32(M2_TEXTURES), u32(M2_TEXTURES + 4)
    for i in range(count):
        at = offset + i * TEXTURE_SIZE
        kind, name_len, name_at = u32(at), u32(at + 8), u32(at + 12)
        name = bytes(model[name_at:name_at + name_len]).split(b'\0')[0].decode('latin1') if kind == 0 and name_len else ''
        if not name:
            txid.append(0)
            continue
        fid = file_id(name.lower())
        target = os.path.join(out, 'textures', f'{fid}.webp')
        if not os.path.exists(target):
            blp = client_file(name, stage)
            if blp is None:
                txid.append(0)
                continue
            webp(blp, target)
        txid.append(fid)

    # the skins, as they are
    sfid = []
    for i in range(u32(M2_SKINS)):
        skin_path = f'{base}{i:02d}.skin'
        skin = client_file(skin_path, stage)
        if skin is None:
            break
        fid = file_id(skin_path.lower())
        with open(os.path.join(out, 'skin', f'{fid}.skin'), 'wb') as fh:
            fh.write(skin)
        sfid.append(fid)
    if not sfid:
        return None

    # the animations kept outside the model (a sequence neither internal nor an alias), as they are
    afid = b''
    count, offset = u32(M2_SEQUENCES), u32(M2_SEQUENCES + 4)
    for i in range(count):
        at = offset + i * SEQUENCE_SIZE
        anim, sub_anim = struct.unpack_from('<HH', model, at)
        flags = u32(at + 12)
        if flags & (SEQUENCE_INTERNAL | SEQUENCE_ALIAS):
            continue
        anim_path = f'{base}{anim:04d}-{sub_anim:02d}.anim'
        raw = client_file(anim_path, stage)
        if raw is None:
            continue
        fid = file_id(anim_path.lower())
        with open(os.path.join(out, 'anim', f'{fid}.anim'), 'wb') as fh:
            fh.write(raw)
        afid += struct.pack('<HHI', anim, sub_anim, fid)

    # the particle emitters again at the end, each with the 16 bytes the viewer reads after it
    count, offset = u32(M2_PARTICLES), u32(M2_PARTICLES + 4)
    if count:
        model += b'\0' * (-len(model) % 16)
        at = len(model)
        for i in range(count):
            model += model[offset + i * PARTICLE_SIZE:offset + (i + 1) * PARTICLE_SIZE] + b'\0' * PARTICLE_EXTRA
        struct.pack_into('<II', model, M2_PARTICLES, count, at)

    fid = file_id(m2_path.lower())
    blob = chunk('MD21', bytes(model)) + chunk('SFID', struct.pack(f'<{len(sfid)}I', *sfid)) \
        + chunk('TXID', struct.pack(f'<{len(txid)}I', *txid)) + (chunk('AFID', afid) if afid else b'')
    target = os.path.join(out, 'm2', f'{fid}.m2')
    with open(target + '.tmp', 'wb') as fh:
        fh.write(blob)
    os.replace(target + '.tmp', target)
    return fid


def fetch_json(url):
    try:
        with urllib.request.urlopen(url, timeout=20) as r:
            return json.load(r)
    except Exception:
        return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--realm-dbc', default='/home/ubuntu/server-rimeheart/data/dbc')
    ap.add_argument('--base-dbc', default='/home/ubuntu/server/data/dbc')
    ap.add_argument('--stage', default='/home/ubuntu/lordaeron/lordaeron-core-lab/contrib/wotlk-plus/out/stage')
    ap.add_argument('--out', default='/var/www/lordaeron-modelviewer/modelviewer/wrath')
    args = ap.parse_args()

    realm_cdi = Dbc(os.path.join(args.realm_dbc, 'CreatureDisplayInfo.dbc'))
    realm_cmd = Dbc(os.path.join(args.realm_dbc, 'CreatureModelData.dbc'))
    base_cdi = Dbc(os.path.join(args.base_dbc, 'CreatureDisplayInfo.dbc'))
    base_cmd = Dbc(os.path.join(args.base_dbc, 'CreatureModelData.dbc'))
    registry = json.load(open(REGISTRY)) if os.path.exists(REGISTRY) else {}

    def file_id(key):
        if key not in registry:
            registry[key] = max(registry.values(), default=FIRST_ID - 1) + 1
        return registry[key]

    # Blizzard's displays by model path (lowercased), to find the viewer's file of a model
    base_models = {}
    for row in range(base_cmd.count):
        base_models.setdefault(base_cmd.s(row, CMD_NAME).lower(), []).append(base_cmd.u(row, 0))
    displays_of = {}
    for row in range(base_cdi.count):
        displays_of.setdefault(base_cdi.u(row, CDI_MODEL), []).append(base_cdi.u(row, 0))
    viewer_model = {}

    def model_file(path):
        """the viewer's file id of a Blizzard model: the meta of a Blizzard display of it"""
        key = path.lower()
        if key in viewer_model:
            return viewer_model[key]
        found = None
        for cmd_id in base_models.get(key, []):
            for display in displays_of.get(cmd_id, [])[:6]:
                meta = fetch_json(f'{MIRROR}meta/npc/{display}.json')
                if meta and meta.get('Model'):
                    found = meta['Model']
                    break
            if found:
                break
        viewer_model[key] = found
        return found

    os.makedirs(os.path.join(args.out, 'meta', 'npc'), exist_ok=True)
    for folder_name in ('textures', 'm2', 'skin', 'anim'):
        os.makedirs(os.path.join(args.out, folder_name), exist_ok=True)
    converted = {}
    done, missing = 0, []
    for row in range(realm_cdi.count):
        display = realm_cdi.u(row, 0)
        if display in base_cdi.index:
            continue
        model_row = realm_cmd.index.get(realm_cdi.u(row, CDI_MODEL))
        if model_row is None:
            continue
        model = realm_cmd.s(model_row, CMD_NAME)
        folder, name = model.rsplit('\\', 1) if '\\' in model else ('', model)
        stem = name.rsplit('.', 1)[0]
        # an edited copy draws as its original (content/exotic-mounts.js: <Model>Lordaeron<id>)
        original = stem.split('Lordaeron')[0] if 'Lordaeron' in stem else stem
        model_id = model_file(f'{folder}\\{original}.mdx') or model_file(f'{folder}\\{original}.m2')
        if not model_id:
            if model not in converted:
                converted[model] = convert_model(model, args.stage, args.out, file_id)
            model_id = converted[model]
        if not model_id:
            missing.append(f'{display} {model}')
            continue
        textures = {}
        for slot, field in zip(('11', '12', '13'), CDI_TEXTURES):
            skin = realm_cdi.s(row, field)
            if not skin:
                continue
            path = f'{folder}\\{skin}.blp'
            key = path.lower()
            out = os.path.join(args.out, 'textures', f'{file_id(key)}.webp')
            if not os.path.exists(out):
                blp = client_file(path, args.stage)
                if blp is None:
                    missing.append(f'{display} texture {path}')
                    continue
                webp(blp, out)
            textures[slot] = file_id(key)
        meta = {
            'Model': model_id,
            'Textures': textures,
            'Textures2': None,
            'TextureFiles': None,
            'ModelFiles': None,
            'Item': None,
            'Creature': {
                'CreatureGeosetData': None,
                'CreatureGeosetDataID': 0,
                'CreatureModelAlpha': realm_cdi.u(row, CDI_ALPHA) or 255,
                'Texture': 0,
                'CreatureCustomizations': None,
                'ParticleColor': None,
            },
            'Character': None,
            'ItemEffects': None,
            'Equipment': None,
            'ComponentTextures': None,
            'ComponentModels': None,
            'StateKits': None,
            'Decor': None,
            'Scale': round(realm_cdi.f(row, CDI_SCALE) or 1, 4),
        }
        target = os.path.join(args.out, 'meta', 'npc', f'{display}.json')
        with open(target + '.tmp', 'w') as fh:
            json.dump(meta, fh, indent=2)
        os.replace(target + '.tmp', target)
        done += 1

    os.makedirs(os.path.dirname(REGISTRY), exist_ok=True)
    with open(REGISTRY, 'w') as fh:
        json.dump(dict(sorted(registry.items(), key=lambda kv: kv[1])), fh, indent=1)
        fh.write('\n')
    print(f'{done} custom creature displays written to {args.out}')
    for line in missing:
        print(f'  missing: {line}')


if __name__ == '__main__':
    sys.exit(main())
