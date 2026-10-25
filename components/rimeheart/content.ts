/*
 * The realm showcase (/[locale]/rimeheart): every new feature of the Rimeheart realm, player-facing.
 * Facts verified against the content generator and the test realm (contrib/wotlk-plus, inventory of 08/10/2026).
 * Written in French and English here; the six other site languages come from i18n/<lang>.json, keyed by the English
 * text (official Blizzard names in German, Spanish and Russian; game names kept in English in Italian, Polish and
 * Portuguese, which had no 3.3.5 client). A text missing from a dictionary shows in English.
 */
import de from "./i18n/de.json";
import es from "./i18n/es.json";
import it from "./i18n/it.json";
import pl from "./i18n/pl.json";
import pt from "./i18n/pt.json";
import ru from "./i18n/ru.json";

export const LANGS = ["fr", "en", "de", "es", "it", "pl", "pt", "ru"] as const;
export type Lang = (typeof LANGS)[number];
export type T = Record<Lang, string>;

const DICTS: Record<Exclude<Lang, "fr" | "en">, Record<string, string>> = {
  de,
  es,
  it,
  pl,
  pt,
  ru,
};

const L = (fr: string, en: string): T => ({
  fr,
  en,
  de: DICTS.de[en] ?? en,
  es: DICTS.es[en] ?? en,
  it: DICTS.it[en] ?? en,
  pl: DICTS.pl[en] ?? en,
  pt: DICTS.pt[en] ?? en,
  ru: DICTS.ru[en] ?? en,
});

/** Short texts of the page's widgets (the Void Sabre tooltip, mount cards, the quiz, the glory board). */
export const ui = {
  voidSabre: L("Sabre du Vide", "Void Sabre"),
  itemLevel: L("Niveau d'objet", "Item Level"),
  bindsOnPickup: L("Lié quand ramassé", "Binds when picked up"),
  oneHand: L("Une main", "One-Hand"),
  sword: L("Épée", "Sword"),
  damage: L("Dégâts", "Damage"),
  speed: L("Vitesse 1,50", "Speed 1.50"),
  dps: L("dégâts par seconde", "damage per second"),
  agility: L("Agilité", "Agility"),
  stamina: L("Endurance", "Stamina"),
  specTalent: L(
    "Nouveau talent · après {points} points en {spec}",
    "New talent · after {points} points in {spec}",
  ),
  prelude: L("Prélude", "Prelude"),
  phase: L("Phase", "Phase"),
  flyingMount: L("Monture volante", "Flying mount"),
  groundMount: L("Monture terrestre", "Ground mount"),
  atLevel: L(" · niveau {level}", " · level {level}"),
  easyQuestion: L("Une question facile", "An easy question"),
  quizRight: L(
    "Exact ! Le Kirin Tor récompense votre savoir.",
    "Correct! The Kirin Tor rewards your knowledge.",
  ),
  quizWrong: L(
    "Non… la réponse était : Désolation des dragons.",
    "No… the answer was: Dragonblight.",
  ),
  realmFirst: L("Prem's", "Realm First"),
  guildLevel: L("Niveau {level}", "Level {level}"),
};

/** The Rimeheart page's title and description (app/[locale]/[realm]/page.tsx). */
export const meta = {
  title: L(
    "Rimeheart · Le Norfendre comme jamais vécu",
    "Rimeheart · Northrend as never lived before",
  ),
  description: L(
    "Rimeheart, le nouveau royaume progressif Wrath of the Lich King de Lordaeron : raids héroïques, qualité Artefact, boss du monde, métiers réinventés. Réservation des noms le 14 octobre, ouverture le 16 octobre 2026 à 19h00 (heure de Paris).",
    "Rimeheart, Lordaeron's new progressive Wrath of the Lich King realm: heroic raids, Artifact quality, world bosses, reinvented professions. Name reservation October 14, opens October 16, 2026 at 19:00 CEST (17:00 UTC).",
  ),
};

const IMG = {
  lk: "/img/Wrath of the Lich King Classic Cinematic Stills/Wrath_of_the_Lich_King_Classic_Cinematic_Still__(4).jpg",
  army: "/img/Wrath of the Lich King Classic Cinematic Stills/Wrath_of_the_Lich_King_Classic_Cinematic_Still__(1).jpg",
  sindragosa:
    "/img/Wrath of the Lich King Classic Cinematic Stills/Wrath_of_the_Lich_King_Classic_Cinematic_Still__(6).jpg",
  throne:
    "/img/Wrath of the Lich King Classic Reveal Screenshots 1080p/WoW_Wrath_ArthasThrone_003_1080p_png_jpgcopy.jpg",
  dalaranDay:
    "/img/Wrath of the Lich King Classic Reveal Screenshots 1080p/WoW_Wrath_Dalaran_004_1080p_png_jpgcopy.jpg",
  dalaranNight:
    "/img/Wrath of the Lich King Classic Reveal Screenshots 1080p/WoW_Wrath_Dalaran_007_1080p_png_jpgcopy.jpg",
  fjordVillage:
    "/img/Wrath of the Lich King Classic Reveal Screenshots 1080p/WoW_Wrath_HowlingFjord_008_1080p_png_jpgcopy.jpg",
  fjord:
    "/img/Wrath of the Lich King Classic Reveal Screenshots 1080p/WoW_Wrath_HowlingFjord_007_1080p_png_jpgcopy.jpg",
  icecrownGate:
    "/img/Wrath of the Lich King Classic Reveal Screenshots 1080p/WoW_Wrath_Icecrown_003_1080p_png_jpgcopy.jpg",
  icecrownHall:
    "/img/Wrath of the Lich King Classic Reveal Screenshots 1080p/WoW_Wrath_Icecrown_015_1080p_png_jpgcopy.jpg",
  citadel:
    "/img/Wrath of the Lich King Classic Reveal Screenshots 1080p/WoW_Wrath_Icecrown_008_1080p_png_jpgcopy.jpg",
  tuskarr:
    "/img/Wrath of the Lich King Classic Reveal Screenshots 1080p/WoW_Wrath_Tuskarr_001_1080p_png_jpgcopy.jpg",
  ulduarGold:
    "/img/Wrath of the Lich King Classic Secret of Ulduar Screenshots 4K/WoW_Wrath_Ulduar_002_4K_png_jpgcopy.jpg",
  ulduarArchive:
    "/img/Wrath of the Lich King Classic Secret of Ulduar Screenshots 4K/WoW_Wrath_Ulduar_005_4K_png_jpgcopy.jpg",
  ulduarIron:
    "/img/Wrath of the Lich King Classic Secret of Ulduar Screenshots 4K/WoW_Wrath_Ulduar_006_4K_png_jpgcopy.jpg",
  ulduarAlgalon:
    "/img/Wrath of the Lich King Classic Secret of Ulduar Screenshots 4K/WoW_Wrath_Ulduar_007_4K_png_jpgcopy.jpg",
  frostWyrm:
    "/img/Wrath Classic Fall of the Lich King Launch Screenshots/WoW_WrathClassic_Fall_of_the_Lich_King_(9)_png_jpgcopy.jpg",
  sindragosaFight:
    "/img/Wrath Classic Fall of the Lich King Launch Screenshots/WoW_WrathClassic_Fall_of_the_Lich_King_(13)_png_jpgcopy.jpg",
  coliseum:
    "/img/Wrath of the Lich King Classic Call of the Crusade Screenshots/Wrath_Classic_Call_of_the_Crusade_Trial_of_the_Champion_005.jpg",
  champions:
    "/img/Wrath of the Lich King Classic Call of the Crusade Screenshots/Wrath_Classic_Call_of_the_Crusade_Trial_of_the_Champion_014.jpg",
  priestess:
    "/img/Wrath of the Lich King Classic Call of the Crusade Screenshots/Wrath_Classic_Call_of_the_Crusade_Trial_of_the_Champion_003_png_jpgcopy.jpg",
  icehowl:
    "/img/Wrath of the Lich King Classic Call of the Crusade Screenshots/Wrath_Classic_Call_of_the_Crusade_Trial_of_the_Crusader_010.jpg",
  boss: (name: string) => `/img/epic-progressive/${name}.jpg`,
};

export { IMG };

export const hero = {
  kicker: L(
    "Rimeheart · Wrath of the Lich King 3.3.5",
    "Rimeheart · Wrath of the Lich King 3.3.5",
  ),
  // the realm is not open yet (Ayoub, 10/10/2026: opens on 16 October 2026, 19:00 Paris time); {date}: lib/launch.ts. Ayoub,
  // 13/10/2026: the names are reserved from Wednesday 14 October, 19:00 Paris time (the character screen opens, the world on Friday);
  // {reserve}: that day in the page's language
  status: L(
    "Nouveau royaume · Réservation des noms le {reserve}, ouverture le {date}",
    "New realm · Name reservation {reserve}, opens {date}",
  ),
  reservationAt: "2026-10-14T17:00:00Z",
  title: L("Le Norfendre", "Northrend"),
  titleAccent: L("comme jamais vécu.", "as never lived before."),
  subtitle: L(
    "Un royaume progressif fidèle à la 3.3.5, et des centaines de nouveautés introuvables ailleurs.",
    "A progressive realm true to 3.3.5, with hundreds of additions found nowhere else.",
  ),
  ctaPrimary: L("Rejoindre l'aventure", "Join the adventure"),
  ctaSecondary: L("Découvrir le royaume", "Discover the realm"),
  scroll: L("Défiler", "Scroll"),
};

export const manifesto = {
  eyebrow: L("Le royaume", "The realm"),
  title: L(
    "Fidèle à la légende.\nJamais vu ailleurs.",
    "True to the legend.\nUnseen anywhere else.",
  ),
  text: L(
    "Lordaeron rejoue l'extension **palier par palier**, comme à sa sortie, sur une base 3.3.5 fidèle. Et à chaque palier, **du contenu neuf** : chaque création est pensée dans le lore, équilibrée pour chaque spécialisation, **traduite dans cinq langues**.",
    "Lordaeron replays the expansion **tier by tier**, as at launch, on a faithful 3.3.5 base. And at every tier, **new content**: every creation is rooted in the lore, balanced for every specialization, **translated into five languages**.",
  ),
  stats: [
    {
      value: 5,
      suffix: "",
      label: L("phases de progression", "progression phases"),
    },
    {
      value: 283,
      suffix: "",
      label: L("nouveaux hauts faits", "new achievements"),
    },
    { value: 64, suffix: "", label: L("nouvelles montures", "new mounts") },
    {
      value: 303,
      suffix: "",
      label: L("recettes de métier", "profession recipes"),
    },
    {
      value: 28,
      suffix: "",
      label: L("spécialisations de métier", "profession specializations"),
    },
    {
      value: 32,
      suffix: "",
      label: L("sorts de classe inédits", "brand-new class spells"),
    },
    {
      value: 16302,
      suffix: "",
      label: L("apparences de transmogrification", "transmog appearances"),
    },
    { value: 297, suffix: "", label: L("questions de lore", "lore questions") },
    { value: 53, suffix: "", label: L("nouveaux titres", "new titles") },
  ],
};

/** A phase of the timeline, built like the banner shared on Reddit: up to three lines, a small-caps footer, the heroic
    tab, and the Burning Crusade raid brought to level 80 in this phase (the gold track). */
export type PhaseStep = {
  n: string;
  title: T;
  icon: string;
  length: T;
  lines: T[];
  meta: T;
  heroic?: boolean;
  // planned: not built yet (design/raids-classiques.md: only The Eye is, Karazhan, Black Temple and Sunwell Plateau follow)
  classic?: { icon: string; name: T; planned?: boolean };
};

export const phases = {
  id: "phases",
  numeral: "I",
  eyebrow: L("Royaume progressif", "Progressive realm"),
  title: L(
    "Cinq phases. Trois mois chacune.",
    "Five phases. Three months each.",
  ),
  lede: L(
    "Revivez l'extension comme à sa sortie. Instances, butin, recettes, vendeurs, quêtes, emblèmes et saisons d'arène s'ouvrent au rythme des phases, **sans jamais d'avance**. Chaque ouverture est **annoncée en jeu**.",
    "Relive the expansion as it launched. Instances, loot, recipes, vendors, quests, emblems and arena seasons open with each phase, **never ahead of time**. Every opening is **announced in game**.",
  ),
  steps: [
    {
      n: "0",
      title: L("Le prélude", "The prelude"),
      icon: "spell_frost_frozencore",
      // Ayoub, 13/10/2026: two weeks, unless he decides otherwise
      length: L("2 semaines", "2 weeks"),
      lines: [
        L("12 donjons du Norfendre", "12 Northrend dungeons"),
        L("Normal et héroïque", "Normal & heroic"),
        L("Joug-d'hiver", "Wintergrasp"),
      ],
      meta: L("Champs de bataille · Arènes", "Battlegrounds · Arenas"),
    },
    {
      n: "1",
      title: L("Naxxramas", "Naxxramas"),
      icon: "achievement_dungeon_naxxramas_normal",
      length: L("3 mois", "3 months"),
      lines: [
        L("Naxxramas", "Naxxramas"),
        L("Sanctum obsidien", "Obsidian Sanctum"),
        L("L'Œil de l'éternité", "Eye of Eternity"),
      ],
      meta: L("Archavon · Arène S5", "Archavon · Arena S5"),
      heroic: true,
    },
    {
      n: "2",
      title: L("Ulduar", "Ulduar"),
      icon: "achievement_dungeon_ulduarraid_misc_01",
      length: L("3 mois", "3 months"),
      lines: [
        L("Ulduar", "Ulduar"),
        L("Tournoi d'argent", "Argent Tournament"),
      ],
      meta: L("Emalon · Arène S6", "Emalon · Arena S6"),
      heroic: true,
      classic: {
        icon: "achievement_boss_kaelthassunstrider_01",
        name: L("L'Œil", "The Eye"),
      },
    },
    {
      n: "3",
      title: L("L'Épreuve", "The Trial"),
      icon: "achievement_reputation_argentcrusader",
      length: L("3 mois", "3 months"),
      lines: [
        L("Épreuve du croisé", "Trial of the Crusader"),
        L("Onyxia · niveau 80", "Onyxia · level 80"),
      ],
      meta: L("Koralon · Arène S7", "Koralon · Arena S7"),
      classic: {
        icon: "achievement_boss_princemalchezaar_02",
        name: L("Karazhan", "Karazhan"),
        planned: true,
      },
    },
    {
      n: "4",
      title: L("La Citadelle", "The Citadel"),
      icon: "achievement_boss_lichking",
      length: L("3 mois", "3 months"),
      lines: [
        L("Citadelle de la Couronne de glace", "Icecrown Citadel"),
        L("Salles gelées", "Frozen Halls"),
      ],
      meta: L("Toravon · Arène S8", "Toravon · Arena S8"),
      classic: {
        icon: "achievement_boss_illidan",
        name: L("Temple noir", "Black Temple"),
        planned: true,
      },
    },
    {
      n: "5",
      title: L("Le Crépuscule", "Twilight"),
      icon: "spell_shadow_twilight",
      length: L("3 mois", "3 months"),
      lines: [L("Sanctum rubis", "Ruby Sanctum"), L("Halion", "Halion")],
      meta: L("Phase finale", "Final phase"),
      classic: {
        icon: "achievement_boss_kiljaedan",
        name: L("Plateau du Puits de soleil", "Sunwell Plateau"),
        planned: true,
      },
    },
  ] as PhaseStep[],
  launchTag: L("Ouverture", "Launch"),
  phaseTag: L("Phase", "Phase"),
  heroicTag: L("Héroïque 10 et 25", "Heroic 10 & 25"),
  plannedTag: L("Prévu", "Planned"),
  // the gold track under the cards
  track: [
    L("Raids de Burning Crusade", "Burning Crusade raids"),
    L("portés au niveau 80", "brought to level 80"),
  ],
  footnote: L(
    "Les raids classiques et de Burning Crusade **restent ouverts dès le premier jour** (sauf Onyxia, de retour en phase 3 au niveau 80), comme la double spécialisation et la Recherche de donjons.",
    "Classic and Burning Crusade raids **stay open from day one** (except Onyxia, back in phase 3 at level 80), as do dual specialization and the Dungeon Finder.",
  ),
};

