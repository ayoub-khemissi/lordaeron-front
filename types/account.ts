/* The account page (app/api/account): the account's realms, each with its state and the account's characters there */

import type { Character, DeletedCharacter } from "@/types";
import type { CharacterChallenge } from "@/types/challenges";
import type { RealmSlug } from "@/lib/realms";

export interface AccountCharacter extends Character {
  // its WotLK+ challenge, on a realm that has them (in progress or completed)
  challenge?: CharacterChallenge | null;
}

export interface AccountRealm {
  slug: RealmSlug;
  name: string;
  accent: "gold" | "ice";
  // playable now; before its opening, its name reservation may run (characters already made)
  open: boolean;
  reservation: boolean;
  launchAt: string | null;
  // its worldserver up (auth.realmlist), its players in game
  online: boolean;
  playersOnline: number;
  characters: AccountCharacter[];
  deleted: DeletedCharacter[];
  // its databases could not be read: shown as unavailable rather than empty
  error?: boolean;
}

export interface AccountBan {
  bandate: number;
  unbandate: number;
  bannedby: string;
  banreason: string;
}
