import type { PurchaseRequest, Character } from "@/types";

import { NextRequest, NextResponse } from "next/server";

import { verifySession } from "@/lib/auth";
import { getShopItemById } from "@/lib/queries/shop-items";
import { getShopSetById } from "@/lib/queries/shop-sets";
import {
  createPurchase,
  updatePurchaseStatus,
} from "@/lib/queries/shop-purchases";
import { getActiveBan } from "@/lib/queries/shop-bans";
import {
  getCharactersByAccount,
  getCharacterByExactName,
  setAtLoginFlag,
  AT_LOGIN_FLAGS,
} from "@/lib/queries/characters";
import { ALLIANCE_RACES } from "@/lib/shop-utils";
import { sendItem, sendItems } from "@/lib/soap";
import { offeredOnRealm, realmById } from "@/lib/realms";

function checkFaction(faction: string, characterRace: number): string | null {
  if (faction === "both") return null;
  const isAlliance = ALLIANCE_RACES.includes(characterRace);

  if (faction === "alliance" && !isAlliance) return "factionRestricted";
  if (faction === "horde" && isAlliance) return "factionRestricted";

  return null;
}

async function handleSetPurchase(
  session: { id: number },
  body: PurchaseRequest,
  character: Character,
) {
  const set = await getShopSetById(body.set_id!);

  if (!set || !set.is_active) {
    return NextResponse.json({ error: "setNotFound" }, { status: 404 });
  }

  // a set with no realm list is Lordaeron's (the realm itself was checked open by the caller)
  const realm = realmById(body.realm_id);

  if (!realm || !offeredOnRealm(set.realm_ids, realm.slug)) {
    return NextResponse.json({ error: "realmRestricted" }, { status: 400 });
  }

  // Check min level
  if (set.min_level > 0 && character.level < set.min_level) {
    return NextResponse.json({ error: "levelRestricted" }, { status: 400 });
  }

  // Check class restriction
  if (set.class_ids && !set.class_ids.includes(character.class)) {
    return NextResponse.json({ error: "classRestricted" }, { status: 400 });
  }

  // Check faction restriction
  const factionError = checkFaction(set.faction, character.race);

  if (factionError) {
    return NextResponse.json({ error: factionError }, { status: 400 });
  }

  // Determine recipient
  let recipientName = character.name;

  if (body.is_gift) {
    if (!body.gift_to_character_name) {
      return NextResponse.json(
        { error: "giftCharacterRequired" },
        { status: 400 },
      );
    }

    const recipient = await getCharacterByExactName(
      body.gift_to_character_name,
    );

    if (!recipient) {
      return NextResponse.json(
        { error: "giftRecipientNotFound" },
        { status: 400 },
      );
    }

    if (set.class_ids && !set.class_ids.includes(recipient.class)) {
      return NextResponse.json(
        { error: "giftRecipientClassRestricted" },
        { status: 400 },
      );
    }

    const giftFactionError = checkFaction(set.faction, recipient.race);

    if (giftFactionError) {
      return NextResponse.json(
        { error: "giftRecipientFactionRestricted" },
        { status: 400 },
      );
    }

    if (set.min_level > 0 && recipient.level < set.min_level) {
      return NextResponse.json(
        { error: "giftRecipientLevelRestricted" },
        { status: 400 },
      );
    }

    recipientName = recipient.name;
  }

  // Create purchase
  const result = await createPurchase(
    session.id,
    body,
    set.price,
    set.discount_percentage,
    null,
    null,
  );

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  // Send all set items via SOAP
  if (set.items.length > 0) {
    const subject = body.is_gift
      ? "Gift from the Lordaeron Shop"
      : "Lordaeron Shop";
    const mailBody =
      body.is_gift && body.gift_message
        ? body.gift_message
        : "Thank you for your purchase!";

    const soapResult = await sendItems(
      recipientName,
      subject,
      mailBody,
      set.items.map((i) => ({ itemId: i.item_id, count: 1 })),
    );

    if (!soapResult.success) {
      console.error("SOAP set delivery failed:", soapResult.message);
      await updatePurchaseStatus(result.purchaseId!, "pending_delivery");

      return NextResponse.json({
        success: true,
        purchaseId: result.purchaseId,
        warning: "deliveryPending",
      });
    }
  }

  return NextResponse.json({
    success: true,
    purchaseId: result.purchaseId,
  });
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // Check ban
    const ban = await getActiveBan(session.id);

    if (ban) {
      return NextResponse.json({ error: "accountBanned" }, { status: 403 });
    }

    const body: PurchaseRequest = await request.json();

    if (!body.character_guid || !body.character_name || !body.realm_id) {
      return NextResponse.json({ error: "missingFields" }, { status: 400 });
    }

    if (!body.item_id && !body.set_id) {
      return NextResponse.json({ error: "missingFields" }, { status: 400 });
    }

    // a realm that is not open yet shows its catalogue but sells nothing (lib/realms.ts)
    const realm = realmById(body.realm_id);

    if (!realm) {
      return NextResponse.json({ error: "realmRestricted" }, { status: 400 });
    }
    if (realm.status !== "open") {
      return NextResponse.json({ error: "realmNotOpen" }, { status: 403 });
    }

    // Verify character belongs to account
    const characters = await getCharactersByAccount(session.id);
    const character = characters.find((c) => c.guid === body.character_guid);

    if (!character) {
      return NextResponse.json({ error: "characterNotFound" }, { status: 400 });
    }

    // ── Set purchase branch ──
    if (body.set_id) {
      return handleSetPurchase(session, body, character);
    }

    // ── Single item purchase ──
    const item = await getShopItemById(body.item_id!);

    if (!item || !item.is_active) {
      return NextResponse.json({ error: "itemNotFound" }, { status: 404 });
    }

    // Heirloom max level check
    if (
      item.category === "heirlooms" &&
      !characters.some((c) => c.level >= 80)
    ) {
      return NextResponse.json(
        { error: "heirloomMaxLevelRequired" },
        { status: 400 },
      );
    }

    // Check realm restriction (an item with no realm list is Lordaeron's)
    if (!offeredOnRealm(item.realm_ids, realm.slug)) {
      return NextResponse.json({ error: "realmRestricted" }, { status: 400 });
    }

    // Check min level on buyer's character
    if (item.min_level > 0 && character.level < item.min_level) {
      return NextResponse.json({ error: "levelRestricted" }, { status: 400 });
    }

    // Services require the character to be offline
    if (item.category === "services" && character.online) {
      return NextResponse.json(
        { error: "characterMustBeOffline" },
        { status: 400 },
      );
    }

    // Gift flow
    if (body.is_gift) {
      // Gifts not available for services
      if (item.category === "services") {
        return NextResponse.json(
          { error: "giftNotAvailableForServices" },
          { status: 400 },
        );
      }

      if (!body.gift_to_character_name) {
        return NextResponse.json(
          { error: "giftCharacterRequired" },
          { status: 400 },
        );
      }

      // Verify recipient exists
      const recipient = await getCharacterByExactName(
        body.gift_to_character_name,
      );

      if (!recipient) {
        return NextResponse.json(
          { error: "giftRecipientNotFound" },
          { status: 400 },
        );
      }

      // Check restrictions on RECIPIENT
      if (item.race_ids && !item.race_ids.includes(recipient.race)) {
        return NextResponse.json(
          { error: "giftRecipientRaceRestricted" },
          { status: 400 },
        );
      }

      if (item.class_ids && !item.class_ids.includes(recipient.class)) {
        return NextResponse.json(
          { error: "giftRecipientClassRestricted" },
          { status: 400 },
        );
      }

      if (item.faction !== "both") {
        const isRecipientAlliance = ALLIANCE_RACES.includes(recipient.race);

        if (item.faction === "alliance" && !isRecipientAlliance) {
          return NextResponse.json(
            { error: "giftRecipientFactionRestricted" },
            { status: 400 },
          );
        }
        if (item.faction === "horde" && isRecipientAlliance) {
          return NextResponse.json(
            { error: "giftRecipientFactionRestricted" },
            { status: 400 },
          );
        }
      }

      // Check min level on recipient
      if (item.min_level > 0 && recipient.level < item.min_level) {
        return NextResponse.json(
          { error: "giftRecipientLevelRestricted" },
          { status: 400 },
        );
      }

      // Create purchase
      const result = await createPurchase(
        session.id,
        body,
        item.price,
        item.discount_percentage,
        item.item_id,
        item.service_type,
      );

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      // Send item via SOAP
      if (item.item_id) {
        const subject = "Gift from the Lordaeron Shop";
        const mailBody = body.gift_message || "Enjoy this gift!";
        const soapResult = await sendItem(
          recipient.name,
          subject,
          mailBody,
          item.item_id,
          1,
        );

        if (!soapResult.success) {
          console.error("SOAP delivery failed:", soapResult.message);
          await updatePurchaseStatus(result.purchaseId!, "pending_delivery");

          return NextResponse.json({
            success: true,
            purchaseId: result.purchaseId,
            warning: "deliveryPending",
          });
        }
      }

      return NextResponse.json({
        success: true,
        purchaseId: result.purchaseId,
      });
    }

    // Normal (non-gift) flow — restrictions on buyer's character
    if (item.race_ids && !item.race_ids.includes(character.race)) {
      return NextResponse.json({ error: "raceRestricted" }, { status: 400 });
    }

    if (item.class_ids && !item.class_ids.includes(character.class)) {
      return NextResponse.json({ error: "classRestricted" }, { status: 400 });
    }

    const factionError = checkFaction(item.faction, character.race);

    if (factionError) {
      return NextResponse.json({ error: factionError }, { status: 400 });
    }

    // Process purchase (transactional)
    const result = await createPurchase(
      session.id,
      body,
      item.price,
      item.discount_percentage,
      item.item_id,
      item.service_type,
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Apply at_login flag for character services
    if (item.category === "services" && item.service_type) {
      const flag = AT_LOGIN_FLAGS[item.service_type];

      if (flag) {
        const applied = await setAtLoginFlag(body.character_guid, flag);

        if (!applied) {
          console.error("Failed to apply at_login flag:", item.service_type);
          await updatePurchaseStatus(result.purchaseId!, "pending_delivery");

          return NextResponse.json({
            success: true,
            purchaseId: result.purchaseId,
            warning: "deliveryPending",
          });
        }
      }
    }

    // Send item via SOAP for non-gift item purchases
    if (item.item_id && item.category !== "services") {
      const mailBody = item.is_refundable
        ? "Thank you for your purchase! Refundable within 2h if kept."
        : "Thank you for your purchase!";
      const soapResult = await sendItem(
        character.name,
        "Lordaeron Shop",
        mailBody,
        item.item_id,
        1,
      );

      if (!soapResult.success) {
        console.error("SOAP delivery failed:", soapResult.message);
        await updatePurchaseStatus(result.purchaseId!, "pending_delivery");

        return NextResponse.json({
          success: true,
          purchaseId: result.purchaseId,
          warning: "deliveryPending",
        });
      }
    }

    return NextResponse.json({
      success: true,
      purchaseId: result.purchaseId,
    });
  } catch (error) {
    console.error("Purchase error:", error);

    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