export const artifact = {
  id: "artifact",
  numeral: "II",
  eyebrow: L("Qualité Artefact", "Artifact quality"),
  title: L("Plus haut que l'épique.", "Beyond epic."),
  lede: L(
    "Chaque objet ramassé, fabriqué, pêché ou reçu en récompense peut sortir **un cran au-dessus**. Vert, bleu, épique… et **Artefact, le rang doré**.",
    "Every item looted, crafted, fished or earned can drop **one step higher**. Green, blue, epic… and **Artifact, the golden rank**.",
  ),
  tiers: [
    { color: "#1eff00", label: L("Peu commun", "Uncommon") },
    { color: "#0070dd", label: L("Rare", "Rare") },
    { color: "#a335ee", label: L("Épique", "Epic") },
    { color: "#e6cc80", label: L("Artefact", "Artifact") },
  ],
  points: [
    L(
      "18 592 versions supérieures d'équipements existants, dont 7 143 en qualité Artefact.",
      "18,592 higher-quality versions of existing gear, 7,143 of them Artifact.",
    ),
    L(
      "Un Artefact a 15 % de statistiques en plus qu'un épique du même niveau, et ses effets montent avec lui.",
      "An Artifact has 15% more stats than an epic of the same level, and its effects grow with it.",
    ),
    L(
      "Le tirage a lieu au butin, à la pêche, à chaque fabrication et aux récompenses de quête.",
      "The roll happens on loot, while fishing, on every craft and on quest rewards.",
    ),
    L(
      "Transmogrifiable, comme tout le reste.",
      "Transmogrifiable, like everything else.",
    ),
  ],
  token: {
    icon: "INV_Misc_Token_ArgentDawn3",
    title: L("Le Jeton d'ascension", "The Ascension Token"),
    text: L(
      "Quand la chance ne suffit plus. Le jeton élève l'arme ou la pièce d'armure de votre choix d'un rang de qualité : **jamais d'échec**, **enchantements et gemmes conservés**. L'Ordre des Archivistes ne le confie qu'à ses membres exaltés.",
      "For when luck is not enough. The token raises the weapon or armor piece of your choice by one quality rank: **it never fails**, and **every enchantment and gem stays**. The Archivist Order entrusts it only to its Exalted.",
    ),
  },
};

export type ClassEntry = {
  key: string;
  name: T;
  color: string;
  icon: string;
  spells: { name: T; spec: T }[];
  flavor: T;
};

export const classes = {
  id: "classes",
  numeral: "III",
  eyebrow: L("Classes", "Classes"),
  title: L(
    "Chaque spécialisation a son moment.",
    "Every specialization gets its moment.",
  ),
  lede: L(
    "Chaque arbre de talents gagne **son talent de spécialisation** : un nouveau sort, à prendre dans l'arbre comme un talent Blizzard (deux pour le druide farouche, félin et ours). Chaque classe reçoit aussi **trois nouveaux talents**, ajoutés à ceux de Blizzard **sans en retirer aucun**, et **deux glyphes**. Pensés pour leur identité et leur lore, équilibrés entre eux, **jamais une copie d'un sort existant**.",
    "Every talent tree gains **its specialization talent**: a new spell, picked in the tree like any Blizzard talent (two for the feral druid, cat and bear). Every class also receives **three new talents**, added to Blizzard's **without removing any**, and **two glyphs**. Built for their identity and lore, balanced against each other, **never a copy of an existing spell**.",
  ),
  list: [
    {
      key: "warrior",
      name: L("Guerrier", "Warrior"),
      color: "#C79C6E",
      icon: "inv_axe_114",
      flavor: L(
        "La hache part… et revient.",
        "The axe flies out… and comes back.",
      ),
      spells: [
        {
          name: L("Ruée du gladiateur", "Gladiator's Rush"),
          spec: L("Armes", "Arms"),
        },
        {
          name: L("Hache tournoyante", "Whirling Axe"),
          spec: L("Fureur", "Fury"),
        },
        {
          name: L("Colère de Broxigar", "Broxigar's Wrath"),
          spec: L("Protection", "Protection"),
        },
      ],
    },
    {
      key: "paladin",
      name: L("Paladin", "Paladin"),
      color: "#F58CBA",
      icon: "spell_holy_proclaimchampion",
      flavor: L(
        "L'Aube d'argent brandit sa bannière.",
        "The Argent Dawn raises its banner.",
      ),
      spells: [
        {
          name: L("Bannière de l'Aube d'argent", "Banner of the Argent Dawn"),
          spec: L("Sacré", "Holy"),
        },
        {
          name: L("Veillée du chevalier", "Knight's Vigil"),
          spec: L("Vindicte", "Retribution"),
        },
        {
          name: L("Serment de protection", "Oath of Protection"),
          spec: L("Protection", "Protection"),
        },
      ],
    },
    {
      key: "hunter",
      name: L("Chasseur", "Hunter"),
      color: "#ABD473",
      icon: "ability_hunter_beastcall",
      flavor: L(
        "Un double spectral de votre familier.",
        "A spectral double of your pet.",
      ),
      spells: [
        {
          name: L("Écho sauvage", "Wild Echo"),
          spec: L("Maîtrise des bêtes", "Beast Mastery"),
        },
        {
          name: L("Tir de Nesingwary", "Nesingwary's Trophy Shot"),
          spec: L("Précision", "Marksmanship"),
        },
        {
          name: L("Leurre du trappeur", "Trapper's Decoy"),
          spec: L("Survie", "Survival"),
        },
      ],
    },
    {
      key: "rogue",
      name: L("Voleur", "Rogue"),
      color: "#FFF569",
      icon: "inv_throwingknife_01",
      flavor: L(
        "Un contrat de Ravenholdt, un couteau qui rebondit.",
        "A Ravenholdt contract, a bouncing knife.",
      ),
      spells: [
        {
          name: L("Contrat de Ravenholdt", "Ravenholdt Contract"),
          spec: L("Assassinat", "Assassination"),
        },
        {
          name: L("Couteau rebondissant", "Ricochet Knife"),
          spec: L("Combat", "Combat"),
        },
        {
          name: L("Double d'ombre", "Shadow Double"),
          spec: L("Finesse", "Subtlety"),
        },
      ],
    },
    {
      key: "priest",
      name: L("Prêtre", "Priest"),
      color: "#FFFFFF",
      icon: "spell_holy_borrowedtime",
      flavor: L(
        "L'esprit d'Alonsus Faol veille sur vous.",
        "The spirit of Alonsus Faol watches over you.",
      ),
      spells: [
        {
          name: L("Vertu de ténacité", "Virtue of Tenacity"),
          spec: L("Discipline", "Discipline"),
        },
        {
          name: L("Litanie de Faol", "Litany of Faol"),
          spec: L("Sacré", "Holy"),
        },
        {
          name: L("Fracture de l'esprit", "Mind Fracture"),
          spec: L("Ombre", "Shadow"),
        },
      ],
    },
    {
      key: "deathknight",
      name: L("Chevalier de la mort", "Death Knight"),
      color: "#C41F3B",
      icon: "achievement_boss_lanathel",
      flavor: L(
        "Les ombres des San'layn vous suivent.",
        "The shadows of the San'layn follow you.",
      ),
      spells: [
        {
          name: L("Ombres des San'layn", "Shadows of the San'layn"),
          spec: L("Sang", "Blood"),
        },
        { name: L("Sillage gelé", "Frozen Wake"), spec: L("Givre", "Frost") },
        { name: L("Esprits vils", "Vile Spirits"), spec: L("Impie", "Unholy") },
      ],
    },
    {
      key: "shaman",
      name: L("Chaman", "Shaman"),
      color: "#0070DE",
      icon: "inv_elemental_primal_air",
      flavor: L("La fureur d'Al'Akir gronde.", "Al'Akir's fury roars."),
      spells: [
        {
          name: L("Rafale orageuse", "Stormgust"),
          spec: L("Élémentaire", "Elemental"),
        },
        {
          name: L("Fureur d'Al'Akir", "Al'Akir's Fury"),
          spec: L("Amélioration", "Enhancement"),
        },
        {
          name: L("Ressac", "Undertow"),
          spec: L("Restauration", "Restoration"),
        },
      ],
    },
    {
      key: "mage",
      name: L("Mage", "Mage"),
      color: "#69CCF0",
      icon: "inv_misc_orb_04",
      flavor: L(
        "Le trou noir d'Algalon, entre vos mains.",
        "Algalon's black hole, in your hands.",
      ),
      spells: [
        {
          name: L("Singularité céleste", "Celestial Singularity"),
          spec: L("Arcanes", "Arcane"),
        },
        { name: L("Terre brûlée", "Scorched Earth"), spec: L("Feu", "Fire") },
        {
          name: L("Marque de l'hiver", "Winter's Mark"),
          spec: L("Givre", "Frost"),
        },
      ],
    },
    {
      key: "warlock",
      name: L("Démoniste", "Warlock"),
      color: "#9482C9",
      icon: "spell_shadow_shadowfury",
      flavor: L(
        "Interrompez-le… si vous l'osez.",
        "Interrupt him… if you dare.",
      ),
      spells: [
        {
          name: L("Chaînes de tourment", "Chains of Torment"),
          spec: L("Affliction", "Affliction"),
        },
        {
          name: L("Curée démoniaque", "Demon's Quarry"),
          spec: L("Démonologie", "Demonology"),
        },
        {
          name: L("Faille ardente", "Searing Rift"),
          spec: L("Destruction", "Destruction"),
        },
      ],
    },

    {
      key: "druid",
      name: L("Druide", "Druid"),
      color: "#FF7D0A",
      icon: "spell_nature_starfall",
      flavor: L(
        "Une étoile tombe, le bosquet répond.",
        "A star falls, the grove answers.",
      ),
      spells: [
        {
          name: L("Graine d'étoile", "Starseed"),
          spec: L("Équilibre", "Balance"),
        },
        {
          name: L("Bonds du prédateur", "Predator's Leaps"),
          spec: L("Combat farouche (félin)", "Feral (Cat)"),
        },
        {
          name: L("Peau d'Ursoc", "Ursoc's Hide"),
          spec: L("Combat farouche (ours)", "Feral (Bear)"),
        },
        {
          name: L("Feu follet du bosquet", "Grove Wisp"),
          spec: L("Restauration", "Restoration"),
        },
      ],
    },
  ] as ClassEntry[],
  surge: {
    icon: "spell_nature_timestop",
    title: L("Afflux chronique", "Chronal Surge"),
    text: L(
      "Le Kirin Tor plie le temps : les mages deviennent la deuxième classe à porter la hâte de raid. **+30 % de hâte pour tout le raid** pendant 40 secondes.",
      "The Kirin Tor bends time: mages become the second class to bring raid haste. **+30% haste for the whole raid** for 40 seconds.",
    ),
  },
};

/** A new race and class pair (lordaeron-core-lab contrib/wotlk-plus content/race-class.js PAIRS): the race's portrait, the
    class (its name and colour: classes.list) and the faction. */
export type RacePair = { race: T; icon: string; cls: string; horde: boolean };

const RACE = {
  human: L("Humain", "Human"),
  dwarf: L("Nain", "Dwarf"),
  gnome: L("Gnome", "Gnome"),
  nightElf: L("Elfe de la nuit", "Night Elf"),
  orc: L("Orc", "Orc"),
  undead: L("Mort-vivant", "Undead"),
  tauren: L("Tauren", "Tauren"),
  troll: L("Troll", "Troll"),
  bloodElf: L("Elfe de sang", "Blood Elf"),
};

