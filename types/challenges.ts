/* The WotLK+ character challenges of a realm (lib/queries/challenges.ts): the Hall of Fame's Challenges tab and the armory's badge */

// a challenge the Archivist of Trials offers (world wotlk_plus_challenge), its name in the reader's language
export interface ChallengeInfo {
  id: number;
  name: string;
  // its difficulty, 1-5
  stars: number;
  // 0 its aura, 1 aura and title, 2 a legend: aura, title and prestige
  reward: number;
  // the deaths it allows (0: none counted)
  lives: number;
  // Interface\Icons textures: while it lasts, once completed
  icon: string;
  doneIcon: string;
}

// one character's challenge (characters wotlkplus_challenge) and the character
export interface ChallengeRun {
  id: number;
  guid: number;
  name: string;
  race: number;
  class: number;
  gender: number;
  // in progress and completed: the character's level; fallen: its level when it fell
  level: number;
  online: number;
  // the character was deleted since (its name kept, no armory page)
  deleted: boolean;
  challenge: number;
  // the lives left
  lives: number;
  deaths: number;
  started: number;
  ended: number;
  authentic: boolean;
  pvp: boolean;
  // fallen: the killer's name (or a reason) and how it died (0 creature ... 12 other), the zone's name when known
  cause?: string;
  causeType?: number;
  zone?: string | null;
  // a game master's character (an administrator's view only)
  gm?: boolean;
}

export interface ChallengeList {
  runs: ChallengeRun[];
  // all of them (the list shows the first ones)
  total: number;
}

export interface ChallengeBoard {
  challenges: Record<number, ChallengeInfo>;
  inProgress: ChallengeList;
  completed: ChallengeList;
  fallen: ChallengeList;
}

// the armory's badge: the challenge a character is in, or the one it completed
export interface CharacterChallenge {
  challenge: ChallengeInfo;
  completed: boolean;
  authentic: boolean;
  pvp: boolean;
  lives: number;
}
