import {
  renderTooltips,
  type Tooltip,
  type TooltipRef,
  type TooltipSource,
} from "./service";
import { type TooltipLocale } from "./locales";

import { realmServer, realmWorldDb } from "@/lib/realms-server";
import { type RealmSlug } from "@/lib/realms";

/*
 * Server only. The tooltips of a realm: its world database (item_template, item_template_locale) and its DBC folder (lib/realms-server.ts).
 */

export { parseRef, refKey, MAX_ID } from "./service";
export type { Tooltip, TooltipKind, TooltipRef } from "./service";
export { isTooltipLocale, TOOLTIP_LOCALES } from "./locales";
export type { TooltipLocale } from "./locales";

export function realmTooltipSource(slug: RealmSlug): TooltipSource {
  return {
    key: slug,
    db: realmWorldDb(slug),
    dbcDir: realmServer(slug).dbcDir,
  };
}

export function realmTooltips(
  slug: RealmSlug,
  refs: readonly TooltipRef[],
  locale: TooltipLocale,
): Promise<Map<string, Tooltip | null>> {
  return renderTooltips(realmTooltipSource(slug), refs, locale);
}