/** The eleven race and class pairs (Ayoub, 12-13/10/2026; content/race-class.js, racial-traits.js, the class mounts' riding). */
export const raceClasses = {
  id: "races",
  numeral: "IV",
  eyebrow: L("Races et classes", "Races & classes"),
  title: L(
    "Onze combinaisons que la 3.3.5 n'avait pas.",
    "Eleven pairs 3.3.5 never had.",
  ),
  lede: L(
    "De **nouvelles combinaisons de race et de classe** sont jouables **dès la création du personnage** : chacune a ses **maîtres de classe de sa race**, ses quêtes de classe, sa tenue de départ et ses montures. Et pour tous, **les traits raciaux d'un autre peuple**.",
    "**New race and class pairs** are playable **from character creation**: each has **class trainers of its own race**, its class quests, its starting outfit and its mounts. And for everyone, **the racial traits of another people**.",
  ),
  pairs: [
    {
      race: RACE.human,
      icon: "achievement_character_human_male",
      cls: "hunter",
      horde: false,
    },
    {
      race: RACE.dwarf,
      icon: "achievement_character_dwarf_male",
      cls: "mage",
      horde: false,
    },
    {
      race: RACE.dwarf,
      icon: "achievement_character_dwarf_male",
      cls: "shaman",
      horde: false,
    },
    {
      race: RACE.gnome,
      icon: "achievement_character_gnome_male",
      cls: "priest",
      horde: false,
    },
    {
      race: RACE.nightElf,
      icon: "achievement_character_nightelf_female",
      cls: "mage",
      horde: false,
    },
    {
      race: RACE.orc,
      icon: "achievement_character_orc_male",
      cls: "mage",
      horde: true,
    },
    {
      race: RACE.undead,
      icon: "achievement_character_undead_male",
      cls: "hunter",
      horde: true,
    },
    {
      race: RACE.tauren,
      icon: "achievement_character_tauren_male",
      cls: "paladin",
      horde: true,
    },
    {
      race: RACE.tauren,
      icon: "achievement_character_tauren_male",
      cls: "priest",
      horde: true,
    },
    {
      race: RACE.troll,
      icon: "achievement_character_troll_male",
      cls: "druid",
      horde: true,
    },
    {
      race: RACE.bloodElf,
      icon: "achievement_character_bloodelf_female",
      cls: "warrior",
      horde: true,
    },
  ] as RacePair[],
  alliance: L("Alliance", "Alliance"),
  horde: L("Horde", "Horde"),
  cards: [
    {
      icon: "inv_misc_book_07",
      title: L("Des maîtres de leur race", "Trainers of their own race"),
      text: L(
        "**21 maîtres de classe** de leur race, dans les zones de départ, les villages et les capitales, chacun armé pour sa classe. Dans les capitales, les gardes vous indiquent le chemin.",
        "**21 class trainers** of their own race, in the starting areas, villages and capitals, each armed for their class. In the capitals, the guards show you the way.",
      ),
    },
    {
      icon: "ability_hunter_beasttaming",
      title: L("Leur propre parcours", "Their own path"),
      text: L(
        "Leurs quêtes de classe leur sont ouvertes : le dressage des bêtes pour les chasseurs, la voie des paladins elfes de sang pour le tauren, les formes d'ours et aquatique pour le troll. Avec leur propre tenue de départ, et les quatre totems du chaman nain dès la création.",
        "Their class quests are open to them: beast taming for the hunters, the blood elf paladins' path for the tauren, the bear and aquatic forms for the troll. With their own starting outfit, and the dwarf shaman's four totems from creation.",
      ),
    },
    {
      icon: "ability_mount_kodo_01",
      title: L("Kodos marche-soleil", "Sunwalker Kodos"),
      text: L(
        "Le paladin tauren monte le **kodo marche-soleil** au niveau 20 et le **grand kodo marche-soleil** au niveau 40, avec leur cri de kodo.",
        "The tauren paladin rides the **Sunwalker Kodo** at level 20 and the **Great Sunwalker Kodo** at level 40, with a kodo's call.",
      ),
    },
    {
      icon: "ability_racial_bearform",
      title: L("Formes du druide troll", "Troll druid forms"),
      text: L(
        "Le druide troll a ses propres formes de **félin**, d'**ours** et de **vol rapide**. Leur couleur suit celle de ses cheveux, comme pour les elfes de la nuit et les taurens.",
        "The troll druid has their own **cat**, **bear** and **swift flight** forms. Their color follows the hair color, as for night elves and tauren.",
      ),
    },
    {
      icon: "racial_orc_berserkerstrength",
      title: L("Les dons d'un autre peuple", "Another people's gifts"),
      text: L(
        "À Dalaran, l'archiviste Ilsera, gardienne des lignées, vous enseigne **les traits raciaux d'un autre peuple**, gratuitement, **une fois par réinitialisation des raids**. Avec les variantes que Blizzard n'avait jamais faites : un Torrent arcanique qui rend de la rage au guerrier, la Fureur sanguinaire pour le paladin et le druide…",
        "In Dalaran, Archivist Ilsera, Keeper of Lineages, teaches you **the racial traits of another people**, free of charge, **once per raid reset**. Including the variants Blizzard never made: an Arcane Torrent that restores the warrior's rage, Blood Fury for paladins and druids…",
      ),
    },
    {
      icon: "ability_mount_charger",
      title: L("Montures de classe", "Class mounts"),
      text: L(
        "Les montures de classe apprennent leur monte : le paladin et le démoniste reçoivent les leurs tout seuls aux niveaux 20 et 40, le destrier de la mort du chevalier de la mort apprend Compagnon cavalier, la forme de vol du druide Expert cavalier. Seul **Artisan cavalier (vol à 280 %)** reste à acheter.",
        "Class mounts teach their riding: paladins and warlocks get theirs on their own at levels 20 and 40, the death knight's Deathcharger teaches Journeyman Riding, the druid's Flight Form Expert Riding. Only **Artisan Riding (280% flying)** is still to buy.",
      ),
    },
  ],
  patch: {
    icon: "inv_misc_rune_01",
    title: L(
      "Le patch Rimeheart est obligatoire",
      "The Rimeheart patch is required",
    ),
    text: L(
      "Ces combinaisons, leurs montures et leurs formes viennent avec le **patch client de Rimeheart** : sans lui, l'écran de création ne les propose pas. Le guide de connexion explique comment l'installer.",
      "These pairs, their mounts and forms come with the **Rimeheart client patch**: without it, the character creation screen does not offer them. The connection guide explains how to install it.",
    ),
    cta: L("Voir le guide", "Open the guide"),
  },
};

export const raids = {
  id: "raids",
  numeral: "V",
  eyebrow: L("Raids héroïques", "Heroic raids"),
  title: L("Naxxramas, Ulduar… en héroïque.", "Naxxramas, Ulduar… in heroic."),
  lede: L(
    "Les raids des premières phases gagnent un **vrai mode héroïque en 10 et en 25**, sur le modèle de la Citadelle : le chef de raid change de difficulté **sans quitter l'instance**, et chaque objet a sa version Héroïque.",
    "The early raids gain a **true heroic mode in 10 and 25**, on the Icecrown Citadel model: the raid leader switches difficulty **without leaving the instance**, and every item has its Heroic version.",
  ),
  stats: [
    { value: 4, label: L("raids en héroïque", "raids in heroic") },
    { value: 1263, label: L("objets héroïques", "heroic items") },
    { value: 66, label: L("hauts faits héroïques", "heroic achievements") },
  ],
  cards: [
    {
      icon: "achievement_dungeon_naxxramas_normal",
      title: L("Naxxramas", "Naxxramas"),
      text: L(
        "Les quatre quartiers et Kel'Thuzad, plus forts : **×1,4 points de vie, ×1,25 dégâts**.",
        "The four quarters and Kel'Thuzad, stronger: **×1.4 health, ×1.25 damage**.",
      ),
    },
    {
      icon: "achievement_dungeon_ulduarraid_misc_01",
      title: L("Ulduar", "Ulduar"),
      text: L(
        "Héroïque et modes difficiles se cumulent. Butin jusqu'au **niveau d'objet 252**.",
        "Heroic and hard modes stack. Loot up to **item level 252**.",
      ),
    },
    {
      icon: "achievement_dungeon_nexusraid",
      title: L(
        "Sanctum obsidien & Œil de l'éternité",
        "Obsidian Sanctum & Eye of Eternity",
      ),
      text: L(
        "Sartharion et ses drakes, Malygos et sa folie, en héroïque.",
        "Sartharion and his drakes, Malygos and his madness, in heroic.",
      ),
    },
    {
      icon: "inv_misc_token_argentdawn",
      title: L("380 pièces d'ensemble héroïques", "380 heroic tier pieces"),
      text: L(
        "Les jetons T7 et T8 héroïques chez les marchands de palier, avec la même disposition que le normal.",
        "Heroic T7 and T8 tokens at the tier vendors, laid out just like normal.",
      ),
    },
  ],
  howTitle: L("Comme à la Citadelle", "Just like Icecrown Citadel"),
  how: [
    L(
      "Le mode héroïque s'ouvre quand le chef de raid a vaincu le dernier boss en normal.",
      "Heroic opens once the raid leader has defeated the last boss on normal.",
    ),
    L(
      "On passe de normal à héroïque en plein raid, hors combat, sans rien perdre de son avancement.",
      "Switch between normal and heroic mid-raid, out of combat, without losing progress.",
    ),
    L(
      "Un seul verrou pour le normal et l'héroïque.",
      "One lockout for normal and heroic.",
    ),
    L(
      "La Citadelle et le Sanctum rubis fonctionnent de la même façon.",
      "Icecrown Citadel and the Ruby Sanctum work the same way.",
    ),
  ],
  trial: {
    title: L(
      "L'Épreuve du croisé, comme à l'époque",
      "The Trial of the Crusader, as it was",
    ),
    text: L(
      "Dialogues de Tirion, Varian, Garrosh et Thrall restaurés, **50 tentatives en héroïque** et un tribut selon les tentatives restantes.",
      "Tirion, Varian, Garrosh and Thrall's dialogue restored, **50 attempts in heroic**, and a tribute based on the attempts left.",
    ),
  },
  image: IMG.ulduarIron,
};

export const eye = {
  id: "eye",
  numeral: "VI",
  eyebrow: L("Raid classique au niveau 80", "Classic raid at level 80"),
  title: L("L'Œil de Kael'thas renaît.", "Kael'thas's Eye reborn."),
  lede: L(
    "Le Donjon de la Tempête **revient au niveau 80**, en 10 et 25 joueurs, aux côtés d'Ulduar. **Boss de niveau 83**, **T5 refait**, et les armes légendaires de Kael'thas remises à niveau.",
    "Tempest Keep **returns at level 80**, for 10 and 25 players, alongside Ulduar. **Level 83 bosses**, **a remade Tier 5**, and Kael'thas's legendary weapons brought up to date.",
  ),
  points: [
    {
      icon: "inv_sword_69",
      text: L(
        "Les 7 armes légendaires de Kael'thas, au niveau d'objet 251 et 258.",
        "Kael'thas's 7 legendary weapons, at item levels 251 and 258.",
      ),
    },
    {
      icon: "inv_misc_summerfest_brazierorange",
      text: L(
        "Les Cendres d'Al'ar tombent toujours.",
        "The Ashes of Al'ar still drop.",
      ),
    },
    {
      icon: "spell_deathknight_frostpresence",
      text: L(
        "2 ensembles inédits pour chevalier de la mort : le Fléau-du-soleil.",
        "2 brand-new death knight sets: the Sunbane.",
      ),
    },
    {
      icon: "achievement_boss_kael'thassunstrider_01",
      text: L(
        "324 objets niveau 80, 38 ensembles, 10 hauts faits.",
        "324 level 80 items, 38 sets, 10 achievements.",
      ),
    },
  ],
  // the next Burning Crusade raids brought to level 80, one per phase (design/raids-classiques.md)
  nextTitle: L("Prévus ensuite, au niveau 80", "Planned next, at level 80"),
  next: [
    {
      phase: 3,
      icon: "achievement_boss_princemalchezaar_02",
      name: L("Karazhan", "Karazhan"),
    },
    {
      phase: 4,
      icon: "achievement_boss_illidan",
      name: L("Le Temple noir", "Black Temple"),
    },
    {
      phase: 5,
      icon: "achievement_boss_kiljaedan",
      name: L("Le Plateau du Puits de soleil", "Sunwell Plateau"),
    },
  ],
  image:
    "/img/Burning Crusade Classic Overlords of Outland Announce/BCC_Overlords_of_Outland_KaelThas_1920x1080.jpg",
  mountImage:
    "/img/Burning Crusade Classic Overlords of Outland Screenshots 1080p/BCC_Overlords_of_Outland__Ashes_of_Alar_Mount_1920x1080.jpg",
};

export const worldBosses = {
  id: "world-bosses",
  numeral: "VII",
  eyebrow: L("Boss du monde", "World bosses"),
  title: L("Des colosses à ciel ouvert.", "Colossi under the open sky."),
  lede: L(
    "De 10 à 40 joueurs, personne ne « marque » le boss : **chaque participant est récompensé**, avec **un objet de sa spécialisation garanti** à chaque période de raid.",
    "From 10 to 40 players, nobody tags the boss: **every participant is rewarded**, with **an item for their specialization guaranteed** each raid lockout.",
  ),
  bosses: [
    {
      name: L("Lazulygos, Siphon tellurique", "Lazulygos, Ley Siphon"),
      phase: L("Phase 1", "Phase 1"),
      image: "/img/experience/coldarra.webp",
      text: L(
        "Un grand dragon bleu se bat sur les plateformes flottantes de Frimarra et projette le raid de plateforme en plateforme. À sa mort, Malygos en personne apparaît.",
        "A great blue dragon fights on Coldarra's floating platforms and hurls the raid from one to the next. At its death, Malygos himself appears.",
      ),
      tags: [
        L("Surcharge du Nexus", "Nexus Overload"),
        L("Égide violette du Kirin Tor", "The Kirin Tor's Violet Aegis"),
        L("Mascotte : Petit drake tellurique", "Pet: Ley Drakeling"),
      ],
    },
    {
      name: L(
        "Thul'gorah, Murmure de Yogg-Saron",
        "Thul'gorah, Whisper of Yogg-Saron",
      ),
      phase: L("Phase 2", "Phase 2"),
      image: "/img/experience/thorim-arena.jpg",
      text: L(
        "Un sans-visage né du sang de Yogg-Saron envahit l'arène du trône de Thorim. Thorim et Veranus combattent à vos côtés. Cachez-vous derrière la saronite… ou devenez fou.",
        "A Faceless One born of Yogg-Saron's blood invades the arena of Thorim's throne. Thorim and Veranus fight at your side. Hide behind the saronite… or go mad.",
      ),
      tags: [
        L("Cris en Shath'Yar traduits", "Shath'Yar whispers, translated"),
        L("Regard sans visage à partager", "Faceless Gaze to share"),
        L("Mascotte : Rejeton de saronite", "Pet: Saronite Spawnling"),
      ],
    },
  ],
};

export const raidRules = {
  id: "loot",
  numeral: "VIII",
  eyebrow: L("Butin et combats", "Loot and fights"),
  title: L("Fini les ninjas.", "No more ninjas."),
  lede: L(
    "Le butin des boss arrive **directement dans le sac de celui à qui il sert**. **Pas de dés, pas de maître du butin** : une répartition juste, transparente, qui récompense tout le monde.",
    "Boss loot goes **straight into the bag of whoever needs it**. **No rolls, no master looter**: a fair, transparent distribution that rewards everyone.",
  ),
  steps: [
    {
      icon: "ability_marksmanship",
      label: L("Spécialisation principale", "Main specialization"),
    },
    {
      icon: "ability_dualwieldspecialization",
      label: L("Seconde spécialisation", "Off specialization"),
    },
    {
      icon: "inv_enchant_disenchant",
      label: L("Désenchantement automatique", "Automatic disenchant"),
    },
    {
      icon: "inv_chest_plate16",
      label: L("Classe qui peut l'utiliser", "Classes that can use it"),
    },
    {
      icon: "spell_holy_prayeroffortitude",
      label: L("Tout le monde", "Everyone"),
    },
  ],
  points: [
    L(
      "À chaque étape, l'objet doit être une amélioration pour vous.",
      "At every step, the item must be an upgrade for you.",
    ),
    L(
      "En cas d'égalité, le moins servi passe d'abord, puis le plus malchanceux.",
      "On a tie, the least rewarded goes first, then the unluckiest.",
    ),
    L(
      "Tout le groupe voit qui reçoit quoi. L'échange reste possible pendant 2 heures.",
      "The whole group sees who gets what. Trading stays open for 2 hours.",
    ),
    L(
      "Les « meilleurs en slot » de chaque spécialisation sont reconnus, même hors de leur type d'armure : les brassards en cuir du guerrier, le tissu du paladin sacré…",
      "Each specialization's best-in-slot pieces count too, even outside their armor type: a warrior's leather bracers, a Holy paladin's cloth…",
    ),
  ],
  fight: {
    title: L("Chaque combat compte", "Every fight counts"),
    text: L(
      "À la fin d'un combat de boss, **tous les temps de recharge de classe repartent à zéro** et l'Épuisement disparaît. Et pendant le combat, un mort ne peut pas libérer son esprit : on reste avec son raid.",
      "When a boss fight ends, **every class cooldown resets** and Exhaustion fades. And during the fight, the dead cannot release: you stay with your raid.",
    ),
  },
};

