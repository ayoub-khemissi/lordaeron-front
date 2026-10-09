import type { ShopSet, ShopSetItem, ShopSetWithItems } from "@/types";

import { RowDataPacket, ResultSetHeader } from "mysql2";

import { websiteDb } from "@/lib/db";

function parseSetRow(row: ShopSet): ShopSet {
  return {
    ...row,
    class_ids:
      typeof row.class_ids === "string"
        ? JSON.parse(row.class_ids)
        : row.class_ids,
    realm_ids:
      typeof row.realm_ids === "string"
        ? JSON.parse(row.realm_ids)
        : row.realm_ids,
    is_highlighted: Boolean(row.is_highlighted),
    is_active: Boolean(row.is_active),
    min_level: row.min_level ?? 0,
  };
}

export async function getShopSets(filters?: {
  activeOnly?: boolean;
  highlightedOnly?: boolean;
  classId?: number;
  faction?: string;
  maxLevel?: number;
}): Promise<ShopSet[]> {
  let query = "SELECT * FROM shop_sets WHERE 1=1";
  const params: (string | number)[] = [];

  if (filters?.activeOnly !== false) {
    query += " AND is_active = 1";
  }
  if (filters?.highlightedOnly) {
    query += " AND is_highlighted = 1";
  }
  if (filters?.faction && filters.faction !== "both") {
    query += " AND (faction = ? OR faction = 'both')";
    params.push(filters.faction);
  }
  if (filters?.maxLevel !== undefined && filters.maxLevel > 0) {
    query += " AND (min_level = 0 OR min_level <= ?)";
    params.push(filters.maxLevel);
  }

  query += " ORDER BY sort_order ASC, created_at DESC";

  const [rows] = await websiteDb.execute<RowDataPacket[]>(query, params);

  let sets = (rows as ShopSet[]).map(parseSetRow);

  // Filter by class_id in JS (JSON column)
  if (filters?.classId) {
    sets = sets.filter(
      (s) => !s.class_ids || s.class_ids.includes(filters.classId!),
    );
  }

  return sets;
}

export async function getShopSetById(
  id: number,
): Promise<ShopSetWithItems | null> {
  const [setRows] = await websiteDb.execute<RowDataPacket[]>(
    "SELECT * FROM shop_sets WHERE id = ?",
    [id],
  );

  if (setRows.length === 0) return null;

  const set = parseSetRow(setRows[0] as ShopSet);

  const [itemRows] = await websiteDb.execute<RowDataPacket[]>(
    "SELECT * FROM shop_set_items WHERE set_id = ? ORDER BY sort_order ASC",
    [id],
  );

  return {
    ...set,
    items: itemRows as ShopSetItem[],
  };
}

export async function getShopSetItems(setId: number): Promise<ShopSetItem[]> {
  const [rows] = await websiteDb.execute<RowDataPacket[]>(
    "SELECT * FROM shop_set_items WHERE set_id = ? ORDER BY sort_order ASC",
    [setId],
  );

  return rows as ShopSetItem[];
}

export async function createShopSet(
  set: Omit<ShopSet, "id" | "created_at" | "updated_at">,
  items: Omit<ShopSetItem, "id" | "set_id">[],
): Promise<number> {
  const connection = await websiteDb.getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO shop_sets (
        name_en, name_fr, name_es, name_de, name_it,
        description_en, description_fr, description_es, description_de, description_it,
        price, discount_percentage, class_ids, realm_ids, faction,
        icon_url, is_highlighted, is_active, min_level, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        set.name_en,
        set.name_fr,
        set.name_es,
        set.name_de,
        set.name_it,
        set.description_en,
        set.description_fr,
        set.description_es,
        set.description_de,
        set.description_it,
        set.price,
        set.discount_percentage,
        set.class_ids ? JSON.stringify(set.class_ids) : null,
        set.realm_ids?.length ? JSON.stringify(set.realm_ids) : null,
        set.faction,
        set.icon_url,
        set.is_highlighted ? 1 : 0,
        set.is_active ? 1 : 0,
        set.min_level,
        set.sort_order,
      ],
    );

    const setId = result.insertId;

    for (const item of items) {
      await connection.execute(
        `INSERT INTO shop_set_items (
          set_id, item_id, name_en, name_fr, name_es, name_de, name_it,
          icon_url, quality, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          setId,
          item.item_id,
          item.name_en,
          item.name_fr,
          item.name_es,
          item.name_de,
          item.name_it,
          item.icon_url,
          item.quality ?? null,
          item.sort_order,
        ],
      );
    }

    await connection.commit();

    return setId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function updateShopSet(
  id: number,
  set: Partial<Omit<ShopSet, "id" | "created_at" | "updated_at">>,
  items?: Omit<ShopSetItem, "id" | "set_id">[],
): Promise<boolean> {
  const connection = await websiteDb.getConnection();

  try {
    await connection.beginTransaction();

    const fields: string[] = [];
    const params: (string | number | null)[] = [];

    const fieldMap: Record<string, unknown> = {
      name_en: set.name_en,
      name_fr: set.name_fr,
      name_es: set.name_es,
      name_de: set.name_de,
      name_it: set.name_it,
      description_en: set.description_en,
      description_fr: set.description_fr,
      description_es: set.description_es,
      description_de: set.description_de,
      description_it: set.description_it,
      price: set.price,
      discount_percentage: set.discount_percentage,
      faction: set.faction,
      icon_url: set.icon_url,
      min_level: set.min_level,
      sort_order: set.sort_order,
    };

    for (const [key, value] of Object.entries(fieldMap)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        params.push(value as string | number | null);
      }
    }

    if (set.class_ids !== undefined) {
      fields.push("class_ids = ?");
      params.push(set.class_ids ? JSON.stringify(set.class_ids) : null);
    }
    if (set.realm_ids !== undefined) {
      fields.push("realm_ids = ?");
      params.push(set.realm_ids?.length ? JSON.stringify(set.realm_ids) : null);
    }
    if (set.is_highlighted !== undefined) {
      fields.push("is_highlighted = ?");
      params.push(set.is_highlighted ? 1 : 0);
    }
    if (set.is_active !== undefined) {
      fields.push("is_active = ?");
      params.push(set.is_active ? 1 : 0);
    }

    if (fields.length > 0) {
      params.push(id);
      await connection.execute<ResultSetHeader>(
        `UPDATE shop_sets SET ${fields.join(", ")} WHERE id = ?`,
        params,
      );
    }

    // Replace items if provided
    if (items) {
      await connection.execute("DELETE FROM shop_set_items WHERE set_id = ?", [
        id,
      ]);

      for (const item of items) {
        await connection.execute(
          `INSERT INTO shop_set_items (
            set_id, item_id, name_en, name_fr, name_es, name_de, name_it,
            icon_url, quality, sort_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            item.item_id,
            item.name_en,
            item.name_fr,
            item.name_es,
            item.name_de,
            item.name_it,
            item.icon_url,
            item.quality ?? null,
            item.sort_order,
          ],
        );
      }
    }

    await connection.commit();

    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function deactivateShopSet(id: number): Promise<boolean> {
  const [result] = await websiteDb.execute<ResultSetHeader>(
    "UPDATE shop_sets SET is_active = 0 WHERE id = ?",
    [id],
  );

  return result.affectedRows > 0;
}
