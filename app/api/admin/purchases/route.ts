import { NextRequest, NextResponse } from "next/server";

import { verifyAdminSession } from "@/lib/admin-auth";
import { realmSlugById } from "@/lib/realms";
import { getAllPurchases } from "@/lib/queries/shop-purchases";
import { getShopSetItems } from "@/lib/queries/shop-sets";
import {
  getCharacterByExactName,
  getCharacterByGuid,
  findItemLocation,
} from "@/lib/queries/characters";

export const dynamic = "force-dynamic";

const TWO_HOURS = 2 * 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdminSession();

    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const result = await getAllPurchases({
      accountId: searchParams.get("account_id")
        ? parseInt(searchParams.get("account_id")!)
        : undefined,
      realmId: searchParams.get("realm_id")
        ? parseInt(searchParams.get("realm_id")!)
        : undefined,
      status: searchParams.get("status") || undefined,
      characterName: searchParams.get("character_name") || undefined,
      dateFrom: searchParams.get("date_from") || undefined,
      dateTo: searchParams.get("date_to") || undefined,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : 50,
      offset: searchParams.get("offset")
        ? parseInt(searchParams.get("offset")!)
        : 0,
    });

    // Compute refund_blocked_reason for each completed purchase
    const purchases = await Promise.all(
      result.purchases.map(async (p) => {
        if (p.status !== "completed") {
          return { ...p, refund_blocked_reason: null };
        }

        if (!p.is_refundable) {
          return { ...p, refund_blocked_reason: "itemNotRefundable" };
        }

        // Determine which item IDs to check (set items or single item)
        const isSet = !!p.set_id_ref;
        const isSingleItem = p.wow_item_id !== null && p.service_type === null;

        if (isSet || isSingleItem) {
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

          if (isSet) {
            // Check all set items
            const setItems = await getShopSetItems(p.set_id_ref!);

            for (const setItem of setItems) {
              const location = await findItemLocation(
                recipientGuid,
                setItem.item_id,
                realmSlugById(p.realm_id),
              );

              if (!location) {
                return { ...p, refund_blocked_reason: "itemNotInInventory" };
              }
            }
          } else {
            const location = await findItemLocation(
              recipientGuid,
              p.wow_item_id!,
              realmSlugById(p.realm_id),
            );

            if (!location) {
              return { ...p, refund_blocked_reason: "itemNotInInventory" };
            }
          }
        }

        return { ...p, refund_blocked_reason: null };
      }),
    );

    return NextResponse.json({ purchases, total: result.total });
  } catch (error) {
    console.error("Admin purchases fetch error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
