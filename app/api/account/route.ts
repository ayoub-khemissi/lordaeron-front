import type { AccountCharacter, AccountRealm } from "@/types/account";

import { NextRequest, NextResponse } from "next/server";

import { verifySession } from "@/lib/auth";
import {
  findAccountById,
  getAccountBan,
  getIpBan,
} from "@/lib/queries/account";
import {
  getCharactersByAccount,
  getDeletedCharactersByAccount,
} from "@/lib/queries/characters";
import { getCharacterChallenge } from "@/lib/queries/challenges";
import { getOnlineCount, getRealmStatus } from "@/lib/queries/server";
import { getSoulShardBalance } from "@/lib/queries/soul-shards";
import {
  REALM_SLUGS,
  type RealmSlug,
  isRealmOpen,
  isReservationOpen,
  realmAt,
  realmHasChallenges,
} from "@/lib/realms";
import { RESTORE_CHARACTER_COST } from "@/lib/shop-utils";

export const dynamic = "force-dynamic";

const ban = (
  b: {
    bandate: number;
    unbandate: number;
    bannedby: string;
    banreason: string;
  } | null,
) =>
  b
    ? {
        bandate: b.bandate,
        unbandate: b.unbandate,
        bannedby: b.bannedby,
        banreason: b.banreason,
      }
    : null;

// a realm as the account sees it: its state, the account's characters there (their challenge on a realm that has them), its deleted
// ones; a realm whose databases fail shows as unavailable, the others still load
async function accountRealm(
  slug: RealmSlug,
  accountId: number,
  locale: string,
): Promise<AccountRealm> {
  const realm = realmAt(slug);
  const base = {
    slug,
    name: realm.name,
    accent: realm.accent,
    open: isRealmOpen(realm),
    reservation: isReservationOpen(realm),
    launchAt: realm.launchAt ?? null,
  };

  try {
    const [status, playersOnline, characters, deleted] = await Promise.all([
      getRealmStatus(slug),
      getOnlineCount(slug),
      getCharactersByAccount(accountId, slug),
      getDeletedCharactersByAccount(accountId, slug),
    ]);
    const withChallenges: AccountCharacter[] = realmHasChallenges(slug)
      ? await Promise.all(
          characters.map(async (c) => ({
            ...c,
            challenge: await getCharacterChallenge(slug, c.guid, locale),
          })),
        )
      : characters;

    return {
      ...base,
      name: status.name || realm.name,
      online: status.online,
      playersOnline,
      characters: withChallenges,
      deleted,
    };
  } catch (error) {
    console.error(`Account realm ${slug}:`, error);

    return {
      ...base,
      online: false,
      playersOnline: 0,
      characters: [],
      deleted: [],
      error: true,
    };
  }
}

/* The account page's data: the account, its Soul Shards, its bans, and every realm of Lordaeron with the account's characters there
   (Ayoub, 18/10/2026: the page spoke of Lordaeron alone while Rimeheart runs beside it). ?locale= the challenges' names; ?summary=1
   the account and its Soul Shards alone (the shop's balance, the contact form), no realm read. */
export async function GET(request: NextRequest) {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const locale = request.nextUrl.searchParams.get("locale") || "en";
    const summary = request.nextUrl.searchParams.get("summary") === "1";

    const [account, soulShards, accountBan, realms] = await Promise.all([
      findAccountById(session.id),
      getSoulShardBalance(session.id),
      getAccountBan(session.id),
      summary
        ? Promise.resolve([])
        : Promise.all(
            REALM_SLUGS.map((slug) => accountRealm(slug, session.id, locale)),
          ),
    ]);

    if (!account) {
      return NextResponse.json({ error: "accountNotFound" }, { status: 404 });
    }

    // Check IP ban using account's last_ip
    const ipBan = account.last_ip ? await getIpBan(account.last_ip) : null;

    return NextResponse.json({
      account: {
        id: account.id,
        username: account.username,
        email: account.email,
        joindate: account.joindate,
        expansion: account.expansion,
      },
      soulShards,
      realms,
      restoreCost: RESTORE_CHARACTER_COST,
      accountBan: ban(accountBan),
      ipBan: ban(ipBan),
    });
  } catch (error) {
    console.error("Account fetch error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
