import type { ShopPurchase } from "@/types";
import type { RowDataPacket } from "mysql2";

import {
  refundUndelivered,
  updatePurchaseStatus,
} from "@/lib/queries/shop-purchases";
import { getShopSetItems } from "@/lib/queries/shop-sets";
import { setAtLoginFlag, AT_LOGIN_FLAGS } from "@/lib/queries/characters";
import { DEFAULT_REALM, realmSlugById, type RealmSlug } from "@/lib/realms";
import { realmCharactersDb, realmServer } from "@/lib/realms-server";
import { authDb } from "@/lib/db";
import { purchaseChallengeBlock } from "@/lib/challenge-shop";

// each realm's worldserver has its own SOAP (lib/realms-server.ts); the GM account is the same, from the shared auth database
const SOAP_USERNAME = process.env.SOAP_USERNAME || "";
const SOAP_PASSWORD = process.env.SOAP_PASSWORD || "";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// a mail's subject and text: letters of every alphabet, digits and plain punctuation, Spanish's ¡ ¿ too (no quote, no XML markup)
function sanitizeInput(str: string): string {
  return str.replace(/[^\p{L}\p{N}\s.,!?¡¿'-]/gu, "");
}

// a character's name: letters only, TrinityCore's rule, accents and other alphabets included (13/10/2026: "Redös" became "Reds",
// "Player not found", and two April purchases stayed undelivered)
function sanitizeName(str: string): string {
  return str.replace(/[^\p{L}]/gu, "");
}

function buildEnvelope(command: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:ns1="urn:TC"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/"
  SOAP-ENV:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
  <SOAP-ENV:Body>
    <ns1:executeCommand>
      <command>${escapeXml(command)}</command>
    </ns1:executeCommand>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`;
}

export async function executeCommand(
  command: string,
  realm: RealmSlug = DEFAULT_REALM,
): Promise<{ success: boolean; message: string }> {
  const { soapHost, soapPort } = realmServer(realm);
  const url = `http://${soapHost}:${soapPort}/`;
  const body = buildEnvelope(command);
  const auth = Buffer.from(`${SOAP_USERNAME}:${SOAP_PASSWORD}`).toString(
    "base64",
  );

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        Authorization: `Basic ${auth}`,
        SOAPAction: "urn:TC#executeCommand",
      },
      body,
      signal: AbortSignal.timeout(10000),
    });

    const text = await res.text();

    if (!res.ok) {
      return { success: false, message: `SOAP HTTP ${res.status}: ${text}` };
    }

    // Check for fault in response
    if (text.includes("faultstring")) {
      const match = text.match(/<faultstring>([\s\S]*?)<\/faultstring>/);

      return {
        success: false,
        message: match ? match[1] : "Unknown SOAP fault",
      };
    }

    return { success: true, message: text };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "SOAP connection failed",
    };
  }
}

