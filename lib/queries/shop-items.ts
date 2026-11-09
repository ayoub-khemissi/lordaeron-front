import type { ShopItem, ShopCategory } from "@/types";

import { RowDataPacket, ResultSetHeader } from "mysql2";

import { websiteDb } from "@/lib/db";

export async function getShopItems(filters?: {
  category?: ShopCategory;
  activeOnly?: boolean;
  highlightedOnly?: boolean;
  hasDiscount?: boolean;
}): Promise<ShopItem[]> {
  let query = "SELECT * FROM shop_items WHERE 1=1";
  const params: (string | number)[] = [];

  if (filters?.activeOnly !== false) {
    query += " AND is_active = 1";
  }
  if (filters?.category) {
    query += " AND category = ?";
    params.push(filters.category);
  }
  if (filters?.highlightedOnly) {
    query += " AND is_highlighted = 1";
  }
  if (filters?.hasDiscount) {
    query += " AND discount_percentage > 0";
  }

  query += " ORDER BY sort_order ASC, created_at DESC";

  const [rows] = await websiteDb.execute<RowDataPacket[]>(query, params);

  return (rows as ShopItem[]).map(parseShopItemRow);
}

export async function getShopItemById(id: number): Promise<ShopItem | null> {
  const [rows] = await websiteDb.execute<RowDataPacket[]>(
    "SELECT * FROM shop_items WHERE id = ?",
    [id],
  );

  if (rows.length === 0) return null;

  return parseShopItemRow(rows[0] as ShopItem);
}

export async function createShopItem(
  item: Omit<ShopItem, "id" | "created_at" | "updated_at">,
): Promise<number> {
  const [result] = await websiteDb.execute<ResultSetHeader>(
    `INSERT INTO shop_items (
      category, service_type, item_id,
      name_en, name_fr, name_es, name_de, name_it, name_ru, name_pl, name_pt,
      description_en, description_fr, description_es, description_de, description_it,
      description_ru, description_pl, description_pt,
      price, discount_percentage, realm_ids, race_ids, class_ids, faction,
      icon_url, quality, is_highlighted, is_active, is_refundable, min_level, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      item.category,
      item.service_type,
      item.item_id,
      item.name_en,
      item.name_fr,
      item.name_es,
      item.name_de,
      item.name_it,
      item.name_ru ?? "",
      item.name_pl ?? "",
      item.name_pt ?? "",
      item.description_en,
      item.description_fr,
      item.description_es,
      item.description_de,
      item.description_it,
      item.description_ru ?? null,
      item.description_pl ?? null,
      item.description_pt ?? null,
      item.price,
      item.discount_percentage,
      item.realm_ids ? JSON.stringify(item.realm_ids) : null,
      item.race_ids ? JSON.stringify(item.race_ids) : null,
      item.class_ids ? JSON.stringify(item.class_ids) : null,
      item.faction,
      item.icon_url,
      item.quality ?? null,
      item.is_highlighted ? 1 : 0,
      item.is_active ? 1 : 0,
      item.is_refundable ? 1 : 0,
      item.min_level,
      item.sort_order,
    ],
  );

  return result.insertId;
}

export async function updateShopItem(
  id: number,
  item: Partial<Omit<ShopItem, "id" | "created_at" | "updated_at">>,
): Promise<boolean> {
  const fields: string[] = [];
  const params: (string | number | null)[] = [];

  const fieldMap: Record<string, unknown> = {
    category: item.category,
    service_type: item.service_type,
    item_id: item.item_id,
    name_en: item.name_en,
    name_fr: item.name_fr,
    name_es: item.name_es,
    name_de: item.name_de,
    name_it: item.name_it,
    name_ru: item.name_ru,
    name_pl: item.name_pl,
    name_pt: item.name_pt,
    description_en: item.description_en,
    description_fr: item.description_fr,
    description_es: item.description_es,
    description_de: item.description_de,
    description_it: item.description_it,
    description_ru: item.description_ru,
    description_pl: item.description_pl,
    description_pt: item.description_pt,
    price: item.price,
    discount_percentage: item.discount_percentage,
    faction: item.faction,
    icon_url: item.icon_url,
    quality: item.quality,
    min_level: item.min_level,
    sort_order: item.sort_order,
  };

  for (const [key, value] of Object.entries(fieldMap)) {
    if (value !== undefined) {
      fields.push(`${key} = ?`);
      params.push(value as string | number | null);
    }
  }

  if (item.realm_ids !== undefined) {
    fields.push("realm_ids = ?");
    params.push(item.realm_ids ? JSON.stringify(item.realm_ids) : null);
  }
  if (item.race_ids !== undefined) {
    fields.push("race_ids = ?");
    params.push(item.race_ids ? JSON.stringify(item.race_ids) : null);
  }
  if (item.class_ids !== undefined) {
    fields.push("class_ids = ?");
    params.push(item.class_ids ? JSON.stringify(item.class_ids) : null);
  }
  if (item.is_highlighted !== undefined) {
    fields.push("is_highlighted = ?");
    params.push(item.is_highlighted ? 1 : 0);
  }
  if (item.is_active !== undefined) {
    fields.push("is_active = ?");
    params.push(item.is_active ? 1 : 0);
  }
  if (item.is_refundable !== undefined) {
    fields.push("is_refundable = ?");
    params.push(item.is_refundable ? 1 : 0);
  }

  if (fields.length === 0) return false;

  params.push(id);
  const [result] = await websiteDb.execute<ResultSetHeader>(
    `UPDATE shop_items SET ${fields.join(", ")} WHERE id = ?`,
    params,
  );

  return result.affectedRows > 0;
}

export async function deactivateShopItem(id: number): Promise<boolean> {
  const [result] = await websiteDb.execute<ResultSetHeader>(
    "UPDATE shop_items SET is_active = 0 WHERE id = ?",
    [id],
  );

  return result.affectedRows > 0;
}

function parseShopItemRow(row: ShopItem): ShopItem {
  return {
    ...row,
    realm_ids:
      typeof row.realm_ids === "string"
        ? JSON.parse(row.realm_ids)
        : row.realm_ids,
    race_ids:
      typeof row.race_ids === "string"
        ? JSON.parse(row.race_ids)
        : row.race_ids,
    class_ids:
      typeof row.class_ids === "string"
        ? JSON.parse(row.class_ids)
        : row.class_ids,
    is_highlighted: Boolean(row.is_highlighted),
    is_active: Boolean(row.is_active),
    is_refundable: Boolean(row.is_refundable),
    min_level: row.min_level ?? 0,
  };
}
