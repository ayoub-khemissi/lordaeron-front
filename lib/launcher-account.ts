import type { RowDataPacket } from "mysql2";

import { classIcon, raceIcon } from "@/lib/character-identity";
import { REALM_SLUGS, type RealmSlug } from "@/lib/realms";
import { realmCharactersDb, realmServer } from "@/lib/realms-server";
import { getAvatar } from "@/lib/queries/avatar";
import { getSoulShardBalance } from "@/lib/queries/soul-shards";
import { dbcStore } from "@/lib/tooltips/dbc";
import { LOCALES, isTooltipLocale } from "@/lib/tooltips/locales";

const SITE = "https://lordaeron.eu";

export interface LauncherCharacter {
  name: string;
  level: number;
  race: number;
  cls: number;
  gender: number;
  zone: string | null;
  guild: string | null;
  online: boolean;
  lastPlayed: number | null; // unix seconds
  raceIcon: string | null;
  classIcon: string | null;
  armory: string;
}

export interface LauncherAccount {
  shards: number;
  avatar: string | null;
  realms: Record<RealmSlug, { count: number; last: LauncherCharacter | null }>;
}

async function zoneName(slug: RealmSlug, locale: string, id: number) {
  const slot = LOCALES[isTooltipLocale(locale) ? locale : "en"].slot;
  const dbcs = await dbcStore(realmServer(slug).dbcDir)
    .load(["AreaTable"])
    .catch(() => null);

  return (dbcs && dbcs("AreaTable").rec(id)?.loc("AreaName", slot)) || null;
}

async function lastCharacter(
  slug: RealmSlug,
  accountId: number,
  locale: string,
): Promise<{ count: number; last: LauncherCharacter | null }> {
  try {
    const db = realmCharactersDb(slug);
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT c.name, c.level, c.race, c.class, c.gender, c.zone, c.online, c.logout_time, g.name AS guild,
              (SELECT COUNT(*) FROM characters x WHERE x.account = c.account AND x.deleteInfos_Name IS NULL) AS total
         FROM characters c
         LEFT JOIN guild_member gm ON gm.guid = c.guid
         LEFT JOIN guild g ON g.guildid = gm.guildid
        WHERE c.account = ? AND c.deleteInfos_Name IS NULL
        ORDER BY c.online DESC, c.logout_time DESC
        LIMIT 1`,
      [accountId],
    );

    if (!rows.length) return { count: 0, last: null };
    const r = rows[0];
    const race = Number(r.race);
    const gender = Number(r.gender);
    const cls = Number(r.class);
    const icon = (path: string | null) => (path ? `${SITE}${path}` : null);

    return {
      count: Number(r.total),
      last: {
        name: String(r.name),
        level: Number(r.level),
        race,
        cls,
        gender,
        zone: await zoneName(slug, locale, Number(r.zone)),
        guild: r.guild ? String(r.guild) : null,
        online: Number(r.online) === 1,
        lastPlayed: Number(r.logout_time) || null,
        raceIcon: icon(raceIcon(race, gender)),
        classIcon: icon(classIcon(cls)),
        armory: `${SITE}/${locale}/${slug}/armory/${encodeURIComponent(String(r.name))}`,
      },
    };
  } catch {
    return { count: 0, last: null };
  }
}

// What the launcher shows of a signed-in account: its soul shards, its avatar and, on each realm, its character played last
export async function launcherAccount(
  accountId: number,
  locale: string,
): Promise<LauncherAccount> {
  const [shards, avatar, ...realms] = await Promise.all([
    getSoulShardBalance(accountId).catch(() => 0),
    getAvatar(accountId).catch(() => null),
    ...REALM_SLUGS.map((slug) => lastCharacter(slug, accountId, locale)),
  ]);

  return {
    shards,
    avatar: avatar
      ? `https://wow.zamimg.com/images/wow/icons/large/${avatar}.jpg`
      : null,
    realms: Object.fromEntries(
      REALM_SLUGS.map((slug, i) => [slug, realms[i]]),
    ) as LauncherAccount["realms"],
  };
}