export const archivists = {
  id: "archivists",
  numeral: "IX",
  eyebrow: L("L'Ordre des Archivistes", "The Archivist Order"),
  title: L(
    "Chaque boss vaincu laisse une page d'histoire.",
    "Every fallen boss leaves a page of history.",
  ),
  lede: L(
    "Les Fragments de chronique tombent sur **plus de 600 boss**, de donjon comme de raid. Les Archivistes les paient en réputation, en tabards, en monture… et en Jetons d'ascension.",
    "Chronicle Fragments drop from **more than 600 bosses**, dungeons and raids alike. The Archivists pay for them in reputation, tabards, a mount… and Ascension Tokens.",
  ),
  rewards: [
    {
      icon: "inv_misc_tabardsummer01",
      title: L("Tabard des Archivistes", "Tabard of the Archivists"),
      text: L(
        "Téléportez-vous auprès de l'Archiviste.",
        "Teleport to the Archivist.",
      ),
    },
    {
      icon: "inv_feather_07",
      title: L("Plume de l'Archiviste", "Archivist's Quill"),
      text: L("Au rang Révéré.", "At Revered."),
    },
    {
      icon: "ability_mount_ridinghorse",
      title: L("Destrier de l'Archive", "Archive Steed"),
      text: L("La monture des Exaltés.", "The mount of the Exalted."),
    },
    {
      icon: "inv_misc_token_argentdawn3",
      title: L("Jeton d'ascension", "Ascension Token"),
      text: L("Un rang de qualité de plus.", "One more quality rank."),
    },
  ],
  extras: [
    {
      icon: "inv_scroll_11",
      title: L("Journalières de donjon", "Dungeon dailies"),
      text: L(
        "Les archimages Timear et Lan'dalock reprennent leur service et, dès la phase 1, une quête de raid « … doit mourir ! » change deux fois par semaine.",
        'Archmages Timear and Lan\'dalock are back on duty and, from phase 1, a raid quest "… Must Die!" changes twice a week.',
      ),
    },
    {
      icon: "inv_mace_37",
      title: L(
        "Mortemines et Cœur du Magma revisités",
        "Deadmines and Molten Core revisited",
      ),
      text: L(
        "Reliques à collectionner, le Palefroi gangrené défias, le Cauchemar de braise et une cape légendaire au bout d'une quête du duc Hydraxis.",
        "Relics to collect, the Fel-Touched Defias Palfrey, the Ember Nightmare and a legendary cloak at the end of Duke Hydraxis's quest.",
      ),
    },
    {
      icon: "inv_misc_platnumdisks",
      title: L("Caveau d'Archavon", "Vault of Archavon"),
      text: L(
        "Ouvert en phase 1, un gardien de plus à chaque phase : ils donnent des Éclats du gardien de pierre à la faction qui tient le Joug-d'hiver.",
        "Opens in phase 1, with one more watcher each phase: they give Stone Keeper's Shards to the faction holding Wintergrasp.",
      ),
    },
  ],
  image: IMG.ulduarArchive,
};

/** The heroes (solo with bots, launched on 25/10/2026): who takes the empty seats, the road to the raids, how they play. */
export const heroes = {
  id: "heroes",
  numeral: "X",
  eyebrow: L("Héros", "Heroes"),
  title: L("Jamais sans groupe.", "Never short of a group."),
  lede: L(
    "Pas de groupe sous la main ? **Levez le vôtre.** Les héros prennent chaque place qu'aucun joueur n'occupe, en donjon comme en raid, et jouent comme des joueurs.",
    "No group at hand? **Raise your own.** Heroes take every seat no player fills, in your dungeons and your raids, and play like players.",
  ),
  roadTitle: L("Votre route vers les raids", "Your road to the raids"),
  road: [
    {
      icon: "achievement_dungeon_classicdungeonmaster",
      tip: "text:heroes-starters",
      tag: L("Donjons · tous niveaux", "Dungeons · every level"),
      title: L(
        "Montez de niveau avec quatre héros",
        "Level up with four heroes",
      ),
      text: L(
        "Dès votre tout premier donjon : **un tank, un soigneur et deux autres**, tirés pour vous dans les deux factions. Quel que soit votre rôle, ils complètent votre groupe de cinq.",
        "From your very first dungeon: **a tank, a healer and two more**, drawn for you from both factions. Whatever your role, they complete your group of five.",
      ),
    },
    {
      icon: "inv_inscription_parchmentvar06",
      tip: "item:900100",
      tag: L("Donjons · niveau 80", "Dungeons · level 80"),
      title: L("Écumez les donjons", "Farm the dungeons"),
      text: L(
        "Au niveau 80, chaque boss de donjon laisse des **Fragments de chronique** et de la réputation auprès de l'Ordre des Archivistes.",
        "At level 80, every dungeon boss drops **Chronicle Fragments** and reputation with the Archivist Order.",
      ),
    },
    {
      icon: "inv_misc_book_15",
      tip: "item:902650",
      tag: L("Dalaran", "Dalaran"),
      title: L("Débloquez le Compendium", "Unlock the Compendium"),
      text: L(
        "Les Archivistes de Dalaran le vendent au rang **Révéré** : 50 Fragments de chronique et 500 pièces d'or. Il ouvre la fenêtre des héros, partout.",
        "The Archivists of Dalaran sell it at **Revered**: 50 Chronicle Fragments and 500 gold. It opens the heroes' window, anywhere.",
      ),
    },
    {
      icon: "inv_misc_groupneedmore",
      tip: "spell:107000",
      tag: L("Compendium des héros", "Heroes' Compendium"),
      title: L("Recrutez", "Recruit"),
      text: L(
        "146 héros : chaque couple race et classe, les deux sexes, les deux factions. Lisez la fiche de chacun, puis recrutez ceux que vous voulez : **20, 30, puis 40 fragments**.",
        "146 heroes: every race and class pair, both genders, both factions. Read each one's sheet, then recruit the ones you want: **20, 30, then 40 fragments**.",
      ),
    },
    {
      icon: "achievement_dungeon_naxxramas_10man",
      tip: "text:heroes-raids",
      tag: L("Raids · 10 et 25", "Raids · 10 and 25"),
      title: L("Menez votre raid", "Lead your raid"),
      text: L(
        "Jusqu'à 20 compositions, et la fenêtre vérifie chaque amélioration et affaiblissement de raid. Entrez : **vos héros prennent les places vides**, de Naxxramas au Sanctum rubis.",
        "Up to 20 compositions, and the window checks every raid buff and debuff. Walk in: **your heroes take the empty seats**, from Naxxramas to the Ruby Sanctum.",
      ),
    },
  ],
  musts: {
    title: L(
      "Chaque raid commence en donjon",
      "Every raid starts in the dungeons",
    ),
    text: L(
      "Pas de raccourci : le Compendium et chaque recrue se paient en Fragments de chronique, et c'est en donjon qu'ils tombent. Les vrais joueurs passent toujours en premier : un héros ne prend qu'une place libre.",
      "No shortcut: the Compendium and every recruit are paid in Chronicle Fragments, and the dungeons are where they drop. Real players always come first: a hero only takes a seat nobody holds.",
    ),
  },
  playTitle: L("Ils jouent comme des joueurs", "They play like players"),
  play: [
    {
      icon: "spell_nature_timestop",
      tip: "text:heroes-reflexes",
      title: L("Des réflexes humains", "Human reflexes"),
      text: L(
        "Chacun réagit avec son propre temps de réaction et ses habitudes : deux héros ne jouent jamais pareil.",
        "Each reacts with their own reaction time and habits: no two heroes play alike.",
      ),
    },
    {
      icon: "inv_chest_plate_25",
      tip: "text:heroes-gear",
      title: L("Un équipement qui suit le vôtre", "Gear that follows yours"),
      text: L(
        "Autour du vôtre et de celui de l'instance, comme des joueurs croisés dans la file, jamais au-dessus de ce qu'offre la phase du royaume.",
        "Around yours and the instance's, like players met in the queue, never above what the realm's phase offers.",
      ),
    },
    {
      icon: "spell_nature_bloodlust",
      tip: "spell:2825",
      title: L("La hâte au bon moment", "Haste right on time"),
      text: L(
        "Furie sanguinaire, Héroïsme et Afflux chronique quand les raids les utilisaient, boss par boss ; les améliorations de groupe lancées une fois pour tous.",
        "Bloodlust, Heroism and Chronal Surge when raids used them, boss by boss; group buffs cast once for everyone.",
      ),
    },
    {
      icon: "spell_holy_resurrection",
      tip: "spell:103634",
      title: L("Tous debout", "Back on your feet"),
      text: L(
        "Après un wipe, un soigneur s'éloigne du danger et relève tout le groupe d'un coup.",
        "After a wipe, a healer walks out of danger and raises the whole group at once.",
      ),
    },
    {
      icon: "spell_shadow_auraofdarkness",
      tip: "spell:107010",
      title: L("Désespoir", "Despair"),
      text: L(
        "Laissez-les seuls face à un boss et ils perdent courage : moins de dégâts et de soins, plus de dégâts subis, cumul après cumul.",
        "Leave them alone at a boss and they lose heart: less damage and healing, more damage taken, stack after stack.",
      ),
    },
    {
      icon: "spell_misc_emotionangry",
      tip: "spell:107011",
      title: L("Mécontent", "Discontent"),
      text: L(
        "Laissez-les tout faire et ils deviennent mécontents, de plus en plus vite, jusqu'à ce que vous repreniez votre part.",
        "Let them carry you and they grow discontent, faster and faster, until you pull your weight again.",
      ),
    },
  ],
  image: IMG.coliseum,
};

/** The heroes' tooltips that are no item nor spell (the page writes them: showcase.tsx registerTips). */
export const heroesTips: Record<string, { icon: string; name: T; text: T }> = {
  "text:heroes-starters": {
    icon: "achievement_dungeon_classicdungeonmaster",
    name: L("Vos quatre héros", "Your four heroes"),
    text: L(
      "Un tank, un soigneur et deux autres, de quatre classes différentes, tirés une fois pour chaque personnage. Le tank et le soigneur savent aussi infliger des dégâts : quel que soit votre rôle, la recherche de donjons forme un groupe de cinq.",
      "A tank, a healer and two more, of four different classes, drawn once for each character. The tank and the healer can deal damage too: whatever your role, the Dungeon Finder makes a group of five.",
    ),
  },
  "text:heroes-raids": {
    icon: "achievement_dungeon_naxxramas_10man",
    name: L("Compositions", "Compositions"),
    text: L(
      "Jusqu'à 20 compositions nommées par personnage, plus des compositions équilibrées toutes prêtes ; une en usage pour les donjons, une pour les raids à 10, une pour les raids à 25. Enregistrée dans un raid, ses héros prennent place entre deux pulls.",
      "Up to 20 named compositions per character, plus balanced ready-made ones; one in use for dungeons, one for 10-man raids, one for 25-man raids. Saved inside a raid, its heroes take their seats between two pulls.",
    ),
  },
  "text:heroes-reflexes": {
    icon: "spell_nature_timestop",
    name: L("Des réflexes humains", "Human reflexes"),
    text: L(
      "Chaque héros a son propre temps de réaction, un peu différent à chaque fois : provocations, interruptions, dissipations et soins viennent comme ceux d'un joueur, jamais instantanément.",
      "Every hero has their own reaction time, a little different each time: taunts, interrupts, dispels and heals come like a player's, never instantly.",
    ),
  },
  "text:heroes-gear": {
    icon: "inv_chest_plate_25",
    name: L("Un équipement qui suit le vôtre", "Gear that follows yours"),
    text: L(
      "Tiré à mi-chemin entre votre niveau d'objet moyen et celui de l'instance, jamais au-dessus du meilleur équipement de la phase du royaume. Quand votre équipement change, le leur suit, pièce par pièce.",
      "Drawn around halfway between your average item level and the instance's, never above the best gear of the realm's phase. When your gear changes, theirs follows, piece by piece.",
    ),
  },
};

/** A signature craft of a specialization: its tooltip ref (item or spell), icon and quality (the name's colour). */
export type ProfessionCraft = { ref: string; icon: string; q: number; name: T };
/** A specialization: its passive spell (real icon and in-game tooltip), one line, its signature crafts and, for the
    Weaponsmith, the masteries learned on top of it. Data checked against the Lab (Spell.dbc, lab_world.item_template). */
export type ProfessionSpec = {
  ref?: string;
  icon: string;
  name: T;
  summary: T;
  crafts: ProfessionCraft[];
  masteries?: { ref: string; icon: string; name: T }[];
};
export type Profession = {
  key: string;
  icon: string;
  name: T;
  specs: ProfessionSpec[];
};