// The site's own mails in the recipient's client language (Ayoub, 25/10/2026: French, German, Spanish and Russian clients got them in
// English): the language his account last logged in with (auth.account.locale, written by the authserver); a text not listed here (a
// gift's message, written by the buyer) stays as it is.
const MAIL_TEXTS: Record<string, Record<"fr" | "de" | "es" | "ru", string>> = {
  "Lordaeron Shop": {
    fr: "Boutique Lordaeron",
    de: "Lordaeron-Shop",
    es: "Tienda de Lordaeron",
    ru: "Магазин Lordaeron",
  },
  "Gift from the Lordaeron Shop": {
    fr: "Cadeau de la boutique Lordaeron",
    de: "Geschenk aus dem Lordaeron-Shop",
    es: "Regalo de la tienda de Lordaeron",
    ru: "Подарок из магазина Lordaeron",
  },
  "Thank you for your purchase!": {
    fr: "Merci pour votre achat !",
    de: "Vielen Dank für Euren Einkauf!",
    es: "¡Gracias por tu compra!",
    ru: "Спасибо за покупку!",
  },
  "Thank you for your purchase! Refundable within 2h if kept.": {
    fr: "Merci pour votre achat ! Remboursable pendant 2 h s'il est conservé.",
    de: "Vielen Dank für Euren Einkauf! Innerhalb von 2 Std. erstattbar, wenn Ihr ihn behaltet.",
    es: "¡Gracias por tu compra! Reembolsable durante 2 h si lo conservas.",
    ru: "Спасибо за покупку! Можно вернуть в течение 2 ч, если предмет сохранен.",
  },
  "Enjoy this gift!": {
    fr: "Profitez bien de ce cadeau !",
    de: "Viel Freude mit diesem Geschenk!",
    es: "¡Disfruta de este regalo!",
    ru: "Наслаждайтесь подарком!",
  },
  "Account protected": {
    fr: "Compte protégé",
    de: "Account geschützt",
    es: "Cuenta protegida",
    ru: "Учетная запись защищена",
  },
  "Your account is protected by an authenticator. Every one of your characters receives a Core Hound Pup to keep it company!":
    {
      fr: "Votre compte est protégé par un authentificateur. Chacun de vos personnages reçoit un Chiot de chien du Magma pour lui tenir compagnie !",
      de: "Euer Account ist durch einen Authentifikator geschützt. Jeder Eurer Charaktere erhält einen Kernhundwelpen als Begleiter!",
      es: "Tu cuenta está protegida por un autenticador. ¡Cada uno de tus personajes recibe un Cachorro de can del Núcleo para hacerle compañía!",
      ru: "Ваша учетная запись защищена аутентификатором. Каждый ваш персонаж получает щенка гончей Недр в компаньоны!",
    },
};
// auth.account.locale (the client's LocaleConstant): frFR 2, deDE 3, esES 6, esMX 7, ruRU 8
const LOCALE_LANG: Record<number, "fr" | "de" | "es" | "ru"> = {
  2: "fr",
  3: "de",
  6: "es",
  7: "es",
  8: "ru",
};

async function recipientLang(characterName: string, realm: RealmSlug) {
  try {
    const [rows] = await realmCharactersDb(realm).execute<RowDataPacket[]>(
      "SELECT account FROM characters WHERE name = ?",
      [characterName],
    );

    if (!rows.length) return null;
    const [accounts] = await authDb.execute<RowDataPacket[]>(
      "SELECT locale FROM account WHERE id = ?",
      [rows[0].account],
    );

    return accounts.length ? (LOCALE_LANG[accounts[0].locale] ?? null) : null;
  } catch {
    return null;
  }
}

// "<realm> - Account protected": the realm's name kept, the rest translated
function translateMail(text: string, lang: "fr" | "de" | "es" | "ru" | null) {
  if (!lang) return text;
  if (MAIL_TEXTS[text]) return MAIL_TEXTS[text][lang];
  const dash = text.lastIndexOf(" - ");

  if (dash > 0 && MAIL_TEXTS[text.slice(dash + 3)])
    return `${text.slice(0, dash)} - ${MAIL_TEXTS[text.slice(dash + 3)][lang]}`;

  return text;
}

export async function sendItem(
  characterName: string,
  subject: string,
  body: string,
  itemId: number,
  count: number = 1,
  realm: RealmSlug = DEFAULT_REALM,
): Promise<{ success: boolean; message: string }> {
  const safeName = sanitizeName(characterName);
  const lang = await recipientLang(safeName, realm);
  const safeSubject = sanitizeInput(translateMail(subject, lang));
  const safeBody = sanitizeInput(translateMail(body, lang));

  const command = `.send items ${safeName} "${safeSubject}" "${safeBody}" ${itemId}:${count}`;

  const result = await executeCommand(command, realm);

  if (result.success) {
    await markMailAsNonReturnable(safeName, safeSubject, realm);
  }

  return result;
}

