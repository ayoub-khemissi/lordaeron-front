import type { RowDataPacket } from "mysql2";
import type {
  ChallengeBoard,
  ChallengeInfo,
  ChallengeList,
  ChallengeRun,
  CharacterChallenge,
} from "@/types/challenges";

import { type RealmSlug, realmHasChallenges } from "@/lib/realms";
import {
  realmCharactersDb,
  realmServer,
  realmWorldDb,
} from "@/lib/realms-server";
import { gmColumn, hideGm } from "@/lib/queries/realm-search";
import { dbcStore } from "@/lib/tooltips/dbc";
import { LOCALES, isTooltipLocale } from "@/lib/tooltips/locales";

/*
 * The WotLK+ character challenges of a realm (Ayoub, 17/10/2026; the core's WotLKPlusChallenge): the challenges its Archivist of Trials
 * offers (world wotlk_plus_challenge, their names in trinity_string) and what became of each character's (characters
 * wotlkplus_challenge: 0 in progress, 1 completed, 2 failed, 3 abandoned, 4 fallen). Read only for a realm whose challenges are open
 * on the site (lib/realms.ts realmHasChallenges); a realm without the tables shows none. The game masters' characters only for a site
 * administrator, as in the other rankings.
 */

// the first rows of each list
const LIMIT = 100;
// a death that ended a challenge (causeType), 255 for none
const NOT_A_DEATH = 255;

// the trinity_string column of a site language (content_default: English, the languages without one read it)
const NAME_COLUMN: Record<string, string> = {
  fr: "content_loc2",
  de: "content_loc3",
  es: "content_loc6",
  ru: "content_loc8",
};

const missingTable = (e: unknown) =>
  (e as { code?: string } | null)?.code === "ER_NO_SUCH_TABLE";

// the challenges, by id, their names in `locale`
async function challengeInfos(
  slug: RealmSlug,
  locale: string,
): Promise<Record<number, ChallengeInfo>> {
  const column = NAME_COLUMN[locale];
  const name = column
    ? `COALESCE(NULLIF(s.${column}, ''), s.content_default)`
    : "s.content_default";
  const [rows] = await realmWorldDb(slug).query<RowDataPacket[]>(
    `SELECT ch.ID, ch.Stars, ch.Reward, ch.Lives, ch.Icon, ch.DoneIcon, ${name} AS name
     FROM wotlk_plus_challenge ch
     LEFT JOIN trinity_string s ON s.entry = ch.Name`,
  );

  return Object.fromEntries(
    rows.map((r) => [
      Number(r.ID),
      {
        id: Number(r.ID),
        name: String(r.name ?? ""),
        stars: Number(r.Stars),
        reward: Number(r.Reward),
        lives: Number(r.Lives),
        icon: String(r.Icon ?? ""),
        doneIcon: String(r.DoneIcon ?? ""),
      },
    ]),
  );
}

// the zones' names in `locale` (the realm's AreaTable.dbc), none when it cannot be read
async function zoneNames(
  slug: RealmSlug,
  locale: string,
): Promise<(id: number) => string | null> {
  const slot = LOCALES[isTooltipLocale(locale) ? locale : "en"].slot;
  const dbcs = await dbcStore(realmServer(slug).dbcDir)
    .load(["AreaTable"])
    .catch(() => null);

  return (id) =>
    (dbcs && dbcs("AreaTable").rec(id)?.loc("AreaName", slot)) || null;
}

// a challenge's row and its character; a deleted character keeps its name (its account: deleteInfos_Account)
const ACCOUNT = "COALESCE(c.deleteInfos_Account, c.account)";
const runColumns = (showGm: boolean) =>
  `w.id, w.guid, w.challenge, w.lives, w.deaths, w.started, w.ended, w.level AS endLevel, w.cause, w.causeType, w.zone,
   w.authentic, w.pvp, COALESCE(c.deleteInfos_Name, c.name) AS name, c.deleteDate IS NOT NULL AS deleted,
   c.race, c.class, c.gender, c.level, c.online${showGm ? `, ${gmColumn(ACCOUNT)}` : ""}`;

