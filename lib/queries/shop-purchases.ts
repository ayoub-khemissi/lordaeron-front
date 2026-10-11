import type {
  ShopPurchase,
  ShopPurchaseWithItem,
  PurchaseRequest,
  PurchaseStatus,
} from "@/types";

import { RowDataPacket, ResultSetHeader } from "mysql2";

import { websiteDb } from "@/lib/db";
import { calculateDiscountedPrice } from "@/lib/shop-utils";

export async function createPurchase(
  accountId: number,
  request: PurchaseRequest,
  originalPrice: number,
  discountPercentage: number,
  wowItemId: number | null,
  serviceType: string | null,
): Promise<{ success: boolean; purchaseId?: number; error?: string }> {
  const connection = await websiteDb.getConnection();

  try {
    await connection.beginTransaction();

    const pricePaid = calculateDiscountedPrice(
      originalPrice,
      discountPercentage,
    );

    // Lock the balance row
    const [balanceRows] = await connection.execute<RowDataPacket[]>(
      "SELECT balance FROM soul_shards WHERE account_id = ? FOR UPDATE",
      [accountId],
    );

    const currentBalance = balanceRows.length > 0 ? balanceRows[0].balance : 0;

    if (currentBalance < pricePaid) {
      await connection.rollback();

      return { success: false, error: "insufficientBalance" };
    }

    // Deduct balance
    if (balanceRows.length > 0) {
      await connection.execute(
        "UPDATE soul_shards SET balance = balance - ? WHERE account_id = ?",
        [pricePaid, accountId],
      );
    } else {
      await connection.rollback();

      return { success: false, error: "insufficientBalance" };
    }

    // Insert purchase
    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO shop_purchases (
        account_id, item_id_ref, set_id_ref, character_guid, character_name, realm_id,
        is_gift, gift_to_character_name, gift_message,
        price_paid, original_price, discount_applied,
        status, wow_item_id, service_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?)`,
      [
        accountId,
        request.item_id || null,
        request.set_id || null,
        request.character_guid,
        request.character_name,
        request.realm_id,
        request.is_gift ? 1 : 0,
        request.gift_to_character_name || null,
        request.gift_message || null,
        pricePaid,
        originalPrice,
        discountPercentage,
        wowItemId,
        serviceType,
      ],
    );

    await connection.commit();

    return { success: true, purchaseId: result.insertId };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function getPurchasesByAccount(
  accountId: number,
): Promise<ShopPurchaseWithItem[]> {
  const [rows] = await websiteDb.execute<RowDataPacket[]>(
    `SELECT p.*,
      COALESCE(i.name_en, s.name_en) as item_name_en,
      COALESCE(i.name_fr, s.name_fr) as item_name_fr,
      COALESCE(i.name_es, s.name_es) as item_name_es,
      COALESCE(i.name_de, s.name_de) as item_name_de,
      COALESCE(i.name_it, s.name_it) as item_name_it,
      i.category as item_category,
      COALESCE(i.icon_url, s.icon_url) as item_icon_url,
      i.quality as item_quality,
      CASE WHEN p.set_id_ref IS NOT NULL THEN 0 ELSE IFNULL(i.is_refundable, 0) END as is_refundable,
      (SELECT COUNT(*) FROM shop_set_items si WHERE si.set_id = p.set_id_ref) as set_item_count
    FROM shop_purchases p
    LEFT JOIN shop_items i ON p.item_id_ref = i.id
    LEFT JOIN shop_sets s ON p.set_id_ref = s.id
    WHERE p.account_id = ?
    ORDER BY p.created_at DESC`,
    [accountId],
  );

  return rows as ShopPurchaseWithItem[];
}

export async function getAllPurchases(filters?: {
  accountId?: number;
  realmId?: number;
  status?: string;
  characterName?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}): Promise<{ purchases: ShopPurchaseWithItem[]; total: number }> {
  let query = `SELECT p.*,
    COALESCE(i.name_en, s.name_en) as item_name_en,
    COALESCE(i.name_fr, s.name_fr) as item_name_fr,
    COALESCE(i.name_es, s.name_es) as item_name_es,
    COALESCE(i.name_de, s.name_de) as item_name_de,
    COALESCE(i.name_it, s.name_it) as item_name_it,
    i.category as item_category,
    COALESCE(i.icon_url, s.icon_url) as item_icon_url,
    i.quality as item_quality,
    CASE WHEN p.set_id_ref IS NOT NULL THEN 0 ELSE IFNULL(i.is_refundable, 0) END as is_refundable,
    (SELECT COUNT(*) FROM shop_set_items si WHERE si.set_id = p.set_id_ref) as set_item_count
  FROM shop_purchases p
  LEFT JOIN shop_items i ON p.item_id_ref = i.id
  LEFT JOIN shop_sets s ON p.set_id_ref = s.id
  WHERE 1=1`;
  let countQuery = "SELECT COUNT(*) as total FROM shop_purchases p WHERE 1=1";
  const params: (string | number)[] = [];
  const countParams: (string | number)[] = [];

  if (filters?.accountId) {
    query += " AND p.account_id = ?";
    countQuery += " AND p.account_id = ?";
    params.push(filters.accountId);
    countParams.push(filters.accountId);
  }
  if (filters?.realmId) {
    query += " AND p.realm_id = ?";
    countQuery += " AND p.realm_id = ?";
    params.push(filters.realmId);
    countParams.push(filters.realmId);
  }
  if (filters?.status) {
    query += " AND p.status = ?";
    countQuery += " AND p.status = ?";
    params.push(filters.status);
    countParams.push(filters.status);
  }
  if (filters?.characterName) {
    query += " AND p.character_name LIKE ?";
    countQuery += " AND p.character_name LIKE ?";
    params.push(`%${filters.characterName}%`);
    countParams.push(`%${filters.characterName}%`);
  }
  if (filters?.dateFrom) {
    query += " AND p.created_at >= ?";
    countQuery += " AND p.created_at >= ?";
    params.push(filters.dateFrom);
    countParams.push(filters.dateFrom);
  }
  if (filters?.dateTo) {
    query += " AND p.created_at <= ?";
    countQuery += " AND p.created_at <= ?";
    params.push(filters.dateTo);
    countParams.push(filters.dateTo);
  }

  query += " ORDER BY p.created_at DESC";
  query += ` LIMIT ${filters?.limit || 50} OFFSET ${filters?.offset || 0}`;

  const [rows] = await websiteDb.execute<RowDataPacket[]>(query, params);
  const [countRows] = await websiteDb.execute<RowDataPacket[]>(
    countQuery,
    countParams,
  );

  return {
    purchases: rows as ShopPurchaseWithItem[],
    total: countRows[0].total,
  };
}

export async function getPurchaseById(
  id: number,
): Promise<ShopPurchase | null> {
  const [rows] = await websiteDb.execute<RowDataPacket[]>(
    "SELECT * FROM shop_purchases WHERE id = ?",
    [id],
  );

  if (rows.length === 0) return null;

  return rows[0] as ShopPurchase;
}

export async function refundPurchase(
  purchaseId: number,
  adminId: number,
): Promise<{ success: boolean; error?: string }> {
  const connection = await websiteDb.getConnection();

  try {
    await connection.beginTransaction();

    const [purchaseRows] = await connection.execute<RowDataPacket[]>(
      "SELECT * FROM shop_purchases WHERE id = ? AND status = 'completed' FOR UPDATE",
      [purchaseId],
    );

    if (purchaseRows.length === 0) {
      await connection.rollback();

      return { success: false, error: "purchaseNotFound" };
    }

    const purchase = purchaseRows[0] as ShopPurchase;

    // Refund the soul shards
    await connection.execute(
      "UPDATE soul_shards SET balance = balance + ? WHERE account_id = ?",
      [purchase.price_paid, purchase.account_id],
    );

    // Update purchase status
    await connection.execute(
      "UPDATE shop_purchases SET status = 'refunded', refunded_at = NOW(), refunded_by = ? WHERE id = ?",
      [adminId, purchaseId],
    );

    await connection.commit();

    return { success: true };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function refundPurchaseSelf(
  purchaseId: number,
  accountId: number,
): Promise<{ success: boolean; error?: string }> {
  const connection = await websiteDb.getConnection();

  try {
    await connection.beginTransaction();

    const [purchaseRows] = await connection.execute<RowDataPacket[]>(
      "SELECT * FROM shop_purchases WHERE id = ? AND account_id = ? AND status = 'completed' FOR UPDATE",
      [purchaseId, accountId],
    );

    if (purchaseRows.length === 0) {
      await connection.rollback();

      return { success: false, error: "purchaseNotFound" };
    }

    const purchase = purchaseRows[0] as ShopPurchase;

    // Refund the soul shards
    await connection.execute(
      "UPDATE soul_shards SET balance = balance + ? WHERE account_id = ?",
      [purchase.price_paid, purchase.account_id],
    );

    // Update purchase status — refunded_by = NULL for self-refund
    await connection.execute(
      "UPDATE shop_purchases SET status = 'refunded', refunded_at = NOW(), refunded_by = NULL WHERE id = ?",
      [purchaseId],
    );

    await connection.commit();

    return { success: true };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function getPendingDeliveryPurchases(): Promise<ShopPurchase[]> {
  const [rows] = await websiteDb.execute<RowDataPacket[]>(
    "SELECT * FROM shop_purchases WHERE status = 'pending_delivery'",
  );

  return rows as ShopPurchase[];
}

export async function updatePurchaseStatus(
  purchaseId: number,
  status: PurchaseStatus,
): Promise<void> {
  await websiteDb.execute("UPDATE shop_purchases SET status = ? WHERE id = ?", [
    status,
    purchaseId,
  ]);
}