export const professions = {
  id: "professions",
  numeral: "XI",
  eyebrow: L("Métiers", "Professions"),
  title: L("Les métiers réinventés.", "Professions reinvented."),
  lede: L(
    "**303 nouvelles recettes** réparties sur les phases et **28 spécialisations**, chacune avec ses **« coups de maître »**. Chaque métier gagne une identité et une raison de compter à chaque palier.",
    "**303 new recipes** spread across the phases and **28 specializations**, each with its own **masterworks**. Every profession gains an identity and a reason to matter at every tier.",
  ),
  list: [
    {
      key: "jc",
      icon: "inv_jewelcrafting_dragonseye02",
      name: L("Joaillerie", "Jewelcrafting"),
      specs: [
        {
          ref: "spell:101800",
          icon: "inv_misc_gem_crystal_01",
          name: L("Lapidaire", "Lapidary"),
          summary: L(
            "Gemmes bonus, métas des Titans, prismatiques, Yeux de dragon bicolores",
            "Extra gems, Titan metas, prismatics and two-coloured Dragon's Eyes",
          ),
          crafts: [
            {
              ref: "item:900621",
              icon: "inv_jewelcrafting_icediamond_02",
              q: 4,
              name: L(
                "Diamant flamme-des-titans chaotique",
                "Chaotic Titanflare Diamond",
              ),
            },
            {
              ref: "item:900632",
              icon: "inv_enchant_shardprismaticlarge",
              q: 4,
              name: L("Éclat d'éternité runique", "Runed Eternity Shard"),
            },
            {
              ref: "item:900711",
              icon: "inv_jewelcrafting_dragonseye02",
              q: 4,
              name: L("Oeil de dragon mortel", "Deadly Dragon's Eye"),
            },
          ],
        },
        {
          ref: "spell:101801",
          icon: "inv_jewelry_ring_03",
          name: L("Orfèvre", "Goldsmith"),
          summary: L(
            "Bijoux d'Ulduar à la Citadelle, figurines, qualité supérieure accrue",
            "Ulduar to Icecrown rings and necks, figurines, more quality upgrades",
          ),
          crafts: [
            {
              ref: "item:80008",
              icon: "inv_jewelry_ring_63",
              q: 4,
              name: L(
                "Anneau de l'arcaniste de Dalaran",
                "Dalaran Arcanist's Ring",
              ),
            },
            {
              ref: "item:80022",
              icon: "ability_mount_drake_proto",
              q: 4,
              name: L(
                "Figurine de proto-drake d'ambre du roi",
                "Figurine - King's Amber Proto-Drake",
              ),
            },
            {
              ref: "item:80031",
              icon: "inv_jewelry_necklace_35",
              q: 4,
              name: L(
                "Chaîne de guerre en titane runique",
                "Runed Titanium Warchain",
              ),
            },
          ],
        },
      ],
    },
    {
      key: "ench",
      icon: "spell_fire_enchantweapon",
      name: L("Enchantement", "Enchanting"),
      specs: [
        {
          ref: "spell:101802",
          icon: "spell_fire_enchantweapon",
          name: L("Enchanteur d'armes", "Weapon Enchanter"),
          summary: L(
            "Effets d'arme exclusifs, parchemins de maître, désenchantement d'armes",
            "Exclusive weapon procs, master scrolls and richer weapon disenchants",
          ),
          crafts: [
            {
              ref: "item:900756",
              icon: "inv_scroll_03",
              q: 3,
              name: L(
                "Parchemin d'enchantement d'arme (Colère de Thorim)",
                "Scroll of Enchant Weapon - Thorim's Wrath",
              ),
            },
            {
              ref: "item:900752",
              icon: "inv_scroll_03",
              q: 3,
              name: L(
                "Parchemin d'enchantement d'arme (Grâce de la Lieuse-de-vie)",
                "Scroll of Enchant Weapon - Life-Binder's Grace",
              ),
            },
            {
              ref: "item:900754",
              icon: "inv_scroll_03",
              q: 3,
              name: L(
                "Parchemin d'enchantement d'arme (Écho du sablier)",
                "Scroll of Enchant Weapon - Hourglass Echo",
              ),
            },
          ],
        },
        {
          ref: "spell:101803",
          icon: "inv_misc_rune_12",
          name: L("Enchanteur d'armures", "Armor Enchanter"),
          summary: L(
            "Enchantements d'armure exclusifs par palier, parchemins de maître",
            "Exclusive armor enchants each tier, master scrolls, armor disenchants",
          ),
          crafts: [
            {
              ref: "item:900758",
              icon: "inv_scroll_03",
              q: 1,
              name: L(
                "Parchemin d'enchantement de bottes (Foulée arcanique)",
                "Scroll of Enchant Boots - Arcane Stride",
              ),
            },
            {
              ref: "item:900785",
              icon: "inv_scroll_03",
              q: 1,
              name: L(
                "Parchemin d'enchantement de plastron (Égide du croisé)",
                "Scroll of Enchant Chest - Crusader's Aegis",
              ),
            },
            {
              ref: "item:900791",
              icon: "inv_scroll_03",
              q: 1,
              name: L(
                "Parchemin d'enchantement de gants (Poigne des cendres)",
                "Scroll of Enchant Gloves - Ashen Grip",
              ),
            },
          ],
        },
      ],
    },
    {
      key: "cook",
      icon: "achievement_profession_chefhat",
      name: L("Cuisine", "Cooking"),
      specs: [
        {
          ref: "spell:101804",
          icon: "inv_misc_food_84_roastclefthoof",
          name: L("Chef de festin", "Master of Feasts"),
          summary: L(
            "Un festin par rôle, festins en plus et festins mémorables de 2 h.",
            "A feast for every role, bonus feasts and memorable 2-hour meals.",
          ),
          crafts: [
            {
              ref: "item:900879",
              icon: "inv_misc_food_126_clammeat",
              q: 1,
              name: L("Grand banquet kalu'ak", "Great Kalu'ak Banquet"),
            },
            {
              ref: "item:900876",
              icon: "inv_misc_food_108_meadcaribou",
              q: 1,
              name: L("Festin des Fils de Hodir", "Feast of the Sons of Hodir"),
            },
            {
              ref: "item:900920",
              icon: "inv_misc_food_110_emperorsalmon",
              q: 1,
              name: L("Festin du sanctum Rubis", "Ruby Sanctum Feast"),
            },
          ],
        },
        {
          ref: "spell:101805",
          icon: "inv_misc_fork&knife",
          name: L("Gourmet", "Gourmet"),
          summary: L(
            "Plats hybrides, jusqu'à 3 plats en plus et plats parfaits de 2 h.",
            "Hybrid dishes, up to 3 bonus dishes and perfect 2-hour meals.",
          ),
          crafts: [
            {
              ref: "item:900887",
              icon: "inv_misc_food_142_fish",
              q: 1,
              name: L(
                "Filet d'aileron-de-dragon à la dalaranaise",
                "Dalaran-Style Dragonfin",
              ),
            },
            {
              ref: "item:900888",
              icon: "inv_misc_food_138_fish",
              q: 1,
              name: L(
                "Méduse aux épices du Nord",
                "Northern-Spiced Nettlefish",
              ),
            },
            {
              ref: "item:900917",
              icon: "inv_misc_food_125_fishchunk",
              q: 1,
              name: L(
                "Esturgeon fumé du Verdict des cendres",
                "Ashen Verdict Smoked Sturgeon",
              ),
            },
          ],
        },
      ],
    },
    {
      key: "bs",
      icon: "inv_sword_153",
      name: L("Forge", "Blacksmithing"),
      specs: [
        {
          ref: "spell:9788",
          icon: "inv_chest_plate04",
          name: L("Fabricant d'armures", "Armorsmith"),
          summary: L(
            "Plaques et boucliers niv. 264 ; qualité supérieure ×1,5 sur la plaque",
            "Ilvl 264 plate and shields; ×1.5 upgrade odds on Northrend plate",
          ),
          crafts: [
            {
              ref: "item:80504",
              icon: "inv_shield_73",
              q: 4,
              name: L("Égide du bastion de saronite", "Saronite Bastion Aegis"),
            },
            {
              ref: "item:80505",
              icon: "inv_shield_67",
              q: 4,
              name: L("Écu de la source de vie", "Lifespring Shield"),
            },
            {
              ref: "item:80500",
              icon: "inv_belt_62",
              q: 4,
              name: L("Ceinturon cendreforgé", "Ashforged Girdle"),
            },
          ],
        },
        {
          ref: "spell:9787",
          icon: "inv_sword_25",
          name: L("Fabricant d'armes", "Weaponsmith"),
          summary: L(
            "Neuf armes niv. 264, une par rôle ; qualité supérieure ×1,5",
            "Nine ilvl 264 weapons, one per role; ×1.5 upgrade odds on weapons",
          ),
          crafts: [
            {
              ref: "item:80506",
              icon: "inv_sword_153",
              q: 4,
              name: L("Espadon cendreforgé", "Ashforged Greatsword"),
            },
            {
              ref: "item:80514",
              icon: "inv_weapon_staff_109",
              q: 4,
              name: L("Guisarme du traqueur des glaces", "Icestalker Guisarme"),
            },
            {
              ref: "item:80510",
              icon: "inv_mace_91",
              q: 4,
              name: L("Masse runique de Thorim", "Thorim's Runed Mace"),
            },
          ],
          masteries: [
            {
              ref: "spell:17039",
              icon: "inv_sword_41",
              name: L("Maître fabricant d'épées", "Master Swordsmith"),
            },
            {
              ref: "spell:17040",
              icon: "inv_hammer_23",
              name: L("Maître fabricant de marteaux", "Master Hammersmith"),
            },
            {
              ref: "spell:17041",
              icon: "inv_axe_05",
              name: L("Maître fabricant de haches", "Master Axesmith"),
            },
          ],
        },
      ],
    },
    {
      key: "lw",
      icon: "inv_misc_drum_05",
      name: L("Travail du cuir", "Leatherworking"),
      specs: [
        {
          ref: "spell:10656",
          icon: "inv_misc_monsterscales_03",
          name: L(
            "Travail du cuir d'écailles de dragon",
            "Dragonscale Leatherworking",
          ),
          summary: L(
            "Mailles niv. 264 agilité et sorts ; qualité supérieure ×1,5",
            "Ilvl 264 agility and spell mail; ×1.5 upgrade odds on Northrend mail",
          ),
          crafts: [
            {
              ref: "item:80700",
              icon: "inv_belt_47a",
              q: 4,
              name: L("Sangle du traqueur des glaces", "Icestalker Waistguard"),
            },
            {
              ref: "item:80702",
              icon: "inv_belt_83",
              q: 4,
              name: L(
                "Sangle de la tempête de Thorim",
                "Thorim's Tempest Waistguard",
              ),
            },
            {
              ref: "item:80732",
              icon: "inv_bracer_29",
              q: 4,
              name: L(
                "Garde-poignets en écailles de wyrm de givre",
                "Frostwyrm Scale Wristguards",
              ),
            },
          ],
        },
        {
          ref: "spell:10658",
          icon: "spell_fire_volcano",
          name: L("Travail du cuir élémentaire", "Elemental Leatherworking"),
          summary: L(
            "Cuir niv. 264 agilité et ours ; qualité supérieure ×1,5 sur ce cuir",
            "Ilvl 264 agility and bear leather; ×1.5 upgrade odds on that leather",
          ),
          crafts: [
            {
              ref: "item:80704",
              icon: "inv_belt_15",
              q: 4,
              name: L("Ceinture du traqueur des glaces", "Icestalker Belt"),
            },
            {
              ref: "item:80706",
              icon: "inv_belt_42",
              q: 4,
              name: L("Ceinture de l'ours du givre", "Frostbear Belt"),
            },
            {
              ref: "item:80733",
              icon: "inv_bracer_22b",
              q: 4,
              name: L("Protège-bras en peau d'orage", "Stormhide Armwraps"),
            },
          ],
        },
        {
          ref: "spell:10660",
          icon: "spell_nature_nullward",
          name: L("Travail du cuir tribal", "Tribal Leatherworking"),
          summary: L(
            "Tambours de l'esprit taunka et cuir niv. 264 de lanceur et soigneur",
            "Drums of the Taunka Spirit and ilvl 264 caster and healer leather",
          ),
          crafts: [
            {
              ref: "item:901240",
              icon: "inv_misc_drum_05",
              q: 1,
              name: L(
                "Tambours de l'esprit taunka",
                "Drums of the Taunka Spirit",
              ),
            },
            {
              ref: "item:80708",
              icon: "inv_belt_59",
              q: 4,
              name: L(
                "Ceinture du sage de Vordrassil",
                "Vordrassil Sage's Belt",
              ),
            },
            {
              ref: "item:80710",
              icon: "inv_bracer_30b",
              q: 4,
              name: L(
                "Protège-bras de la source de vie",
                "Lifespring Armwraps",
              ),
            },
          ],
        },
      ],
    },
    {
      key: "tail",
      icon: "inv_fabric_moonrag_primal",
      name: L("Couture", "Tailoring"),
      specs: [
        {
          ref: "spell:26798",
          icon: "inv_fabric_moonrag_01",
          name: L("Couture d'étoffe lunaire", "Mooncloth Tailoring"),
          summary: L(
            "Ceinture et manchettes 264 de soigneur ; qualité supérieure ×1,5",
            "Ilvl 264 healer belt and cuffs; ×1.5 upgrade odds on healer cloth",
          ),
          crafts: [
            {
              ref: "item:80900",
              icon: "inv_belt_68",
              q: 4,
              name: L(
                "Ceinture de la Lumière persistante",
                "Belt of the Abiding Light",
              ),
            },
            {
              ref: "item:80901",
              icon: "inv_bracer_47",
              q: 4,
              name: L(
                "Manchettes de la Lumière persistante",
                "Cuffs of the Abiding Light",
              ),
            },
            {
              ref: "item:80904",
              icon: "inv_bracer_27",
              q: 4,
              name: L("Manchettes clair-de-lune", "Moonlit Cuffs"),
            },
          ],
        },
        {
          ref: "spell:26797",
          icon: "spell_holy_blessingofprotection",
          name: L("Couture du feu-sorcier", "Spellfire Tailoring"),
          summary: L(
            "Ceinture et brassards 264 de lanceur ; qualité supérieure ×1,5",
            "Ilvl 264 caster belt and bracers; ×1.5 upgrade odds on caster cloth",
          ),
          crafts: [
            {
              ref: "item:80902",
              icon: "inv_belt_64",
              q: 4,
              name: L("Ceinture du sort tissé", "Spellwoven Cord"),
            },
            {
              ref: "item:80903",
              icon: "inv_bracer_44",
              q: 4,
              name: L("Brassards du sort tissé", "Spellwoven Bindings"),
            },
            {
              ref: "item:80905",
              icon: "inv_bracer_25a",
              q: 4,
              name: L(
                "Protège-poignets de feu-sorcier",
                "Spellfire Wristwraps",
              ),
            },
          ],
        },
        {
          ref: "spell:26801",
          icon: "inv_fabric_felrag",
          name: L("Couture de tisse-ombre", "Shadoweave Tailoring"),
          summary: L(
            "Une pièce JcJ en tisse-ébène par saison d'arène, jusqu'au niv. 264",
            "An ebonweave PvP piece every arena season, up to ilvl 264",
          ),
          crafts: [
            {
              ref: "item:80915",
              icon: "inv_belt_70",
              q: 4,
              name: L(
                "Cordelière en tisse-ébène du maître de guerre",
                "Warmaster's Ebonweave Cord",
              ),
            },
            {
              ref: "item:80912",
              icon: "inv_boots_cloth_23",
              q: 4,
              name: L(
                "Bottes en tisse-ébène du gladiateur",
                "Gladiator's Ebonweave Boots",
              ),
            },
            {
              ref: "item:80913",
              icon: "inv_bracer_37",
              q: 4,
              name: L(
                "Manchettes en tisse-ébène du challengeur",
                "Challenger's Ebonweave Cuffs",
              ),
            },
          ],
        },
      ],
    },
    {
      key: "eng",
      icon: "inv_misc_enggizmos_28",
      name: L("Ingénierie", "Engineering"),
      specs: [
        {
          ref: "spell:20219",
          icon: "inv_gizmo_02",
          name: L("Ingénieur gnome", "Gnomish Engineer"),
          summary: L(
            "Transporteur d'Ulduar, déflecteur ; qualité supérieure ×1,5 (lunettes)",
            "Ulduar transporter, party deflector, ×1.5 upgrade odds on goggles",
          ),
          crafts: [
            {
              ref: "item:901440",
              icon: "inv_misc_enggizmos_12",
              q: 3,
              name: L(
                "Transporteur ultra-sécurisé : Ulduar",
                "Ultrasafe Transporter: Ulduar",
              ),
            },
            {
              ref: "item:901450",
              icon: "inv_misc_enggizmos_28",
              q: 4,
              name: L("Déflecteur de champ gnome", "Gnomish Field Deflector"),
            },
          ],
        },
        {
          ref: "spell:20222",
          icon: "spell_fire_selfdestruct",
          name: L("Ingénieur gobelin", "Goblin Engineer"),
          summary: L(
            "Déchiqueteurs K3 et de poche ; +15 % de munitions et d'explosifs",
            "K3 dimensional ripper, pocket shredder, 15% more ammo and explosives",
          ),
          crafts: [
            {
              ref: "item:901441",
              icon: "inv_misc_enggizmos_07",
              q: 3,
              name: L(
                "Déchiqueteur dimensionnel - K3",
                "Dimensional Ripper - K3",
              ),
            },
            {
              ref: "item:901451",
              icon: "inv_misc_sawblade_01",
              q: 4,
              name: L(
                "Déchiqueteur de poche gobelin",
                "Goblin Pocket Shredder",
              ),
            },
          ],
        },
      ],
    },
    {
      key: "alch",
      icon: "inv_alchemy_endlessflask_05",
      name: L("Alchimie", "Alchemy"),
      specs: [
        {
          ref: "spell:28677",
          icon: "inv_relics_totemoflife",
          name: L("Maître des élixirs", "Elixir Master"),
          summary: L(
            "Élixirs et flacons en plus, et des flacons de maître à chaque palier",
            "Extra elixirs and flasks, plus master-only flasks at every tier",
          ),
          crafts: [
            {
              ref: "item:901502",
              icon: "inv_alchemy_endlessflask_01",
              q: 1,
              name: L(
                "Flacon du cœur de Vordrassil",
                "Flask of Vordrassil's Heart",
              ),
            },
            {
              ref: "item:901520",
              icon: "inv_potion_150",
              q: 1,
              name: L("Flacon de l'aurore", "Flask of the Aurora"),
            },
            {
              ref: "item:901529",
              icon: "inv_potion_146",
              q: 1,
              name: L("Flacon du Colisée", "Flask of the Coliseum"),
            },
          ],
        },
        {
          ref: "spell:28675",
          icon: "inv_relics_totemoflife",
          name: L("Maître des potions", "Potion Master"),
          summary: L(
            "Potions en plus, potions infinies jamais consommées, purification",
            "Extra potions, endless potions never consumed, purification",
          ),
          crafts: [
            {
              ref: "item:901504",
              icon: "inv_alchemy_endlessflask_05",
              q: 3,
              name: L("Potion de hâte infinie", "Endless Haste Potion"),
            },
            {
              ref: "item:901507",
              icon: "inv_potion_149",
              q: 1,
              name: L(
                "Potion de purification de Norfendre",
                "Northrend Purification Potion",
              ),
            },
            {
              ref: "item:901519",
              icon: "inv_alchemy_potion_04",
              q: 3,
              name: L(
                "Potion de protection contre le Givre infinie",
                "Endless Frost Protection Potion",
              ),
            },
          ],
        },
        {
          ref: "spell:28672",
          icon: "inv_relics_totemoflife",
          name: L("Maître des transmutations", "Transmutation Master"),
          summary: L(
            "Transmutations en plus et inédites, pierres plus souvent supérieures",
            "Extra transmutes, new transmutations, stones more likely to upgrade",
          ),
          crafts: [
            {
              ref: "item:81408",
              icon: "spell_holy_aspiration",
              q: 4,
              name: L(
                "Pierre d'alchimiste primordiale de l'arcaniste",
                "Primordial Arcanist Alchemist Stone",
              ),
            },
            {
              ref: "item:900503",
              icon: "inv_enchant_shardprismaticlarge",
              q: 3,
              name: L(
                "Éclat prismatique de Norfendre",
                "Northrend Prismatic Shard",
              ),
            },
            {
              ref: "item:43102",
              icon: "spell_frost_frozencore",
              q: 3,
              name: L("Orbe gelé", "Frozen Orb"),
            },
          ],
        },
      ],
    },
    {
      key: "insc",
      icon: "inv_inscription_majorglyph00",
      name: L("Calligraphie", "Inscription"),
      specs: [
        {
          ref: "spell:101806",
          icon: "inv_inscription_majorglyph00",
          name: L("Glyphiste", "Glyphist"),
          summary: L(
            "Glyphes en plus, seconde recherche du jour, calligraphies du maître",
            "Extra glyphs, a second daily research, master's shoulder inscriptions",
          ),
          crafts: [
            {
              ref: "spell:103011",
              icon: "inv_inscription_tradeskill01",
              q: 1,
              name: L(
                "Calligraphie de triomphe du maître",
                "Master's Inscription of Triumph",
              ),
            },
            {
              ref: "spell:103014",
              icon: "inv_inscription_tradeskill01",
              q: 1,
              name: L(
                "Calligraphie des étoiles du maître",
                "Master's Inscription of the Stars",
              ),
            },
            {
              ref: "spell:103016",
              icon: "inv_inscription_tradeskill01",
              q: 1,
              name: L(
                "Calligraphie du Verdict du maître",
                "Master's Inscription of the Verdict",
              ),
            },
          ],
        },
        {
          ref: "spell:101807",
          icon: "inv_misc_book_11",
          name: L("Scribe des arcanes", "Arcane Scribe"),
          summary: L(
            "Ouvrages de raid, seconde carte de Sombrelune et Tirages du scribe",
            "Raid-tier tomes, a second Darkmoon card and the Scribe's Draws",
          ),
          crafts: [
            {
              ref: "item:81304",
              icon: "inv_misc_book_02",
              q: 4,
              name: L(
                "Traité du Fléau déchiffré",
                "Deciphered Scourge Treatise",
              ),
            },
            {
              ref: "item:81306",
              icon: "inv_misc_book_07",
              q: 4,
              name: L("Folio des Gardiens", "Folio of the Keepers"),
            },
            {
              ref: "item:81302",
              icon: "inv_misc_book_06",
              q: 4,
              name: L(
                "Codex du gladiateur calligraphié",
                "Inscribed Gladiator's Codex",
              ),
            },
          ],
        },
      ],
    },
    {
      key: "dmf",
      icon: "inv_misc_ticket_tarot_storms",
      name: L("Cartes de Sombrelune", "Darkmoon Cards"),
      specs: [
        {
          icon: "inv_misc_ticket_tarot_storms",
          name: L("Une carte par palier de raid", "One card per raid tier"),
          summary: L(
            "Une carte par palier de raid : quatre suites de rôle et leurs bijoux",
            "A new card each raid tier: four role decks and their trinkets",
          ),
          crafts: [
            {
              ref: "item:81503",
              icon: "inv_misc_ticket_tarot_madness",
              q: 4,
              name: L(
                "Carte de Sombrelune : Salve (Force)",
                "Darkmoon Card: Barrage (Strength)",
              ),
            },
            {
              ref: "item:81507",
              icon: "inv_misc_ticket_tarot_vengeance",
              q: 4,
              name: L("Carte de Sombrelune : Lien", "Darkmoon Card: Kinship"),
            },
            {
              ref: "item:81510",
              icon: "inv_misc_ticket_tarot_furies",
              q: 4,
              name: L(
                "Carte de Sombrelune : Esquilles",
                "Darkmoon Card: Splinters",
              ),
            },
            {
              ref: "item:81516",
              icon: "inv_misc_ticket_tarot_heroism_01",
              q: 4,
              name: L(
                "Carte de Sombrelune : Sanctuaire",
                "Darkmoon Card: Sanctuary",
              ),
            },
          ],
        },
      ],
    },
    {
      key: "fa",
      icon: "inv_misc_bandage_frostweave_heavy",
      name: L("Secourisme", "First Aid"),
      specs: [
        {
          ref: "spell:101808",
          icon: "inv_misc_bandage_frostweave_heavy",
          name: L("Chirurgien de campagne", "Field Surgeon"),
          summary: L(
            "Vos bandages de la Croisade d'argent soignent 20 % de plus.",
            "Your Argent Crusade bandages heal 20% more.",
          ),
          crafts: [
            {
              ref: "item:901903",
              icon: "inv_misc_bandage_20",
              q: 1,
              name: L(
                "Bandage cendré en tisse-givre",
                "Ashen Frostweave Bandage",
              ),
            },
            {
              ref: "item:901900",
              icon: "inv_fabric_purple_02",
              q: 1,
              name: L(
                "Bandage dense en tisse-givre",
                "Dense Frostweave Bandage",
              ),
            },
            {
              ref: "item:901902",
              icon: "inv_misc_bandage_19",
              q: 1,
              name: L(
                "Bandage de croisé en tisse-givre",
                "Crusader's Frostweave Bandage",
              ),
            },
          ],
        },
        {
          ref: "spell:101809",
          icon: "inv_potion_19",
          name: L("Apothicaire de campagne", "Field Apothecary"),
          summary: L(
            "Les trousses de terrain se rechargent en 1 min au lieu de 2.",
            "Your field kits' shared cooldown drops from 2 min to 1 min.",
          ),
          crafts: [
            {
              ref: "item:901922",
              icon: "inv_misc_bandage_16",
              q: 1,
              name: L("Garrot de campagne", "Tourniquet"),
            },
            {
              ref: "item:901921",
              icon: "inv_potion_27",
              q: 1,
              name: L("Sérum de la Croisade", "Crusade Serum"),
            },
            {
              ref: "item:901920",
              icon: "inv_potion_19",
              q: 1,
              name: L("Antivenin d'Azjol", "Azjol Antivenom"),
            },
          ],
        },
      ],
    },
    {
      key: "fish",
      icon: "trade_fishing",
      name: L("Pêche", "Fishing"),
      specs: [
        {
          ref: "spell:101810",
          icon: "inv_box_04",
          name: L("Chasseur d'épaves", "Wreck Hunter"),
          summary: L(
            "Coffres engloutis doublés, moitié plus de trouvailles bleues.",
            "Twice the sunken coffers and 50% more blue finds in Northrend waters.",
          ),
          crafts: [
            {
              ref: "item:900950",
              icon: "inv_box_02",
              q: 2,
              name: L(
                "Coffre englouti du Norfendre",
                "Sunken Northrend Coffer",
              ),
            },
            {
              ref: "item:80141",
              icon: "inv_helmet_30",
              q: 3,
              name: L("Tricorne du capitaine", "Captain's Tricorne"),
            },
            {
              ref: "item:80116",
              icon: "inv_weapon_hand_10",
              q: 3,
              name: L("Serres de Gundrak", "Gundrak Talons"),
            },
          ],
        },
        {
          ref: "spell:101811",
          icon: "inv_misc_fish_35",
          name: L("Maître des eaux du Norfendre", "Master of Northrend Waters"),
          summary: L(
            "Poissons rares doublés, moitié plus de poissons légendaires.",
            "Twice the rare fish of each zone and 50% more legendary fish.",
          ),
          crafts: [
            {
              ref: "item:900962",
              icon: "inv_misc_fish_44",
              q: 4,
              name: L("Béhémoth des glaces", "Ice Behemoth"),
            },
            {
              ref: "item:900963",
              icon: "ability_hunter_pet_netherray",
              q: 4,
              name: L(
                "Rênes de la raie des abysses",
                "Reins of the Abyssal Ray",
              ),
            },
            {
              ref: "item:900540",
              icon: "inv_misc_fish_53",
              q: 2,
              name: L("Thon des abysses", "Abyssal Tuna"),
            },
          ],
        },
      ],
    },
  ] as Profession[],
  masteries: L("Maîtrises", "Masteries"),
  specsCount: L("spécialisations", "specializations"),
};

