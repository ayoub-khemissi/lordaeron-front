import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface Account {
  id: number;
  username: string;
  email: string;
  salt: Uint8Array;
  verifier: Uint8Array;
  joindate: string;
  last_ip: string;
  expansion: number;
}

export interface Realm {
  id: number;
  name: string;
  flag: number;
  population: number;
}

export interface ServerStatus {
  online: boolean;
  realmName: string;
}

export interface ServerStats {
  onlineCount: number;
  totalAccounts: number;
  alliance: number;
  horde: number;
  totalAlliance: number;
  totalHorde: number;
}

export interface News {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  author_name: string;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface NewsRow {
  id: number;
  title_en: string;
  title_fr: string;
  title_es: string;
  title_de: string;
  title_it: string;
  content_en: string;
  content_fr: string;
  content_es: string;
  content_de: string;
  content_it: string;
  image_url: string | null;
  author_name: string;
  published_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Character {
  guid: number;
  name: string;
  race: number;
  class: number;
  level: number;
  gender: number;
  online: number;
  totaltime: number;
  zone: number;
}

export interface DeletedCharacter {
  guid: number;
  name: string;
  race: number;
  class: number;
  level: number;
  gender: number;
  deleteDate: number;
}

export interface AccountInfo {
  id: number;
  username: string;
  email: string;
  joindate: string;
  last_ip: string;
  expansion: number;
}

export interface AccountBan {
  id: number;
  bandate: number;
  unbandate: number;
  bannedby: string;
  banreason: string;
  active: number;
}

export interface IpBan {
  ip: string;
  bandate: number;
  unbandate: number;
  bannedby: string;
  banreason: string;
}

export interface SoulShardBalance {
  account_id: number;
  balance: number;
}

export interface JWTPayload {
  id: number;
  username: string;
}

// ── Shop Types ──

export type ShopCategory =
  | "services"
  | "bags"
  | "heirlooms"
  | "transmog"
  | "mounts"
  | "tabards"
  | "pets"
  | "toys";

export type ServiceType =
  | "xp_boost_6h"
  | "xp_boost_12h"
  | "xp_boost_24h"
  | "xp_boost_48h"
  | "rep_boost_6h"
  | "rep_boost_12h"
  | "rep_boost_24h"
  | "rep_boost_48h"
  | "name_change"
  | "appearance_change"
  | "race_change"
  | "faction_change"
  | "vip";

export type Faction = "alliance" | "horde" | "both";

export type PurchaseStatus =
  | "completed"
  | "refunded"
  | "pending_refund"
  | "pending_delivery"
  | "cancelled";

export interface ShopItem {
  id: number;
  category: ShopCategory;
  service_type: ServiceType | null;
  item_id: number | null;
  name_en: string;
  name_fr: string;
  name_es: string;
  name_de: string;
  name_it: string;
  description_en: string | null;
  description_fr: string | null;
  description_es: string | null;
  description_de: string | null;
  description_it: string | null;
  price: number;
  discount_percentage: number;
  realm_ids: number[] | null;
  race_ids: number[] | null;
  class_ids: number[] | null;
  faction: Faction;
  icon_url: string | null;
  quality: number | null;
  is_highlighted: boolean;
  is_active: boolean;
  is_refundable: boolean;
  min_level: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ShopItemLocalized {
  id: number;
  category: ShopCategory;
  service_type: ServiceType | null;
  item_id: number | null;
  name: string;
  description: string | null;
  price: number;
  discounted_price: number;
  discount_percentage: number;
  realm_ids: number[] | null;
  race_ids: number[] | null;
  class_ids: number[] | null;
  faction: Faction;
  icon_url: string | null;
  quality: number | null;
  is_highlighted: boolean;
  is_refundable: boolean;
  min_level: number;
  sort_order: number;
  eligible?: boolean;
  restriction_reason?: string | null;
  // the shop's filters (app/api/shop/items): a mount's ground or flying, a transmog piece's weapon or armor; sold on this realm alone
  kind?: ShopItemKind | null;
  exclusive?: boolean;
}

export type ShopItemKind = "ground" | "flying" | "weapon" | "armor";

export interface ShopPurchase {
  id: number;
  account_id: number;
  item_id_ref: number | null;
  set_id_ref: number | null;
  character_guid: number;
  character_name: string;
  realm_id: number;
  is_gift: boolean;
  gift_to_character_name: string | null;
  gift_message: string | null;
  price_paid: number;
  original_price: number;
  discount_applied: number;
  status: PurchaseStatus;
  wow_item_id: number | null;
  service_type: ServiceType | null;
  refunded_at: string | null;
  refunded_by: number | null;
  created_at: string;
}

export interface ShopPurchaseWithItem extends ShopPurchase {
  item_name_en: string;
  item_name_fr: string;
  item_name_es: string;
  item_name_de: string;
  item_name_it: string;
  item_category: ShopCategory | null;
  item_icon_url: string | null;
  item_quality: number | null;
  is_refundable: boolean;
  refund_blocked_reason?: string | null;
  set_item_count: number | null;
}

export interface ShopAdmin {
  id: number;
  username: string;
  password_hash: string;
  display_name: string;
  role: "admin" | "super_admin";
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShopAdminJWTPayload {
  id: number;
  username: string;
  role: "admin" | "super_admin";
}

export interface ShopBan {
  id: number;
  account_id: number;
  reason: string;
  banned_by: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ShopStats {
  totalRevenue: number;
  totalPurchases: number;
  averageOrderValue: number;
  activeItems: number;
  salesByCategory: { category: ShopCategory; count: number; revenue: number }[];
  topItems: { id: number; name: string; count: number; revenue: number }[];
  recentPurchases: ShopPurchaseWithItem[];
}

export interface PurchaseRequest {
  item_id?: number;
  set_id?: number;
  character_guid: number;
  character_name: string;
  realm_id: number;
  is_gift?: boolean;
  gift_to_character_name?: string;
  gift_message?: string;
}

// ── Shop Set Types ──

export interface ShopSet {
  id: number;
  name_en: string;
  name_fr: string;
  name_es: string;
  name_de: string;
  name_it: string;
  description_en: string | null;
  description_fr: string | null;
  description_es: string | null;
  description_de: string | null;
  description_it: string | null;
  price: number;
  discount_percentage: number;
  class_ids: number[] | null;
  faction: Faction;
  icon_url: string | null;
  is_highlighted: boolean;
  is_active: boolean;
  min_level: number;
  sort_order: number;
  // the realms that sell it (a future column of shop_sets): none, Lordaeron's alone (lib/realms.ts offeredOnRealm)
  realm_ids?: number[] | null;
  created_at: string;
  updated_at: string;
}

export interface ShopSetItem {
  id: number;
  set_id: number;
  item_id: number;
  name_en: string;
  name_fr: string;
  name_es: string;
  name_de: string;
  name_it: string;
  icon_url: string | null;
  quality: number | null;
  sort_order: number;
}

export interface ShopSetWithItems extends ShopSet {
  items: ShopSetItem[];
}

export interface ShopSetLocalized {
  id: number;
  name: string;
  description: string | null;
  price: number;
  discounted_price: number;
  discount_percentage: number;
  class_ids: number[] | null;
  faction: Faction;
  icon_url: string | null;
  is_highlighted: boolean;
  min_level: number;
  sort_order: number;
  items: ShopSetItemLocalized[];
  exclusive?: boolean;
  eligible?: boolean;
  restriction_reason?: string | null;
}

export interface ShopSetItemLocalized {
  id: number;
  item_id: number;
  name: string;
  icon_url: string | null;
  quality: number | null;
}

// ── Contact Types ──

export interface ContactMessage {
  id: number;
  account_id: number;
  username: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// ── Shard Transaction Types ──

export type ShardTransactionStatus =
  | "pending"
  | "completed"
  | "failed"
  | "expired"
  | "refunded";

export interface ShardTransaction {
  id: number;
  account_id: number;
  stripe_checkout_session_id: string;
  stripe_payment_intent_id: string | null;
  package_shards: number;
  price_eur_cents: number;
  currency: string;
  status: ShardTransactionStatus;
  credited_at: string | null;
  created_at: string;
  updated_at: string;
}
