import type { ItemLocation } from "@/lib/queries/characters";

import { NextRequest, NextResponse } from "next/server";

import { verifyAdminSession } from "@/lib/admin-auth";
import { realmSlugById } from "@/lib/realms";
import { refundPurchase, getPurchaseById } from "@/lib/queries/shop-purchases";
import { getShopItemById } from "@/lib/queries/shop-items";
import { getShopSetItems } from "@/lib/queries/shop-sets";
import { createAuditLog } from "@/lib/queries/shop-stats";
import {
  getCharacterByExactName,
  getCharacterByGuid,
  findItemLocation,
  removeMailWithItem,
  removeInventoryItem,
} from "@/lib/queries/characters";

const TWO_HOURS = 2 * 60 * 60 * 1000;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await verifyAdminSession();

    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const purchaseId = parseInt(id);

    const purchase = await getPurchaseById(purchaseId);

    if (!purchase) {
      return NextResponse.json({ error: "purchaseNotFound" }, { status: 404 });
    }

    if (purchase.status !== "completed") {
      return NextResponse.json(
        { error: "purchaseNotRefundable" },
        { status: 400 },
      );
    }

    const itemLocations: ItemLocation[] = [];

    if (purchase.set_id_ref) {
      // Set purchase — check each item in the set
      const setItems = await getShopSetItems(purchase.set_id_ref);

      if (setItems.length === 0) {
        return NextResponse.json(
          { error: "purchaseNotRefundable" },
          { status: 400 },
        );
      }

      // Check 2h window
      if (Date.now() - new Date(purchase.created_at).getTime() > TWO_HOURS) {
        return NextResponse.json({ error: "refundExpired" }, { status: 400 });
      }

      // Determine the recipient character
      let recipientGuid: number;
      let recipientOnline: number;

      if (purchase.is_gift && purchase.gift_to_character_name) {
        const recipient = await getCharacterByExactName(
          purchase.gift_to_character_name,
          realmSlugById(purchase.realm_id),
        );

        if (!recipient) {
          return NextResponse.json(
            { error: "recipientNotFound" },
            { status: 400 },
          );
        }
        recipientGuid = recipient.guid;
        recipientOnline = recipient.online;
      } else {
        recipientGuid = purchase.character_guid;
        const char = await getCharacterByGuid(
          recipientGuid,
          realmSlugById(purchase.realm_id),
        );

        recipientOnline = char?.online ?? 0;
      }

      if (recipientOnline) {
        return NextResponse.json({ error: "characterOnline" }, { status: 400 });
      }

      // Check ALL set items are still in mail or inventory
      for (const setItem of setItems) {
        const loc = await findItemLocation(
          recipientGuid,
          setItem.item_id,
          realmSlugById(purchase.realm_id),
        );

        if (!loc) {
          return NextResponse.json(
            { error: "itemNotInInventory" },
            { status: 400 },
          );
        }
        itemLocations.push(loc);
      }
    } else {
      // Single item purchase
      const item = purchase.item_id_ref
        ? await getShopItemById(purchase.item_id_ref)
        : null;

      if (item && !item.is_refundable) {
        return NextResponse.json(
          { error: "itemNotRefundable" },
          { status: 400 },
        );
      }

      // Additional checks for non-service items (actual WoW items)
      if (purchase.wow_item_id !== null && purchase.service_type === null) {
        // Check 2h window
        if (Date.now() - new Date(purchase.created_at).getTime() > TWO_HOURS) {
          return NextResponse.json({ error: "refundExpired" }, { status: 400 });
        }

        // Determine the recipient character
        let recipientGuid: number;
        let recipientOnline: number;

        if (purchase.is_gift && purchase.gift_to_character_name) {
          const recipient = await getCharacterByExactName(
            purchase.gift_to_character_name,
            realmSlugById(purchase.realm_id),
          );

          if (!recipient) {
            return NextResponse.json(
              { error: "recipientNotFound" },
              { status: 400 },
            );
          }
          recipientGuid = recipient.guid;
          recipientOnline = recipient.online;
        } else {
          recipientGuid = purchase.character_guid;
          const char = await getCharacterByGuid(
            recipientGuid,
            realmSlugById(purchase.realm_id),
          );

          recipientOnline = char?.online ?? 0;
        }

        // Character must be offline — worldserver caches data in memory
        if (recipientOnline) {
          return NextResponse.json(
            { error: "characterOnline" },
            { status: 400 },
          );
        }

        // Check item is still in mail or inventory
        const loc = await findItemLocation(
          recipientGuid,
          purchase.wow_item_id,
          realmSlugById(purchase.realm_id),
        );

        if (!loc) {
          return NextResponse.json(
            { error: "itemNotInInventory" },
            { status: 400 },
          );
        }
        itemLocations.push(loc);
      }
    }

    // Refund soul shards + update status
    const result = await refundPurchase(purchaseId, session.id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Remove items from mail or inventory
    for (const loc of itemLocations) {
      try {
        if (loc.location === "mail") {
          await removeMailWithItem(
            loc.mailId,
            loc.itemGuid,
            realmSlugById(purchase.realm_id),
          );
        } else {
          await removeInventoryItem(
            loc.itemGuid,
            realmSlugById(purchase.realm_id),
          );
        }
      } catch (err) {
        console.error("Failed to remove item after refund:", err);
        // Refund already succeeded — item removal failure is non-blocking
      }
    }

    await createAuditLog(
      session.id,
      "refund_purchase",
      "shop_purchase",
      purchaseId,
      {
        account_id: purchase.account_id,
        price_refunded: purchase.price_paid,
        items_removed: itemLocations.length,
      },
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Refund error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