export const fishing = {
  id: "fishing",
  numeral: "XII",
  eyebrow: L("Pêche et récolte", "Fishing and gathering"),
  title: L(
    "Chaque ligne lancée peut changer une vie.",
    "Every cast can change a life.",
  ),
  lede: L(
    "**Onze zones de pêche**, chacune avec son poisson rare, ses trouvailles, son épique par phase… et **un poisson légendaire**. Des filons et des fleurs rares, des trophées de bêtes, des commandes des Archives.",
    "**Eleven fishing zones**, each with its rare fish, its finds, an epic per phase… and **a legendary fish**. Rare veins and flowers, beast trophies, Archive orders.",
  ),
  cards: [
    {
      icon: "inv_misc_fish_35",
      title: L("Poissons légendaires", "Legendary fish"),
      text: L(
        "« Vieille Nageoire-de-givre », « Léviathan des eaux mortes »… À échanger contre des bijoux chez Marcia Chase.",
        '"Old Frostfin", "Deadwater Leviathan"… Trade them for trinkets with Marcia Chase.',
      ),
    },
    {
      icon: "achievement_profession_fishing_northrendangler",
      title: L("130 équipements pêchés", "130 fished pieces of gear"),
      text: L(
        "Dont **97 épiques**, et **55 avec un effet en jeu** : Harpon kalu'ak, Harpon de saronite, Crue drakkari…",
        "Including **97 epics**, **55 with an in-game effect**: Kalu'ak Harpoon, Saronite Harpoon, Drakkari Flood…",
      ),
    },
    {
      icon: "ability_hunter_pet_netherray",
      title: L("La Raie des abysses", "The Abyssal Ray"),
      text: L(
        "Une monture rarissime qui sort de l'eau, et une canne du Kirin Tor à +50 en pêche.",
        "A very rare mount that rises from the water, and a Kirin Tor rod at +50 fishing.",
      ),
    },
    {
      icon: "inv_ingot_yoggthorite",
      title: L("Filons et fleurs rares", "Rare veins and flowers"),
      text: L(
        "Veine de saronite murmurante, Fleur des Gardiens, Rose des aurores… et un nœud de chaque au Joug-d'hiver, à disputer.",
        "Whispering Saronite Vein, Keepers' Bloom, Aurora Rose… and one of each in Wintergrasp, to fight over.",
      ),
    },
  ],
  image: IMG.tuskarr,
};

export const treasures = {
  id: "treasures",
  numeral: "XIII",
  eyebrow: L("Trésors", "Treasures"),
  title: L("Le Norfendre cache ses secrets.", "Northrend hides its secrets."),
  lede: L(
    "Des caches d'expédition, des coffres scellés et **dix cartes au trésor à énigme**. Déchiffrez l'énigme, trouvez le lieu, creusez… et peut-être, une monture.",
    "Expedition caches, sealed chests and **ten riddle treasure maps**. Solve the riddle, find the place, dig… and maybe, a mount.",
  ),
  steps: [
    {
      icon: "inv_misc_map02",
      title: L("La carte", "The map"),
      text: L(
        "Une énigme sur un lieu du Norfendre : Repos de Galakrond, Fin de Thrym…",
        "A riddle about a place in Northrend: Galakrond's Rest, Thrym's End…",
      ),
    },
    {
      icon: "inv_misc_shovel_01",
      title: L("La fouille", "The dig"),
      text: L(
        "Sur place, on creuse. Ailleurs, la carte vous montre où aller.",
        "On site, you dig. Elsewhere, the map shows you where to go.",
      ),
    },
    {
      icon: "inv_misc_ornatebox",
      title: L("Le Grand coffre enfoui", "The Buried Coffer"),
      text: L(
        "Or, fragments, une bourse, de la camelote de prix… et **une monture par phase**.",
        "Gold, fragments, a purse, valuable trinkets… and **one mount per phase**.",
      ),
    },
  ],
  mounts: [
    L("Kodo des caravanes", "Caravan Kodo"),
    L("Destrier de la mort", "Deathcharger"),
    L("Trotteur des fouilles bleu", "Blue Excavation Strider"),
    L("Griffon de Falstad", "Falstad's Gryphon"),
    L("Wyrm de givre de la Couronne", "Icecrown Frost Wyrm"),
    L("Drake crépusculaire rubis", "Ruby Twilight Drake"),
  ],
  mountsTitle: L("Une monture par phase", "One mount per phase"),
  image: IMG.fjordVillage,
};

