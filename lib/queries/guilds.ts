import type { RowDataPacket } from "mysql2";
import type {
  GuildAchievement,
  GuildMember,
  GuildSummary,
} from "@/types/guild";

import { ALLIANCE_RACES } from "@/lib/armory-constants";
import { guildLevel } from "@/lib/guild-level";
import {
  ci,
  containsPattern,
  gmColumn,
  hideGm,
  isGm,
  nameRank,
  nameRankParams,
} from "@/lib/queries/realm-search";
import { REALMS, type RealmSlug } from "@/lib/realms";
import { realmCharactersDb, realmServer } from "@/lib/realms-server";
import { dbcStore } from "@/lib/tooltips/dbc";
import { LOCALES, isTooltipLocale } from "@/lib/tooltips/locales";

/*
 * The guilds of a realm (Ayoub, 13/10/2026: a guilds page beside the armory, the same search): the guild table, its members as the
 * reader may see them (the game masters' characters only for a site administrator, lib/queries/realm-search.ts: a guild whose every
 * member is hidden is not listed), its tabard (the emblem fields), and on a progressive realm its WotLK+ renown level and achievements
 * (characters tables wotlkplus_guild, wotlkplus_guild_achievement).
 */

const ALLIANCE = ALLIANCE_RACES.join(",");

// the guild columns of a summary; `showGm` decides which members count and whether a game master leader is named
function summaryColumns(realm: RealmSlug, showGm: boolean) {
  const counted = (extra = "") =>
    `(SELECT COUNT(*) FROM guild_member m JOIN characters mc ON mc.guid = m.guid
      WHERE m.guildid = g.guildid ${extra} ${hideGm("mc.account", showGm)})`;

  return `g.guildid, g.name, g.createdate,
    g.EmblemStyle AS emblemStyle, g.EmblemColor AS emblemColor, g.BorderStyle AS borderStyle,
    g.BorderColor AS borderColor, g.BackgroundColor AS backgroundColor,
    ${counted()} AS members,
    ${counted(`AND mc.race IN (${ALLIANCE})`)} AS alliance,
    ${showGm ? "l.name" : `CASE WHEN ${isGm("l.account")} THEN NULL ELSE l.name END`} AS leaderName
    ${REALMS[realm].progressive ? ", COALESCE(w.renown, 0) AS renown" : ""}`;
}

function summaryJoins(realm: RealmSlug) {
  return `LEFT JOIN characters l ON l.guid = g.leaderguid
    ${REALMS[realm].progressive ? "LEFT JOIN wotlkplus_guild w ON w.guildid = g.guildid" : ""}`;
}

function toSummary(r: RowDataPacket, realm: RealmSlug): GuildSummary {
  const members = Number(r.members);
  const alliance = Number(r.alliance);

  return {
    guildid: Number(r.guildid),
    name: r.name,
    emblem: {
      style: r.emblemStyle,
      color: r.emblemColor,
      borderStyle: r.borderStyle,
      borderColor: r.borderColor,
      background: r.backgroundColor,
    },
    members,
    alliance,
    horde: members - alliance,
    leaderName: r.leaderName ?? null,
    createdate: Number(r.createdate),
    level: REALMS[realm].progressive ? guildLevel(Number(r.renown)) : null,
  };
}

// a search: the exact name first, then the names starting with the text, then the others containing it, each by members then name
export async function searchGuilds(
  text: string,
  page: number,
  pageSize: number,
  realm: RealmSlug,
  showGm: boolean,
): Promise<{ guilds: GuildSummary[]; total: number }> {
  const db = realmCharactersDb(realm);
  const visible = showGm ? "" : "HAVING members > 0";
  const [counted] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM (
       SELECT ${summaryColumns(realm, showGm)} FROM guild g ${summaryJoins(realm)}
       WHERE ${ci("g.name")} LIKE ? ${visible}) t`,
    [containsPattern(text)],
  );
  const total = Number(counted[0]?.total ?? 0);

  if (!total) return { guilds: [], total };
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT ${summaryColumns(realm, showGm)} FROM guild g ${summaryJoins(realm)}
     WHERE ${ci("g.name")} LIKE ? ${visible}
     ORDER BY ${nameRank("g.name")}, members DESC, g.name ASC
     LIMIT ? OFFSET ?`,
    [
      containsPattern(text),
      ...nameRankParams(text),
      pageSize,
      (page - 1) * pageSize,
    ],
  );

  return { guilds: rows.map((r) => toSummary(r, realm)), total };
}

