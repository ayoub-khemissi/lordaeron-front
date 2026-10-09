import { verifyAdminSession } from "@/lib/admin-auth";
import { realmView, type RealmSlug } from "@/lib/realms";

// the realm as the request's visitor sees it: an administrator sees it open (lib/realms.ts realmView)
export async function isRealmPreviewer() {
  return !!(await verifyAdminSession());
}

export async function realmViewForRequest(slug: RealmSlug) {
  return realmView(slug, await isRealmPreviewer());
}
