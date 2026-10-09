import { NextResponse } from "next/server";

import { realmSlugById } from "@/lib/realms";
import { verifySession } from "@/lib/auth";
import { getPurchasesByAccount } from "@/lib/queries/shop-purchases";
import {
  getCharacterByExactName,
  getCharacterByGuid,
  findItemLocation,
} from "@/lib/queries/characters";

export const dynamic = "force-dynamic";

const TWO_HOURS = 2 * 60 * 60 * 1000;

export async function GET() {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const rawPurchases = await getPurchasesByAccount(session.id);

    // Compute refund_blocked_reason for each completed purchase
    const purchases = await Promise.all(
      rawPurchases.map(async (p) => {
        if (p.status !== "completed") {
          return { ...p, refund_blocked_reason: null };
        }

        if (!p.is_refundable) {
          return { ...p, refund_blocked_reason: "itemNotRefundable" };
        }

        // Services are not self-refundable
        if (p.service_type !== null || p.wow_item_id === null) {
          return { ...p, refund_blocked_reason: "itemNotRefundable" };
        }

        if (Date.now() - new Date(p.created_at).getTime() > TWO_HOURS) {
          return { ...p, refund_blocked_reason: "refundExpired" };
        }

        // Determine recipient
        let recipientGuid = p.character_guid;
        let recipientOnline = 0;

        if (p.is_gift && p.gift_to_character_name) {
          const recipient = await getCharacterByExactName(
            p.gift_to_character_name,
            realmSlugById(p.realm_id),
          );

          if (recipient) {
            recipientGuid = recipient.guid;
            recipientOnline = recipient.online;
          }
        } else {
          const char = await getCharacterByGuid(
            recipientGuid,
            realmSlugById(p.realm_id),
          );

          if (char) recipientOnline = char.online;
        }

        if (recipientOnline) {
          return { ...p, refund_blocked_reason: "characterOnline" };
        }

        const location = await findItemLocation(
          recipientGuid,
          p.wow_item_id,
          realmSlugById(p.realm_id),
        );

        if (!location) {
          return { ...p, refund_blocked_reason: "itemNotInInventory" };
        }

        return { ...p, refund_blocked_reason: null };
      }),
    );

    return NextResponse.json({ purchases });
  } catch (error) {
    console.error("Purchases fetch error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