// a guild by its name (any case or accent, the exact spelling first); null when unknown or wholly hidden from this reader
export async function getGuild(
  name: string,
  realm: RealmSlug,
  showGm: boolean,
): Promise<GuildSummary | null> {
  const [rows] = await realmCharactersDb(realm).query<RowDataPacket[]>(
    `SELECT ${summaryColumns(realm, showGm)} FROM guild g ${summaryJoins(realm)}
     WHERE ${ci("g.name")} = ?
     ORDER BY g.name = ? DESC
     LIMIT 1`,
    [name, name],
  );
  const guild = rows[0] ? toSummary(rows[0], realm) : null;

  return guild && (guild.members > 0 || showGm) ? guild : null;
}

// a page of a guild's members, by rank then level then name
export async function getGuildMembers(
  guildid: number,
  page: number,
  pageSize: number,
  realm: RealmSlug,
  showGm: boolean,
): Promise<{ members: GuildMember[]; total: number }> {
  const db = realmCharactersDb(realm);
  const [counted] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM guild_member gm JOIN characters c ON c.guid = gm.guid
     WHERE gm.guildid = ? ${hideGm("c.account", showGm)}`,
    [guildid],
  );
  const total = Number(counted[0]?.total ?? 0);

  if (!total) return { members: [], total };
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT c.guid, c.name, c.race, c.class, c.gender, c.level, c.online, gm.\`rank\` AS \`rank\`,
       gr.rname AS rankName, ${gmColumn("c.account")}
     FROM guild_member gm
     JOIN characters c ON c.guid = gm.guid
     LEFT JOIN guild_rank gr ON gr.guildid = gm.guildid AND gr.rid = gm.\`rank\`
     WHERE gm.guildid = ? ${hideGm("c.account", showGm)}
     ORDER BY gm.\`rank\` ASC, c.level DESC, c.name ASC
     LIMIT ? OFFSET ?`,
    [guildid, pageSize, (page - 1) * pageSize],
  );

  return {
    members: rows.map((r) => ({ ...r, gm: !!r.gm })) as GuildMember[],
    total,
  };
}

// a progressive realm guild's WotLK+ achievements, newest first, in the reader's language (the realm's Achievement.dbc)
export async function getGuildAchievements(
  guildid: number,
  realm: RealmSlug,
  locale: string,
): Promise<GuildAchievement[]> {
  if (!REALMS[realm].progressive) return [];
  const [rows] = await realmCharactersDb(realm).query<RowDataPacket[]>(
    "SELECT achievement, date FROM wotlkplus_guild_achievement WHERE guildid = ? ORDER BY date DESC",
    [guildid],
  );

  if (!rows.length) return [];
  const dbcs = await dbcStore(realmServer(realm).dbcDir).load([
    "Achievement",
    "SpellIcon",
  ]);
  const achievements = dbcs("Achievement");
  const icons = dbcs("SpellIcon");
  const slot = LOCALES[isTooltipLocale(locale) ? locale : "en"].slot;

  return rows.flatMap((r) => {
    const a = achievements.rec(Number(r.achievement));

    if (!a) return [];
    const icon = icons.rec(a.get("IconID"));
    const texture = icon?.str("Texture").split("\\").pop()?.toLowerCase();

    return [
      {
        id: a.id,
        title: a.loc("Title", slot),
        description: a.loc("Description", slot),
        icon: texture ? texture : null,
        points: a.get("Points"),
        date: Number(r.date),
      },
    ];
  });
}
