// Builds data/armory/wotlk-classic-item-displays.json: a 3.3.5 item entry -> its ItemDisplayInfo id in WotLK Classic, the data the armory's
// 3D viewer reads (Wowhead's "wrath" content: wow.zamimg.com/modelviewer/wrath/). WotLK Classic renumbered part of the displays (the
// Ecclesiastical Cuirass: 48471 in 3.3.5, 45226 in Classic), so a 3.3.5 display id cannot be used as is. Source: WotLK Classic's last
// build, DB2 ItemModifiedAppearance (item -> appearance, the base modifier first) and ItemAppearance (appearance -> display), from
// wago.tools. Re-run only if Wowhead changes its wrath data: node scripts/build-armory-displays.mjs
import { writeFileSync } from "node:fs";

const BUILD = "3.4.5.63697";
const MAX_ITEM = 60000; // 3.3.5's items end at 56806; the realms' own items are mapped through their looks (lib/armory-model.ts)

async function table(name) {
  const res = await fetch(`https://wago.tools/db2/${name}/csv?build=${BUILD}`);

  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  const [head, ...lines] = (await res.text()).trim().split("\n");
  const cols = head.split(",");

  return lines.map((l) => Object.fromEntries(l.split(",").map((v, i) => [cols[i], v])));
}

const appearances = new Map((await table("ItemAppearance")).map((r) => [r.ID, Number(r.ItemDisplayInfoID)]));
const best = new Map(); // item -> [modifier, order, display]

for (const r of await table("ItemModifiedAppearance")) {
  const item = Number(r.ItemID);
  const display = appearances.get(r.ItemAppearanceID);

  if (!item || item > MAX_ITEM || !display) continue;
  const key = [Number(r.ItemAppearanceModifierID), Number(r.OrderIndex)];
  const old = best.get(item);

  if (!old || key[0] < old[0] || (key[0] === old[0] && key[1] < old[1])) best.set(item, [...key, display]);
}
const out = Object.fromEntries([...best.entries()].sort((a, b) => a[0] - b[0]).map(([item, v]) => [item, v[2]]));

writeFileSync(new URL("../data/armory/wotlk-classic-item-displays.json", import.meta.url), JSON.stringify(out));
console.log(`${best.size} items (build ${BUILD})`);