function run(r: RowDataPacket, fallen: boolean, showGm: boolean): ChallengeRun {
  return {
    id: Number(r.id),
    guid: Number(r.guid),
    name: String(r.name ?? ""),
    race: Number(r.race),
    class: Number(r.class),
    gender: Number(r.gender),
    level: Number(fallen ? r.endLevel : r.level),
    online: fallen || r.deleted ? 0 : Number(r.online),
    deleted: !!Number(r.deleted),
    challenge: Number(r.challenge),
    lives: Number(r.lives),
    deaths: Number(r.deaths),
    started: Number(r.started),
    ended: Number(r.ended),
    authentic: !!Number(r.authentic),
    pvp: !!Number(r.pvp),
    ...(fallen
      ? { cause: String(r.cause ?? ""), causeType: Number(r.causeType) }
      : {}),
    ...(showGm ? { gm: !!Number(r.gm) } : {}),
  };
}

const EMPTY_LIST: ChallengeList = { runs: [], total: 0 };

// the Hall of Fame's Challenges tab: the challenges in progress (highest level first), completed and fallen (newest first)
export async function getChallengeBoard(
  slug: RealmSlug,
  locale: string,
  showGm: boolean,
): Promise<ChallengeBoard> {
  const empty: ChallengeBoard = {
    challenges: {},
    inProgress: EMPTY_LIST,
    completed: EMPTY_LIST,
    fallen: EMPTY_LIST,
  };

  if (!realmHasChallenges(slug)) return empty;
  const db = realmCharactersDb(slug);
  const gm = hideGm(ACCOUNT, showGm);
  // the deaths that ended a challenge: a one-life fall (4), the last of its lives (2 with a death's cause)
  const FALLEN = `(w.state = 4 OR (w.state = 2 AND w.causeType <> ${NOT_A_DEATH}))`;
  const list = async (where: string, order: string) =>
    (
      await db.query<RowDataPacket[]>(
        `SELECT ${runColumns(showGm)}
         FROM wotlkplus_challenge w JOIN characters c ON c.guid = w.guid
         WHERE ${where} ${gm}
         ORDER BY ${order}
         LIMIT ${LIMIT}`,
      )
    )[0];

  try {
    const [challenges, zone, inProgress, completed, fallen, [counts]] =
      await Promise.all([
        challengeInfos(slug, locale),
        zoneNames(slug, locale),
        list(
          "w.state = 0 AND c.deleteDate IS NULL",
          "c.level DESC, w.started ASC, w.id ASC",
        ),
        list("w.state = 1", "w.ended DESC, w.id DESC"),
        list(FALLEN, "w.ended DESC, w.id DESC"),
        db.query<RowDataPacket[]>(
          `SELECT SUM(w.state = 0 AND c.deleteDate IS NULL) AS inProgress, SUM(w.state = 1) AS completed,
             SUM(${FALLEN}) AS fallen
           FROM wotlkplus_challenge w JOIN characters c ON c.guid = w.guid
           WHERE 1 = 1 ${gm}`,
        ),
      ]);
    const total = (key: string) => Number(counts[0]?.[key] ?? 0);

    return {
      challenges,
      inProgress: {
        runs: inProgress.map((r) => run(r, false, showGm)),
        total: total("inProgress"),
      },
      completed: {
        runs: completed.map((r) => run(r, false, showGm)),
        total: total("completed"),
      },
      fallen: {
        runs: fallen.map((r) => ({
          ...run(r, true, showGm),
          zone: zone(Number(r.zone)),
        })),
        total: total("fallen"),
      },
    };
  } catch (e) {
    // the realm has no challenges' tables (yet): nothing to show
    if (!missingTable(e)) console.error("Challenges board:", e);

    return empty;
  }
}

// the armory's badge: the challenge a character is in, else the one it completed (one of them at most); null for none
export async function getCharacterChallenge(
  slug: RealmSlug,
  guid: number,
  locale: string,
): Promise<CharacterChallenge | null> {
  if (!realmHasChallenges(slug)) return null;
  try {
    const [rows] = await realmCharactersDb(slug).execute<RowDataPacket[]>(
      `SELECT challenge, state, lives, authentic, pvp FROM wotlkplus_challenge
       WHERE guid = ? AND state IN (0, 1)
       ORDER BY state ASC, id DESC
       LIMIT 1`,
      [guid],
    );
    const row = rows[0];

    if (!row) return null;
    const challenge = (await challengeInfos(slug, locale))[
      Number(row.challenge)
    ];

    return challenge
      ? {
          challenge,
          completed: Number(row.state) === 1,
          authentic: !!Number(row.authentic),
          pvp: !!Number(row.pvp),
          lives: Number(row.lives),
        }
      : null;
  } catch (e) {
    if (!missingTable(e)) console.error("Character challenge:", e);

    return null;
  }
}
