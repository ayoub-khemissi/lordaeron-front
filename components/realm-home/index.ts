import type { RealmHomeDefinition } from "./types";
import type { RealmSlug } from "@/lib/realms";

import { lordaeronHome } from "./realms/lordaeron";
import { rimeheartHome } from "./realms/rimeheart";

export { RealmHome } from "./realm-home";

// every realm's home (types.ts): a new realm adds its definition here
export const REALM_HOMES: Record<
  RealmSlug,
  (locale: string) => Promise<RealmHomeDefinition>
> = {
  lordaeron: lordaeronHome,
  rimeheart: rimeheartHome,
};