export const collections = {
  id: "collections",
  numeral: "XIV",
  eyebrow: L("Collections", "Collections"),
  title: L(
    "Des montures que personne n'a jamais montées.",
    "Mounts no one has ever ridden.",
  ),
  lede: L(
    "Mei Francis, à Dalaran, propose **34 montures** tirées de modèles **jamais montés par des joueurs**, avec leurs vrais cris. Et ce n'est qu'un début.",
    "Mei Francis, in Dalaran, offers **34 mounts** drawn from models **no player has ever ridden**, with their real calls. And that's just the beginning.",
  ),
  stats: [
    { value: 64, label: L("montures", "mounts") },
    { value: 14, label: L("mascottes", "pets") },
    { value: 6, label: L("jouets", "toys") },
    { value: 18, label: L("tabards", "tabards") },
  ],
  marquee: [
    "ability_mount_spectraltiger",
    "ability_mount_netherdrakeelite",
    "ability_mount_drake_twilight",
    "ability_mount_warhippogryph",
    "ability_mount_kodo_02",
    "ability_mount_gyrocoptor",
    "ability_mount_mechastrider",
    "ability_mount_gryphon_01",
    "ability_mount_redfrostwyrm_01",
    "ability_hunter_pet_netherray",
    "ability_mount_nightmarehorse",
    "inv_misc_qirajicrystal_04",
  ],
  marquee2: [
    "inv_misc_horn_02",
    "inv_mask_03",
    "inv_ammo_snowball",
    "inv_misc_bag_10",
    "inv_misc_head_gnome_01",
    "inv_misc_head_kobold_01",
    "inv_misc_head_dragon_blue",
    "inv_ore_saronite_01",
    "inv_misc_tabardsummer01",
    "inv_misc_ticket_darkmoon_01",
    "inv_misc_note_04",
    "inv_misc_horn_03",
  ],
  highlights: [
    {
      icon: "inv_misc_horn_02",
      title: L("Le Cornet acoustique", "The Ear Trumpet"),
      text: L(
        "Pointez-le vers un garde, un aubergiste, un Archiviste… **huit sortes de PNJ** vous répondent.",
        "Point it at a guard, an innkeeper, an Archivist… **eight kinds of NPCs** answer you.",
      ),
    },
    {
      icon: "inv_mask_03",
      title: L("Le Masque des Chroniques", "The Mask of the Chronicles"),
      text: L(
        "Devenez rohart, taunka, terrestre, vrykul ou gnome de Dalaran.",
        "Become a tuskarr, taunka, earthen, vrykul or Dalaran gnome.",
      ),
    },
    {
      icon: "inv_misc_tabardsummer01",
      title: L("Tabards des royaumes perdus", "Tabards of lost kingdoms"),
      text: L(
        "Stromgarde, Kul Tiras, Theramore, Royaume de Dalaran, Tranquillien…",
        "Stromgarde, Kul Tiras, Theramore, Kingdom of Dalaran, Tranquillien…",
      ),
    },
  ],
  image: IMG.frostWyrm,
};

export const economy = {
  id: "economy",
  numeral: "XV",
  eyebrow: L("Les bas-fonds de Dalaran", "Dalaran's underbelly"),
  title: L("Une économie qui vit.", "An economy that lives."),
  lede: L(
    "Sous la cité des mages, on vend, on parie, on rachète. Le marché noir, la loterie du cartel, les dés gobelins et l'antiquaire font circuler l'or autrement.",
    "Beneath the city of mages, people sell, gamble and buy back. The black market, the cartel's lottery, goblin dice and the antiquarian move gold in new ways.",
  ),
  cards: [
    {
      icon: "inv_crate_04",
      title: L("Le marché noir", "The black market"),
      tag: L("Zar'haam, du Consortium", "Zar'haam, of the Consortium"),
      text: L(
        "Gagnez la confiance de l'éthérien, puis découvrez sa vitrine **deux fois par semaine** : montures uniques, apparences légendaires (Sulfuras, Thori'dal, les Glaives d'Azzinoth) et, une livraison sur quatre, **Atiesh, le Porte-cendres ou Deuillegivre**.",
        "Earn the ethereal's trust, then browse his showcase **twice a week**: unique mounts, legendary appearances (Sulfuras, Thori'dal, the Warglaives of Azzinoth) and, one delivery in four, **Atiesh, the Ashbringer or Frostmourne**.",
      ),
    },
    {
      icon: "inv_misc_ticket_darkmoon_01",
      title: L("La loterie de Gentepression", "The Steamwheedle lottery"),
      tag: L("Lixxa Pochechance", "Lixxa Luckpocket"),
      text: L(
        "Une grande loterie tirée à chaque remise à zéro des raids, et des billets à gratter qui peuvent rapporter **1 000 pièces d'or… ou le Gnome** porte-bonheur.",
        "A grand lottery drawn at every raid reset, and scratch tickets that can pay **1,000 gold… or the Lucky Gnome**.",
      ),
    },
    {
      icon: "inv_misc_dice_01",
      title: L("Les dés gobelins", "Goblin dice"),
      tag: L("Grizzle Double-Six", "Grizzle Doublesix"),
      text: L(
        "Défiez un autre joueur à la table, **de 10 à 1 000 pièces d'or**. Deux dés chacun, le plus gros total rafle le pot.",
        "Challenge another player at the table, **from 10 to 1,000 gold**. Two dice each, the highest total takes the pot.",
      ),
    },
    {
      icon: "inv_misc_gem_pearl_04",
      title: L("L'antiquaire", "The antiquarian"),
      tag: L("Brodric Barbepoussière", "Brodric Dustbeard"),
      text: L(
        "La camelote du Norfendre vaut de l'or : couronnes vrykules, idoles nérubiennes, trophées de bêtes rares. Chaque semaine, trois pièces recherchées valent **50 % de plus**.",
        "Northrend's junk is worth gold: vrykul crowns, nerubian idols, rare beast trophies. Each week, three sought-after pieces are worth **50% more**.",
      ),
    },
  ],
  image: IMG.dalaranNight,
};

export const quiz = {
  id: "quiz",
  numeral: "XVI",
  eyebrow: L("Le quiz du Kirin Tor", "The Kirin Tor quiz"),
  title: L("Connaissez-vous vraiment Azeroth ?", "Do you really know Azeroth?"),
  lede: L(
    "Chaque jour, l'examinatrice Elaria Murmeplume vous pose **cinq questions de lore**, de la plus facile à celle réservée aux érudits. Une bonne réponse rapporte des Fragments de chronique ; une erreur vous apprend la bonne.",
    "Every day, examiner Elaria Quillwhisper asks you **five lore questions**, from the easiest to one for true scholars. A right answer earns Chronicle Fragments; a wrong one teaches you the truth.",
  ),
  sample: {
    question: L(
      "Dans quelle zone se dresse le Temple du Repos du ver ?",
      "In which zone does Wyrmrest Temple stand?",
    ),
    answers: [
      L("Désolation des dragons", "Dragonblight"),
      L("La Couronne de glace", "Icecrown"),
      L("Les Grisonnes", "Grizzly Hills"),
      L("Forêt du Chant de cristal", "Crystalsong Forest"),
    ],
    right: 0,
  },
  stats: [
    { value: 297, label: L("questions", "questions") },
    { value: 6, label: L("thèmes", "themes") },
    { value: 5, label: L("langues", "languages") },
  ],
  image: IMG.dalaranDay,
};

export const transmog = {
  id: "transmog",
  numeral: "XVII",
  eyebrow: L("Transmogrification", "Transmogrification"),
  title: L("16 302 façons d'être unique.", "16,302 ways to stand out."),
  lede: L(
    "Une boutique d'apparences payée en Fragments de chronique, dont **plus de 7 000 modèles de PNJ** jamais portés par des joueurs. Et **45 effets d'enchantement d'arme** au choix.",
    "An appearance shop paid in Chronicle Fragments, with **more than 7,000 NPC models** no player has ever worn. And **45 weapon enchant effects** to choose from.",
  ),
  categories: [
    L("Donjons", "Dungeons"),
    L("Raids", "Raids"),
    L("Quêtes", "Quests"),
    L("Artisanat", "Crafting"),
    L("Marchands", "Vendors"),
    L("Monde", "World"),
    L("Champs de bataille", "Battlegrounds"),
    L("Arène", "Arena"),
    L("Modèles inédits", "Unseen models"),
  ],
  image: IMG.priestess,
};

export const pvp = {
  id: "pvp",
  numeral: "XVIII",
  eyebrow: L("JcJ", "PvP"),
  title: L("Chaque phase, une campagne.", "Every phase, a campaign."),
  lede: L(
    "De « Front du Norfendre » aux « Défenseurs du sanctum Rubis », chaque phase est une campagne JcJ avec son contrat hebdomadaire, son classement et ses récompenses exclusives.",
    'From "Northrend Front" to "Defenders of the Ruby Sanctum", every phase is a PvP campaign with its weekly contract, its ranking and its exclusive rewards.',
  ),
  cards: [
    {
      icon: "achievement_pvp_a_12",
      title: L("Campagnes et classements", "Campaigns and rankings"),
      text: L(
        "Les 10 meilleurs de chaque faction deviennent **Maréchal ou Seigneur de guerre de campagne**.",
        "The top 10 of each faction become **Campaign Marshal or Warlord**.",
      ),
    },
    {
      icon: "inv_misc_coin_17",
      title: L("Récompenses exclusives", "Exclusive rewards"),
      text: L(
        "**12 montures de campagne**, des mascottes et **1 107 répliques** des équipements des saisons d'arène 1 à 8.",
        "**12 campaign mounts**, pets and **1,107 replicas** of arena seasons 1 to 8 gear.",
      ),
    },
    {
      icon: "ability_dualwield",
      title: L("Le tournoi des égouts", "The Sewer Tournament"),
      text: L(
        "**Deux fois par semaine, à 19 h** : duels à élimination directe dans les égouts de Dalaran. Gladiateur, Duelliste, Rival.",
        "**Twice a week, at 7 PM**: knockout duels in Dalaran's sewers. Gladiator, Duelist, Rival.",
      ),
    },
    {
      icon: "achievement_bg_masterofallbgs",
      title: L("Un JcJ fidèle et réparé", "Faithful, fixed PvP"),
      text: L(
        "Champs de bataille corrigés, arènes mixtes Alliance/Horde, un Joug-d'hiver qui passe tout entier aux couleurs du vainqueur.",
        "Fixed battlegrounds, mixed Alliance/Horde arenas, a Wintergrasp that turns entirely to the victor's colors.",
      ),
    },
  ],
  image: IMG.champions,
};

export const guilds = {
  id: "guilds",
  numeral: "XIX",
  eyebrow: L("Guildes", "Guilds"),
  title: L("Votre guilde grandit avec vous.", "Your guild grows with you."),
  lede: L(
    "Donjons, raids, boss du monde, JcJ, quêtes : en groupe de guilde, tout fait monter votre guilde **du niveau 1 au niveau 10**, et chaque niveau débloque un avantage pour tous.",
    "Dungeons, raids, world bosses, PvP, quests: in a guild group, everything raises your guild **from level 1 to 10**, and every level unlocks a perk for everyone.",
  ),
  perks: [
    {
      lvl: "1",
      icon: "inv_misc_coin_17",
      text: L(
        "Trésor de guerre : une part de l'or ramassé pour la banque",
        "War Chest: a share of looted gold for the bank",
      ),
    },
    {
      lvl: "2",
      icon: "ability_mount_ridinghorse",
      text: L("+10 % de vitesse en monture", "+10% mount speed"),
    },
    {
      lvl: "3",
      icon: "achievement_reputation_01",
      text: L(
        "Réputation et expérience en plus",
        "Bonus reputation and experience",
      ),
    },
    {
      lvl: "4",
      icon: "inv_misc_rune_01",
      text: L(
        "Pierre de foyer plus rapide et honneur en plus",
        "Faster hearthstone and bonus honor",
      ),
    },
    {
      lvl: "5",
      icon: "inv_letter_15",
      text: L("Courrier instantané", "Instant mail"),
    },
    {
      lvl: "6",
      icon: "spell_holy_guardianspirit",
      text: L(
        "Souffle de vie : revenir à la vie avec toute sa vie",
        "Second Breath: come back with full health",
      ),
    },
    {
      lvl: "8",
      icon: "inv_alchemy_endlessflask_06",
      text: L(
        "Élixirs et flacons +50 % de durée",
        "Elixirs and flasks last 50% longer",
      ),
    },
    {
      lvl: "9",
      icon: "spell_shadow_twilight",
      text: L("Rassemblement de la guilde", "Guild Rally"),
    },
    {
      lvl: "10",
      icon: "spell_holy_prayerofspirit",
      text: L("Résurrection collective", "Mass Resurrection"),
    },
  ],
  extra: L(
    "16 hauts faits de guilde versent **plus de 21 000 pièces d'or** à la banque. Étendards et chaudrons chez l'intendant de guilde.",
    "16 guild achievements pay **more than 21,000 gold** to the bank. Banners and cauldrons from the guild quartermaster.",
  ),
  image: IMG.icecrownGate,
};

/** A character challenge (Vesperine Gravewhisper, contrib/wotlk-plus content/challenges.js): its icon, stars, rules and reward. */
export type Challenge = {
  ref: string;
  icon: string;
  stars: number;
  name: T;
  rule: T;
  reward: T;
  tier: "aura" | "title" | "legend";
};