export async function sendItems(
  characterName: string,
  subject: string,
  body: string,
  items: { itemId: number; count: number }[],
  realm: RealmSlug = DEFAULT_REALM,
): Promise<{ success: boolean; message: string }> {
  const safeName = sanitizeName(characterName);
  const lang = await recipientLang(safeName, realm);
  const safeSubject = sanitizeInput(translateMail(subject, lang));
  const safeBody = sanitizeInput(translateMail(body, lang));

  const itemPairs = items.map((i) => `${i.itemId}:${i.count}`).join(" ");
  const command = `.send items ${safeName} "${safeSubject}" "${safeBody}" ${itemPairs}`;

  const result = await executeCommand(command, realm);

  if (result.success) {
    await markMailAsNonReturnable(safeName, safeSubject, realm);
  }

  return result;
}

async function markMailAsNonReturnable(
  characterName: string,
  subject: string,
  realm: RealmSlug,
): Promise<void> {
  try {
    await realmCharactersDb(realm).execute(
      `UPDATE mail SET messageType = 3
       WHERE receiver = (SELECT guid FROM characters WHERE name = ?)
       AND subject = ?
       ORDER BY id DESC LIMIT 1`,
      [characterName, subject],
    );
  } catch (error) {
    console.error("Failed to mark mail as non-returnable:", error);
  }
}

export async function retryPurchaseDelivery(
  purchase: ShopPurchase,
): Promise<{ success: boolean; message: string }> {
  const realm = realmSlugById(purchase.realm_id);
  const recipient =
    purchase.is_gift && purchase.gift_to_character_name
      ? purchase.gift_to_character_name
      : purchase.character_name;

  const subject = purchase.is_gift
    ? "Gift from the Lordaeron Shop"
    : "Lordaeron Shop";

  const body =
    purchase.is_gift && purchase.gift_message
      ? purchase.gift_message
      : "Thank you for your purchase!";

  // a challenge begun since the purchase that refuses it (lib/challenge-shop.ts): refunded rather than sent to a mailbox it cannot open
  const recipientGuid = (
    await realmCharactersDb(realm).execute<RowDataPacket[]>(
      "SELECT guid FROM characters WHERE name = ?",
      [recipient],
    )
  )[0][0]?.guid;
  const itemIds = purchase.set_id_ref
    ? (await getShopSetItems(purchase.set_id_ref)).map((i) => i.item_id)
    : purchase.wow_item_id && !purchase.service_type
      ? [purchase.wow_item_id]
      : [];

  if (
    recipientGuid &&
    (await purchaseChallengeBlock(
      realm,
      Number(recipientGuid),
      itemIds,
      purchase.service_type,
    ))
  ) {
    await refundUndelivered(purchase.id);

    return {
      success: false,
      message: "Refunded: the recipient's challenge refuses it",
    };
  }

  // Set purchase: send all set items
  if (purchase.set_id_ref) {
    const setItems = await getShopSetItems(purchase.set_id_ref);

    if (setItems.length === 0) {
      return { success: false, message: "No items found for set" };
    }

    const result = await sendItems(
      recipient,
      subject,
      body,
      setItems.map((i) => ({ itemId: i.item_id, count: 1 })),
      realm,
    );

    if (result.success) {
      await updatePurchaseStatus(purchase.id, "completed");
    }

    return result;
  }

  // Service purchase: apply at_login flag
  if (purchase.service_type) {
    const flag = AT_LOGIN_FLAGS[purchase.service_type];

    if (flag) {
      const applied = await setAtLoginFlag(
        purchase.character_guid,
        flag,
        realm,
      );

      if (applied) {
        await updatePurchaseStatus(purchase.id, "completed");

        return { success: true, message: "Service applied" };
      }

      return {
        success: false,
        message: "Character is online or not found",
      };
    }
  }

  // Single item purchase
  if (!purchase.wow_item_id) {
    return { success: false, message: "No wow_item_id on purchase" };
  }

  const result = await sendItem(
    recipient,
    subject,
    body,
    purchase.wow_item_id,
    1,
    realm,
  );

  if (result.success) {
    await updatePurchaseStatus(purchase.id, "completed");
  }

  return result;
}