export const challenges = {
  id: "challenges",
  numeral: "XX",
  eyebrow: L("Défis de personnage", "Character Challenges"),
  title: L(
    "Défiez la mort, jusqu'au niveau 80.",
    "Defy death, all the way to 80.",
  ),
  lede: L(
    "**18 défis**, de ★ à ★★★★★, à prendre sur un personnage neuf auprès de Vesperine Murmetombe, gardienne des Tombés : une seule vie, ni hôtel des ventes ni talents… Ce que votre défi interdit est refusé avant de vous coûter quoi que ce soit, et chaque palier se fête avec le royaume.",
    "**18 challenges**, from ★ to ★★★★★, taken on a fresh character from Vesperine Gravewhisper, Keeper of the Fallen: one life, no auction house, no talents… Whatever your challenge forbids is refused before it costs you anything, and every milestone is celebrated with the realm.",
  ),
  list: [
    {
      ref: "spell:105901",
      icon: "ability_hunter_pet_turtle",
      stars: 1,
      tier: "aura",
      name: L("Lentement mais sûrement", "Slow and Steady"),
      rule: L(
        "Expérience réduite de moitié, et aucun bonus d'expérience.",
        "Half the experience, and no experience bonus of any kind.",
      ),
      reward: L("Aura de réussite", "Completion aura"),
    },
    {
      ref: "spell:105902",
      icon: "ability_tracking",
      stars: 2,
      tier: "aura",
      name: L("Les pieds sur terre", "Grounded"),
      rule: L(
        "Ni maître de vol, ni monture volante, ni portail, ni téléportation. Bateaux, zeppelins et pierre de foyer permis.",
        "No flight masters, flying mounts, portals or teleports. Boats, zeppelins and the hearthstone are fine.",
      ),
      reward: L("Aura de réussite", "Completion aura"),
    },
    {
      ref: "spell:105903",
      icon: "inv_misc_bag_10",
      stars: 2,
      tier: "aura",
      name: L("Autodidacte", "Self-Made"),
      rule: L(
        "Ni hôtel des ventes, ni échange, ni courrier entre joueurs, ni banque de guilde, ni héritages.",
        "No auction house, trading, player mail, guild bank or heirlooms.",
      ),
      reward: L("Aura de réussite", "Completion aura"),
    },
    {
      ref: "spell:105904",
      icon: "inv_shirt_grey_01",
      stars: 2,
      tier: "aura",
      name: L("Va-nu-pieds", "Ragamuffin"),
      rule: L(
        "Équipement blanc ou gris seulement, ni enchantement ni gemme.",
        "White or grey gear only, with no enchantments or gems.",
      ),
      reward: L("Aura de réussite", "Completion aura"),
    },
    {
      ref: "spell:105905",
      icon: "spell_deathknight_bloodboil",
      stars: 3,
      tier: "aura",
      name: L("Sang chaud", "Hot-Blooded"),
      rule: L(
        "Toujours marqué JcJ, sans pouvoir l'enlever. 3 vies.",
        "Always flagged for PvP, with no way to remove it. 3 lives.",
      ),
      reward: L("Aura de réussite", "Completion aura"),
    },
    {
      ref: "spell:105906",
      icon: "ability_hunter_pet_wolf",
      stars: 3,
      tier: "aura",
      name: L("Loup solitaire", "Lone Wolf"),
      rule: L(
        "Autodidacte, et jamais en groupe, en raid ni en Recherche de donjons.",
        "Self-Made, and never in a group, a raid or the Dungeon Finder.",
      ),
      reward: L("Aura de réussite", "Completion aura"),
    },
    {
      ref: "spell:105907",
      icon: "inv_misc_rune_01",
      stars: 3,
      tier: "aura",
      name: L("Sans talent", "Talentless"),
      rule: L(
        "Aucun point de talent. Glyphes et double spécialisation permis.",
        "No talent points. Glyphs and dual specialization are fine.",
      ),
      reward: L("Aura de réussite", "Completion aura"),
    },
    {
      ref: "spell:105908",
      icon: "spell_shadow_curseofmannoroth",
      stars: 3,
      tier: "aura",
      name: L("Affaibli", "Weakened"),
      rule: L(
        "−25 % de dégâts infligés et −25 % de soins reçus, pour toujours. 3 vies.",
        "−25% damage dealt and −25% healing received, for good. 3 lives.",
      ),
      reward: L("Aura de réussite", "Completion aura"),
    },
    {
      ref: "spell:105909",
      icon: "inv_hammer_20",
      stars: 3,
      tier: "title",
      name: L("Fait main", "Handmade"),
      rule: L(
        "Seulement l'équipement et les sacs fabriqués de vos mains.",
        "Only gear and bags you crafted yourself.",
      ),
      reward: L("Titre : l'Artisan", "Title: the Artisan"),
    },
    {
      ref: "spell:105910",
      icon: "ability_warrior_intensifyrage",
      stars: 3,
      tier: "title",
      name: L("Au naturel", "Au Naturel"),
      rule: L(
        "Aucune armure ni bijou : armes, chemise, tabard et sacs seulement.",
        "No armor or jewelry: weapons, shirt, tabard and bags only.",
      ),
      reward: L("Titre : le Nu", "Title: the Bare"),
    },
    {
      ref: "spell:105911",
      icon: "ability_hunter_beastsoothe",
      stars: 3,
      tier: "title",
      name: L("Ami des bêtes", "Friend of Beasts"),
      rule: L(
        "Ne jamais tuer de bête ni de bestiole, celles de votre familier comprises.",
        "Never kill a beast or a critter, your pet's kills included.",
      ),
      reward: L("Titre : l'Ami des bêtes", "Title: Friend of Beasts"),
    },
    {
      ref: "spell:105912",
      icon: "spell_shadow_twilight",
      stars: 4,
      tier: "title",
      name: L("Sans repos", "Restless"),
      rule: L(
        "Aucune régénération naturelle ; boire et manger seulement dans les auberges et les capitales. 3 vies.",
        "No natural regeneration; eat and drink only in inns and capitals. 3 lives.",
      ),
      reward: L("Titre : le Sans-Repos", "Title: the Sleepless"),
    },
    {
      ref: "spell:105913",
      icon: "spell_shadow_possession",
      stars: 4,
      tier: "title",
      name: L("Cauchemar", "Nightmare"),
      rule: L(
        "Chaque coup frappe deux fois plus fort : +100 % de dégâts subis. 3 vies.",
        "Every blow hits twice as hard: +100% damage taken. 3 lives.",
      ),
      reward: L("Titre : Cauchemar éveillé", "Title: the Waking Nightmare"),
    },
    {
      ref: "spell:105914",
      icon: "inv_scroll_03",
      stars: 4,
      tier: "title",
      name: L("Aucune quête", "Questless"),
      rule: L(
        "Aucune quête rendue, sauf les quêtes de classe.",
        "No quests turned in, except class quests.",
      ),
      reward: L("Titre : l'Insoumis", "Title: the Unbidden"),
    },
    {
      ref: "spell:105915",
      icon: "inv_misc_bone_humanskull_01",
      stars: 4,
      tier: "legend",
      name: L("Une seule vie", "One Life"),
      rule: L("La mort est définitive.", "Death is final."),
      reward: L("Légende : l'Impérissable", "Legend: the Deathless"),
    },
    {
      ref: "spell:105916",
      icon: "spell_holy_layonhands",
      stars: 5,
      tier: "legend",
      name: L("Pacifiste", "Pacifist"),
      rule: L(
        "Aucune mise à mort : l'expérience vient des quêtes sans combat, de l'exploration et des champs de bataille.",
        "No killing blows: experience comes from peaceful quests, exploration and battlegrounds.",
      ),
      reward: L("Légende : le Pacifiste", "Legend: the Pacifist"),
    },
    {
      ref: "spell:105917",
      icon: "inv_misc_organ_01",
      stars: 5,
      tier: "legend",
      name: L("Cœur de fer", "Heart of Iron"),
      rule: L(
        "Une seule vie, Loup solitaire, Va-nu-pieds et Sans talent ; ni consommable, ni donjon, ni champ de bataille ; secourisme, cuisine et pêche seulement.",
        "One Life, Lone Wolf, Ragamuffin and Talentless; no consumables, dungeons or battlegrounds; only First Aid, Cooking and Fishing.",
      ),
      reward: L("Légende : Cœur-de-fer", "Legend: Ironheart"),
    },
    {
      ref: "spell:105918",
      icon: "inv_misc_dice_01",
      stars: 5,
      tier: "legend",
      name: L("Le Pari du Roi-liche", "The Lich King's Wager"),
      rule: L(
        "Une seule vie, +100 % de dégâts subis et Autodidacte.",
        "One Life, +100% damage taken and Self-Made.",
      ),
      reward: L("Légende : Fléau-du-Liche", "Legend: Lichbane"),
    },
  ] as Challenge[],
  extras: [
    {
      icon: "spell_shadow_raisedead",
      title: L("Vesperine Murmetombe", "Vesperine Gravewhisper"),
      text: L(
        "Son Écho attend dans chaque zone de départ et à Achérus. Un personnage neuf, un défi à la fois : le Livre du défi garde les règles, et Vesperine vous laisse essayer les auras de réussite.",
        "Her Echo waits in every starting area and in Acherus. A fresh character, one challenge at a time: the challenge's Book holds the rules, and Vesperine lets you try on the completion auras.",
      ),
    },
    {
      icon: "achievement_level_80",
      title: L("La version authentique x1", "The authentic x1"),
      text: L(
        "Au taux du royaume (x5) ou en x1, comme le Hardcore officiel. En x1, **chaque récompense est triplée**, avec un « Prem's » de plus par défi et le haut fait Authentique.",
        "At the realm rate (x5), or in x1 like official Hardcore. In x1, **every reward is tripled**, with one more Realm First per challenge and the Authentic feat.",
      ),
    },
    {
      icon: "inv_misc_book_09",
      title: L("Paliers et récompenses", "Milestones and rewards"),
      text: L(
        "Des Fragments de chronique tous les 10 niveaux ; tout le royaume entend votre nom dès le niveau 10 en x1, dès le niveau 40 en x5 (votre guilde avant). À 80, des Fragments selon les étoiles ; les légendes y ajoutent 10 Écussons de mérite et un Jeton d'ascension.",
        "Chronicle Fragments every 10 levels; the whole realm hears your name from level 10 in x1, from level 40 in x5 (your guild before that). At 80, Fragments by stars; legends add 10 Commendation Badges and an Ascension Token.",
      ),
    },
    {
      icon: "spell_holy_spiritualguidence",
      title: L("Une seule vie", "One life"),
      text: L(
        "Votre mort est annoncée à tout le royaume, avec la façon dont elle est arrivée. Vesperine épargne votre première chute mortelle, une seule fois.",
        "Your death is announced to the whole realm, along with how it happened. Vesperine spares your first fatal fall, just once.",
      ),
    },
    {
      icon: "inv_misc_bone_orcskull_01",
      title: L("Le Mak'gora", "The Mak'gora"),
      text: L(
        "Deux défiants à une seule vie qui se battent en duel s'affrontent à mort, sans reddition possible. Qui fuit devient **Pleutre** pendant trois jours ; le vainqueur prend une oreille pour son Collier d'oreilles, payée en Fragments de chronique au niveau 80.",
        "Two one-life challengers who duel fight to the death, with no surrender. Whoever flees is a **Coward** for three days; the winner takes an ear for their String of Ears, paid in Chronicle Fragments at level 80.",
      ),
    },
    {
      icon: "achievement_bg_masterofallbgs",
      title: L("Panthéon et Prem's", "Hall of Fame and Firsts"),
      text: L(
        "Un « Prem's » du royaume par défi, et un onglet Défis au Panthéon : les défis en cours avec leur niveau, les réussis et les tombés.",
        "One Realm First per challenge, and a Challenges tab in the Hall of Fame: runs in progress with their level, the completed and the fallen.",
      ),
    },
  ],
  image: IMG.icecrownHall,
};

export const glory = {
  id: "glory",
  numeral: "XXI",
  eyebrow: L("Hauts faits", "Achievements"),
  title: L("Entrez dans l'histoire du royaume.", "Make the realm's history."),
  lede: L(
    "Un onglet « Lordaeron » de **283 hauts faits**, et les « Prem's » du royaume : des exploits qu'un seul joueur ou un seul groupe pourra jamais obtenir.",
    'A "Lordaeron" tab of **283 achievements**, and the realm\'s Firsts: feats that only one player or one group will ever earn.',
  ),
  firsts: [
    {
      icon: "inv_misc_head_dragon_blue",
      name: L("Lazulygos", "Lazulygos"),
      text: L(
        "Premier raid à vaincre Lazulygos, Siphon tellurique · titre « Fléau des colosses »",
        "First raid to defeat Lazulygos, Ley Siphon · title Breaker of Colossi",
      ),
    },
    {
      icon: "achievement_boss_yoggsaron_01",
      name: L("Thul'gorah", "Thul'gorah"),
      text: L(
        "Premier raid à vaincre Thul'gorah, Murmure de Yogg-Saron · titre « Fléau des colosses »",
        "First raid to defeat Thul'gorah, Whisper of Yogg-Saron · title Breaker of Colossi",
      ),
    },
    {
      icon: "achievement_reputation_08",
      name: L("Guilde de Lordaeron", "Guild of Lordaeron"),
      text: L(
        "Première guilde au niveau 10 de renommée",
        "First guild to reach renown level 10",
      ),
    },
    {
      icon: "inv_misc_book_11",
      name: L("Archiviste exalté", "Exalted Archivist"),
      text: L(
        "Premier exalté auprès de l'Ordre des Archivistes",
        "First to be Exalted with the Archivist Order",
      ),
    },
    {
      icon: "inv_misc_token_argentdawn3",
      name: L("Ascension", "Ascended"),
      text: L(
        "Premier à utiliser un jeton d'ascension",
        "First to use an Ascension Token",
      ),
    },
    {
      icon: "inv_misc_fish_20",
      name: L("Prise légendaire", "Legendary Catch"),
      text: L(
        "Premier poisson légendaire rapporté à Marcia Chase",
        "First legendary fish brought to Marcia Chase",
      ),
    },
    {
      icon: "inv_misc_coin_02",
      name: L("Trésor d'or", "Golden Hoard"),
      text: L(
        "Premier à posséder 200 000 pièces d'or",
        "First to own 200,000 gold",
      ),
    },
  ],
  titles: [
    L("le Précurseur", "the Forerunner"),
    L("Fléau des colosses", "Breaker of Colossi"),
    L("le Malchanceux", "the Unlucky"),
    L("l'Érudit", "the Erudite"),
    L("le Chanceux", "the Lucky"),
    L("cartographe du Norfendre", "Cartographer of Northrend"),
  ],
  image: IMG.ulduarAlgalon,
};

export const finale = {
  title: L("Le Norfendre vous attend.", "Northrend awaits."),
  text: L(
    "Un serveur fidèle, des butins vérifiés boss par boss, des textes traduits d'après les versions officielles. Et **des centaines de nouveautés** qui n'existent nulle part ailleurs.",
    "A faithful server, loot verified boss by boss, texts translated from the official versions. And **hundreds of additions** found nowhere else.",
  ),
  reservation: L(
    "Réservation des noms dès le **mercredi 14 octobre à 19:00 CEST (17:00 UTC)** : créez vos personnages et réservez vos noms. Le monde ouvre le **vendredi 16 octobre à 19:00 CEST**.",
    "Name reservation from **Wednesday, October 14 at 19:00 CEST (17:00 UTC)**: create your characters and reserve your names. The world opens on **Friday, October 16 at 19:00 CEST**.",
  ),
  cta: L("Rejoindre Rimeheart", "Join Rimeheart"),
  image: IMG.throne,
};

export const nav = [
  { id: "phases", label: L("Phases", "Phases") },
  { id: "artifact", label: L("Artefact", "Artifact") },
  { id: "classes", label: L("Classes", "Classes") },
  { id: "races", label: L("Races", "Races") },
  { id: "raids", label: L("Raids héroïques", "Heroic raids") },
  { id: "eye", label: L("L'Œil 80", "The Eye 80") },
  { id: "world-bosses", label: L("Boss du monde", "World bosses") },
  { id: "loot", label: L("Butin", "Loot") },
  { id: "archivists", label: L("Archivistes", "Archivists") },
  { id: "heroes", label: L("Héros", "Heroes") },
  { id: "professions", label: L("Métiers", "Professions") },
  { id: "fishing", label: L("Pêche", "Fishing") },
  { id: "treasures", label: L("Trésors", "Treasures") },
  { id: "collections", label: L("Collections", "Collections") },
  { id: "economy", label: L("Économie", "Economy") },
  { id: "quiz", label: L("Quiz", "Quiz") },
  { id: "transmog", label: L("Transmog", "Transmog") },
  { id: "pvp", label: L("JcJ", "PvP") },
  { id: "guilds", label: L("Guildes", "Guilds") },
  { id: "challenges", label: L("Défis", "Challenges") },
  { id: "glory", label: L("Hauts faits", "Achievements") },
];
