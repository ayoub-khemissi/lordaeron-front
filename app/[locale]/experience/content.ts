/*
 * The realm showcase (hidden page /[locale]/experience): every new feature of the Lordaeron realm, player-facing.
 * Facts verified against the content generator and the test realm (contrib/wotlk-plus, inventory of 08/10/2026).
 * French and English; the other locales show the English text until translated.
 */

export type Lang = "fr" | "en";
export type T = { fr: string; en: string };

const L = (fr: string, en: string): T => ({ fr, en });

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
    "Lordaeron · Wrath of the Lich King 3.3.5",
    "Lordaeron · Wrath of the Lich King 3.3.5",
  ),
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
    "Lordaeron rejoue l'extension palier par palier, comme à sa sortie, sur une base 3.3.5 fidèle. Et à chaque palier, du contenu neuf : chaque création est pensée dans le lore, équilibrée pour chaque spécialisation, traduite dans cinq langues.",
    "Lordaeron replays the expansion tier by tier, as at launch, on a faithful 3.3.5 base. And at every tier, new content: every creation is rooted in the lore, balanced for every specialization, translated into five languages.",
  ),
  stats: [
    {
      value: 5,
      suffix: "",
      label: L("phases de progression", "progression phases"),
    },
    {
      value: 228,
      suffix: "",
      label: L("nouveaux hauts faits", "new achievements"),
    },
    { value: 62, suffix: "", label: L("nouvelles montures", "new mounts") },
    {
      value: 277,
      suffix: "",
      label: L("recettes de métier", "profession recipes"),
    },
    {
      value: 30,
      suffix: "",
      label: L("sorts de classe inédits", "brand-new class spells"),
    },
    {
      value: 16302,
      suffix: "",
      label: L("apparences de transmogrification", "transmog appearances"),
    },
    { value: 297, suffix: "", label: L("questions de lore", "lore questions") },
    { value: 43, suffix: "", label: L("nouveaux titres", "new titles") },
  ],
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
    "Revivez l'extension comme à sa sortie. Instances, butin, recettes, vendeurs, quêtes, emblèmes et saisons d'arène s'ouvrent au rythme des phases, sans jamais d'avance. Chaque ouverture est annoncée en jeu.",
    "Relive the expansion as it launched. Instances, loot, recipes, vendors, quests, emblems and arena seasons open with each phase, never ahead of time. Every opening is announced in game.",
  ),
  steps: [
    {
      n: "0",
      title: L("Le prélude", "The prelude"),
      image: IMG.fjord,
      text: L(
        "2 à 3 semaines pour s'équiper : les 12 donjons du Norfendre en normal et héroïque, champs de bataille, arènes et Joug-d'hiver.",
        "2 to 3 weeks to gear up: the 12 Northrend dungeons, normal and heroic, battlegrounds, arenas and Wintergrasp.",
      ),
    },
    {
      n: "1",
      title: L("Naxxramas", "Naxxramas"),
      image: IMG.boss("kelthuzad"),
      text: L(
        "Naxxramas, Sanctum obsidien, Œil de l'éternité, Archavon. Saison d'arène 5.",
        "Naxxramas, Obsidian Sanctum, Eye of Eternity, Archavon. Arena season 5.",
      ),
    },
    {
      n: "2",
      title: L("Ulduar", "Ulduar"),
      image: IMG.boss("yoggsaron"),
      text: L(
        "Ulduar, Emalon, le Tournoi d'argent. L'Œil de Kael'thas au niveau 80. Saison 6.",
        "Ulduar, Emalon, the Argent Tournament. Kael'thas's Eye at level 80. Season 6.",
      ),
    },
    {
      n: "3",
      title: L("L'Épreuve", "The Trial"),
      image: IMG.boss("onyxia"),
      text: L(
        "Épreuve du croisé, Onyxia niveau 80, Koralon, gemmes épiques. Saison 7.",
        "Trial of the Crusader, level 80 Onyxia, Koralon, epic gems. Season 7.",
      ),
    },
    {
      n: "4",
      title: L("La Citadelle", "The Citadel"),
      image: IMG.boss("lichking"),
      text: L(
        "La Citadelle de la Couronne de glace et les Salles gelées. Toravon. Saison 8.",
        "Icecrown Citadel and the Frozen Halls. Toravon. Season 8.",
      ),
    },
    {
      n: "5",
      title: L("Le Crépuscule", "Twilight"),
      image: IMG.boss("halion"),
      text: L(
        "Le Sanctum rubis et Halion, le Destructeur du Crépuscule.",
        "The Ruby Sanctum and Halion, the Twilight Destroyer.",
      ),
    },
  ],
  footnote: L(
    "Les raids classiques et de Burning Crusade restent ouverts dès le premier jour, comme la double spécialisation et la Recherche de donjons.",
    "Classic and Burning Crusade raids stay open from day one, as do dual specialization and the Dungeon Finder.",
  ),
};

export const artifact = {
  id: "artifact",
  numeral: "II",
  eyebrow: L("Qualité Artefact", "Artifact quality"),
  title: L("Plus haut que l'épique.", "Beyond epic."),
  lede: L(
    "Chaque objet ramassé, fabriqué, pêché ou reçu en récompense peut sortir un cran au-dessus. Vert, bleu, épique… et Artefact, le rang doré.",
    "Every item looted, crafted, fished or earned can drop one step higher. Green, blue, epic… and Artifact, the golden rank.",
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
      "Quand la chance ne suffit plus. Le jeton élève l'arme ou la pièce d'armure de votre choix d'un rang de qualité : jamais d'échec, enchantements et gemmes conservés. L'Ordre des Archivistes ne le confie qu'à ses membres exaltés.",
      "For when luck is not enough. The token raises the weapon or armor piece of your choice by one quality rank: it never fails, and every enchantment and gem stays. The Archivist Order entrusts it only to its Exalted.",
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
    "Les dix classes reçoivent chacune trois nouveaux sorts (un par arbre), trois talents réécrits et deux glyphes. Pensés pour leur identité et leur lore, équilibrés entre eux, jamais une copie d'un sort existant.",
    "All ten classes receive three new spells (one per tree), three rewritten talents and two glyphs. Built for their identity and lore, balanced against each other, never a copy of an existing spell.",
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
          name: L("Échange démoniaque", "Demonic Swap"),
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
          spec: L("Combat farouche", "Feral"),
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
      "Le Kirin Tor plie le temps : les mages deviennent la deuxième classe à porter la hâte de raid. +30 % de hâte pour tout le raid pendant 40 secondes.",
      "The Kirin Tor bends time: mages become the second class to bring raid haste. +30% haste for the whole raid for 40 seconds.",
    ),
  },
};

export const raids = {
  id: "raids",
  numeral: "IV",
  eyebrow: L("Raids héroïques", "Heroic raids"),
  title: L("Naxxramas, Ulduar… en héroïque.", "Naxxramas, Ulduar… in heroic."),
  lede: L(
    "Les raids des premières phases gagnent un vrai mode héroïque en 10 et en 25, sur le modèle de la Citadelle : le chef de raid change de difficulté sans quitter l'instance, et chaque objet a sa version Héroïque.",
    "The early raids gain a true heroic mode in 10 and 25, on the Icecrown Citadel model: the raid leader switches difficulty without leaving the instance, and every item has its Heroic version.",
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
        "Les quatre quartiers et Kel'Thuzad, plus forts : ×1,4 points de vie, ×1,25 dégâts.",
        "The four quarters and Kel'Thuzad, stronger: ×1.4 health, ×1.25 damage.",
      ),
    },
    {
      icon: "achievement_dungeon_ulduarraid_misc_01",
      title: L("Ulduar", "Ulduar"),
      text: L(
        "Héroïque et modes difficiles se cumulent. Butin jusqu'au niveau d'objet 252.",
        "Heroic and hard modes stack. Loot up to item level 252.",
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
      "Dialogues de Tirion, Varian, Garrosh et Thrall restaurés, 50 tentatives en héroïque et un tribut selon les tentatives restantes.",
      "Tirion, Varian, Garrosh and Thrall's dialogue restored, 50 attempts in heroic, and a tribute based on the attempts left.",
    ),
  },
  image: IMG.ulduarIron,
};

export const eye = {
  id: "eye",
  numeral: "V",
  eyebrow: L("Raid classique au niveau 80", "Classic raid at level 80"),
  title: L("L'Œil de Kael'thas renaît.", "Kael'thas's Eye reborn."),
  lede: L(
    "Le Donjon de la Tempête revient au niveau 80, en 10 et 25 joueurs, aux côtés d'Ulduar. Boss de niveau 83, T5 refait, et les armes légendaires de Kael'thas remises à niveau.",
    "Tempest Keep returns at level 80, for 10 and 25 players, alongside Ulduar. Level 83 bosses, a remade Tier 5, and Kael'thas's legendary weapons brought up to date.",
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
  image:
    "/img/Burning Crusade Classic Overlords of Outland Announce/BCC_Overlords_of_Outland_KaelThas_1920x1080.jpg",
  mountImage:
    "/img/Burning Crusade Classic Overlords of Outland Screenshots 1080p/BCC_Overlords_of_Outland__Ashes_of_Alar_Mount_1920x1080.jpg",
};

export const worldBosses = {
  id: "world-bosses",
  numeral: "VI",
  eyebrow: L("Boss du monde", "World bosses"),
  title: L("Des colosses à ciel ouvert.", "Colossi under the open sky."),
  lede: L(
    "De 10 à 40 joueurs, personne ne « marque » le boss : chaque participant est récompensé, avec un objet de sa spécialisation garanti à chaque période de raid.",
    "From 10 to 40 players, nobody tags the boss: every participant is rewarded, with an item for their specialization guaranteed each raid lockout.",
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
  numeral: "VII",
  eyebrow: L("Butin et combats", "Loot and fights"),
  title: L("Fini les ninjas.", "No more ninjas."),
  lede: L(
    "Le butin des boss arrive directement dans le sac de celui à qui il sert. Pas de dés, pas de maître du butin : une répartition juste, transparente, qui récompense tout le monde.",
    "Boss loot goes straight into the bag of whoever needs it. No rolls, no master looter: a fair, transparent distribution that rewards everyone.",
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
      "À la fin d'un combat de boss, tous les temps de recharge de classe repartent à zéro et l'Épuisement disparaît. Et pendant le combat, un mort ne peut pas libérer son esprit : on reste avec son raid.",
      "When a boss fight ends, every class cooldown resets and Exhaustion fades. And during the fight, the dead cannot release: you stay with your raid.",
    ),
  },
};

export const archivists = {
  id: "archivists",
  numeral: "VIII",
  eyebrow: L("L'Ordre des Archivistes", "The Archivist Order"),
  title: L(
    "Chaque boss vaincu laisse une page d'histoire.",
    "Every fallen boss leaves a page of history.",
  ),
  lede: L(
    "Les Fragments de chronique tombent sur plus de 600 boss, de donjon comme de raid. Les Archivistes les paient en réputation, en tabards, en monture… et en Jetons d'ascension.",
    "Chronicle Fragments drop from more than 600 bosses, dungeons and raids alike. The Archivists pay for them in reputation, tabards, a mount… and Ascension Tokens.",
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
        "Les archimages Timear et Lan'dalock reprennent leur service, et une quête de raid « … doit mourir ! » change deux fois par semaine.",
        'Archmages Timear and Lan\'dalock are back on duty, and a raid quest "… Must Die!" changes twice a week.',
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
        "Ses quatre gardiens donnent des Éclats du gardien de pierre à la faction qui tient le Joug-d'hiver.",
        "Its four watchers give Stone Keeper's Shards to the faction holding Wintergrasp.",
      ),
    },
  ],
  image: IMG.ulduarArchive,
};

export type Profession = {
  key: string;
  icon: string;
  name: T;
  specs: T;
  highlights: T[];
};

export const professions = {
  id: "professions",
  numeral: "IX",
  eyebrow: L("Métiers", "Professions"),
  title: L("Les métiers réinventés.", "Professions reinvented."),
  lede: L(
    "277 nouvelles recettes réparties sur les phases et 28 spécialisations, chacune avec ses « coups de maître ». Chaque métier gagne une identité et une raison de compter à chaque palier.",
    "277 new recipes spread across the phases and 28 specializations, each with its own masterworks. Every profession gains an identity and a reason to matter at every tier.",
  ),
  list: [
    {
      key: "jc",
      icon: "inv_jewelcrafting_dragonseye02",
      name: L("Joaillerie", "Jewelcrafting"),
      specs: L("Lapidaire · Orfèvre", "Lapidary · Goldsmith"),
      highlights: [
        L("8 diamants méta des Titans", "8 Titanic meta diamonds"),
        L(
          "Yeux de dragon bicolores et Prisme de lumière stellaire",
          "Two-color Dragon's Eyes and the Starlight Prism",
        ),
        L(
          "Figurines de 245, anneaux de 264",
          "Item level 245 figurines, 264 rings",
        ),
      ],
    },
    {
      key: "ench",
      icon: "spell_fire_enchantweapon",
      name: L("Enchantement", "Enchanting"),
      specs: L("Enchanteur d'armes · d'armures", "Weapon · Armor Enchanter"),
      highlights: [
        L(
          "Colère de Thorim, Écho du sablier, Rempart de Hodir",
          "Thorim's Wrath, Hourglass Echo, Hodir's Bulwark",
        ),
        L("L'Égide du croisé", "Crusader's Aegis"),
        L("Parchemins de maître", "Master scrolls"),
      ],
    },
    {
      key: "cook",
      icon: "achievement_profession_chefhat",
      name: L("Cuisine", "Cooking"),
      specs: L("Chef de festin · Gourmet", "Master of Feasts · Gourmet"),
      highlights: [
        L(
          "Festins taunka, du Kirin Tor, du Repos du ver…",
          "Taunka, Kirin Tor, Wyrmrest feasts…",
        ),
        L(
          "Le Grand banquet kalu'ak vous déguise en rohart",
          "The Great Kalu'ak Banquet turns you into a tuskarr",
        ),
        L("Plats « mémorables » de 2 heures", '2-hour "memorable" dishes'),
      ],
    },
    {
      key: "bs",
      icon: "inv_sword_153",
      name: L("Forge", "Blacksmithing"),
      specs: L(
        "Armurier · Lames · Marteaux · Haches",
        "Armorsmith · Swords · Hammers · Axes",
      ),
      highlights: [
        L(
          "Une arme de maître par palier, là où Blizzard n'en faisait aucune",
          "A master weapon per tier, where Blizzard made none",
        ),
        L("15 pièces de niveau 264", "15 item level 264 pieces"),
      ],
    },
    {
      key: "lw",
      icon: "inv_misc_drum_05",
      name: L("Travail du cuir", "Leatherworking"),
      specs: L(
        "Écailles de dragon · Élémentaire · Tribal",
        "Dragonscale · Elemental · Tribal",
      ),
      highlights: [
        L(
          "9 capes-trophées : Roi Krush, Skoll, Loque'nahak…",
          "9 trophy cloaks: King Krush, Skoll, Loque'nahak…",
        ),
        L("Tambours de l'esprit taunka", "Drums of the Taunka Spirit"),
      ],
    },
    {
      key: "tail",
      icon: "inv_fabric_moonrag_primal",
      name: L("Couture", "Tailoring"),
      specs: L(
        "Étoffe lunaire · Feu-sorcier · Tisse-ombre",
        "Mooncloth · Spellfire · Shadoweave",
      ),
      highlights: [
        L(
          "Une pièce en tisse-ébène par saison JcJ",
          "An ebonweave piece every PvP season",
        ),
        L("Broderie de rempart", "Bulwark Embroidery"),
      ],
    },
    {
      key: "eng",
      icon: "inv_misc_enggizmos_28",
      name: L("Ingénierie", "Engineering"),
      specs: L("Gnome · Gobelin", "Gnomish · Goblin"),
      highlights: [
        L(
          "Transporteur ultra-sécurisé : Ulduar",
          "Ultrasafe Transporter: Ulduar",
        ),
        L(
          "Déchiqueteur de poche gobelin, un compagnon de combat",
          "Goblin Pocket Shredder, a combat companion",
        ),
        L("11 lunettes de 245", "11 item level 245 goggles"),
      ],
    },
    {
      key: "alch",
      icon: "inv_alchemy_endlessflask_05",
      name: L("Alchimie", "Alchemy"),
      specs: L(
        "Élixirs · Potions · Transmutation",
        "Elixirs · Potions · Transmutation",
      ),
      highlights: [
        L("7 potions infinies", "7 endless potions"),
        L(
          "9 pierres d'alchimiste jusqu'au niveau 264",
          "9 alchemist stones up to item level 264",
        ),
        L("Transmutation de l'Orbe gelé", "Frozen Orb transmutation"),
      ],
    },
    {
      key: "insc",
      icon: "inv_inscription_majorglyph00",
      name: L("Calligraphie", "Inscription"),
      specs: L("Glyphiste · Scribe des arcanes", "Glyphist · Arcane Scribe"),
      highlights: [
        L("Une deuxième recherche quotidienne", "A second daily research"),
        L("Le Codex de la guerre du Nexus", "The Nexus-War Codex"),
      ],
    },
    {
      key: "dmf",
      icon: "inv_misc_ticket_tarot_storms",
      name: L("Cartes de Sombrelune", "Darkmoon Cards"),
      specs: L("Une carte par palier de raid", "One card per raid tier"),
      highlights: [
        L(
          "4 nouvelles cartes : Titans, Tournoi, Couronne de glace, Crépuscule",
          "4 new cards: Titans, Tournament, Icecrown, Twilight",
        ),
        L(
          "20 bijoux épiques, de 226 à 271",
          "20 epic trinkets, from 226 to 271",
        ),
      ],
    },
    {
      key: "fa",
      icon: "inv_misc_bandage_frostweave_heavy",
      name: L("Secourisme", "First Aid"),
      specs: L(
        "Chirurgien · Apothicaire de campagne",
        "Field Surgeon · Field Apothecary",
      ),
      highlights: [
        L(
          "Sauvez 8 croisés blessés pour devenir Grand maître",
          "Save 8 wounded crusaders to become Grand Master",
        ),
        L(
          "Un bandage par phase, jusqu'à 9 800 points de vie",
          "A bandage per phase, up to 9,800 health",
        ),
      ],
    },
  ] as Profession[],
};

export const fishing = {
  id: "fishing",
  numeral: "X",
  eyebrow: L("Pêche et récolte", "Fishing and gathering"),
  title: L(
    "Chaque ligne lancée peut changer une vie.",
    "Every cast can change a life.",
  ),
  lede: L(
    "Onze zones de pêche, chacune avec son poisson rare, ses trouvailles, son épique par phase… et un poisson légendaire. Des filons et des fleurs rares, des trophées de bêtes, des commandes des Archives.",
    "Eleven fishing zones, each with its rare fish, its finds, an epic per phase… and a legendary fish. Rare veins and flowers, beast trophies, Archive orders.",
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
        "Dont 97 épiques, et 55 avec un effet en jeu : Harpon kalu'ak, Harpon de saronite, Crue drakkari…",
        "Including 97 epics, 55 with an in-game effect: Kalu'ak Harpoon, Saronite Harpoon, Drakkari Flood…",
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
  numeral: "XI",
  eyebrow: L("Trésors", "Treasures"),
  title: L("Le Norfendre cache ses secrets.", "Northrend hides its secrets."),
  lede: L(
    "Des caches d'expédition, des coffres scellés et dix cartes au trésor à énigme. Déchiffrez l'énigme, trouvez le lieu, creusez… et peut-être, une monture.",
    "Expedition caches, sealed chests and ten riddle treasure maps. Solve the riddle, find the place, dig… and maybe, a mount.",
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
        "Or, fragments, une bourse, de la camelote de prix… et une monture par phase.",
        "Gold, fragments, a purse, valuable trinkets… and one mount per phase.",
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
  numeral: "XII",
  eyebrow: L("Collections", "Collections"),
  title: L(
    "Des montures que personne n'a jamais montées.",
    "Mounts no one has ever ridden.",
  ),
  lede: L(
    "Mei Francis, à Dalaran, propose 34 montures tirées de modèles jamais montés par des joueurs, avec leurs vrais cris. Et ce n'est qu'un début.",
    "Mei Francis, in Dalaran, offers 34 mounts drawn from models no player has ever ridden, with their real calls. And that's just the beginning.",
  ),
  stats: [
    { value: 62, label: L("montures", "mounts") },
    { value: 14, label: L("mascottes", "pets") },
    { value: 6, label: L("jouets", "toys") },
    { value: 15, label: L("tabards", "tabards") },
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
        "Pointez-le vers un garde, un aubergiste, un Archiviste… huit sortes de PNJ vous répondent.",
        "Point it at a guard, an innkeeper, an Archivist… eight kinds of NPCs answer you.",
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
  numeral: "XIII",
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
        "Gagnez la confiance de l'éthérien, puis découvrez sa vitrine deux fois par semaine : montures uniques, apparences légendaires (Sulfuras, Thori'dal, les Glaives d'Azzinoth) et, une livraison sur quatre, Atiesh, le Porte-cendres ou Deuillegivre.",
        "Earn the ethereal's trust, then browse his showcase twice a week: unique mounts, legendary appearances (Sulfuras, Thori'dal, the Warglaives of Azzinoth) and, one delivery in four, Atiesh, the Ashbringer or Frostmourne.",
      ),
    },
    {
      icon: "inv_misc_ticket_darkmoon_01",
      title: L("La loterie de Gentepression", "The Steamwheedle lottery"),
      tag: L("Lixxa Pochechance", "Lixxa Luckpocket"),
      text: L(
        "Une grande loterie tirée à chaque remise à zéro des raids, et des billets à gratter qui peuvent rapporter 1 000 pièces d'or… ou le Gnome porte-bonheur.",
        "A grand lottery drawn at every raid reset, and scratch tickets that can pay 1,000 gold… or the Lucky Gnome.",
      ),
    },
    {
      icon: "inv_misc_dice_01",
      title: L("Les dés gobelins", "Goblin dice"),
      tag: L("Grizzle Double-Six", "Grizzle Doublesix"),
      text: L(
        "Défiez un autre joueur à la table, de 10 à 1 000 pièces d'or. Deux dés chacun, le plus gros total rafle le pot.",
        "Challenge another player at the table, from 10 to 1,000 gold. Two dice each, the highest total takes the pot.",
      ),
    },
    {
      icon: "inv_misc_gem_pearl_04",
      title: L("L'antiquaire", "The antiquarian"),
      tag: L("Brodric Barbepoussière", "Brodric Dustbeard"),
      text: L(
        "La camelote du Norfendre vaut de l'or : couronnes vrykules, idoles nérubiennes, trophées de bêtes rares. Chaque semaine, trois pièces recherchées valent 50 % de plus.",
        "Northrend's junk is worth gold: vrykul crowns, nerubian idols, rare beast trophies. Each week, three sought-after pieces are worth 50% more.",
      ),
    },
  ],
  image: IMG.dalaranNight,
};

export const quiz = {
  id: "quiz",
  numeral: "XIV",
  eyebrow: L("Le quiz du Kirin Tor", "The Kirin Tor quiz"),
  title: L("Connaissez-vous vraiment Azeroth ?", "Do you really know Azeroth?"),
  lede: L(
    "Chaque jour, l'examinatrice Elaria Murmeplume vous pose cinq questions de lore, de la plus facile à celle réservée aux érudits. Une bonne réponse rapporte des Fragments de chronique ; une erreur vous apprend la bonne.",
    "Every day, examiner Elaria Quillwhisper asks you five lore questions, from the easiest to one for true scholars. A right answer earns Chronicle Fragments; a wrong one teaches you the truth.",
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
  numeral: "XV",
  eyebrow: L("Transmogrification", "Transmogrification"),
  title: L("16 302 façons d'être unique.", "16,302 ways to stand out."),
  lede: L(
    "Une boutique d'apparences payée en Fragments de chronique, dont plus de 7 000 modèles de PNJ jamais portés par des joueurs. Et 45 effets d'enchantement d'arme au choix.",
    "An appearance shop paid in Chronicle Fragments, with more than 7,000 NPC models no player has ever worn. And 45 weapon enchant effects to choose from.",
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
  numeral: "XVI",
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
        "Les 10 meilleurs de chaque faction deviennent Maréchal ou Seigneur de guerre de campagne.",
        "The top 10 of each faction become Campaign Marshal or Warlord.",
      ),
    },
    {
      icon: "inv_misc_coin_17",
      title: L("Récompenses exclusives", "Exclusive rewards"),
      text: L(
        "12 montures de campagne, des mascottes et 1 107 répliques des équipements des saisons d'arène 1 à 8.",
        "12 campaign mounts, pets and 1,107 replicas of arena seasons 1 to 8 gear.",
      ),
    },
    {
      icon: "ability_dualwield",
      title: L("Le tournoi des égouts", "The Sewer Tournament"),
      text: L(
        "Deux fois par semaine, à 19 h : duels à élimination directe dans les égouts de Dalaran. Gladiateur, Duelliste, Rival.",
        "Twice a week, at 7 PM: knockout duels in Dalaran's sewers. Gladiator, Duelist, Rival.",
      ),
    },
    {
      icon: "achievement_bg_masterofallbgs",
      title: L("Un JcJ fidèle et réparé", "Faithful, fixed PvP"),
      text: L(
        "Champs de bataille corrigés, arènes mixtes Alliance/Horde, Joug-d'hiver qui montre son vrai propriétaire.",
        "Fixed battlegrounds, mixed Alliance/Horde arenas, a Wintergrasp that shows its true owner.",
      ),
    },
  ],
  image: IMG.champions,
};

export const guilds = {
  id: "guilds",
  numeral: "XVII",
  eyebrow: L("Guildes", "Guilds"),
  title: L("Votre guilde grandit avec vous.", "Your guild grows with you."),
  lede: L(
    "Donjons, raids, boss du monde, JcJ, quêtes : en groupe de guilde, tout fait monter votre guilde du niveau 1 au niveau 10, et chaque niveau débloque un avantage pour tous.",
    "Dungeons, raids, world bosses, PvP, quests: in a guild group, everything raises your guild from level 1 to 10, and every level unlocks a perk for everyone.",
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
    "16 hauts faits de guilde versent plus de 21 000 pièces d'or à la banque. Étendards et chaudrons chez l'intendant de guilde.",
    "16 guild achievements pay more than 21,000 gold to the bank. Banners and cauldrons from the guild quartermaster.",
  ),
  image: IMG.icecrownGate,
};

export const glory = {
  id: "glory",
  numeral: "XVIII",
  eyebrow: L("Hauts faits", "Achievements"),
  title: L("Entrez dans l'histoire du royaume.", "Make the realm's history."),
  lede: L(
    "Un onglet « Lordaeron » de 228 hauts faits, et les « Prem's » du royaume : des exploits qu'un seul joueur ou un seul groupe pourra jamais obtenir.",
    'A "Lordaeron" tab of 228 achievements, and the realm\'s Firsts: feats that only one player or one group will ever earn.',
  ),
  firsts: [
    {
      icon: "inv_misc_head_dragon_blue",
      name: L("Les colosses", "The colossi"),
      text: L(
        "Premier raid à vaincre chaque boss du monde",
        "First raid to defeat each world boss",
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
    "Un serveur fidèle, des butins vérifiés boss par boss, des textes traduits d'après les versions officielles. Et des centaines de nouveautés qui n'existent nulle part ailleurs.",
    "A faithful server, loot verified boss by boss, texts translated from the official versions. And hundreds of additions found nowhere else.",
  ),
  cta: L("Rejoindre Lordaeron", "Join Lordaeron"),
  image: IMG.throne,
};

export const nav = [
  { id: "phases", label: L("Phases", "Phases") },
  { id: "artifact", label: L("Artefact", "Artifact") },
  { id: "classes", label: L("Classes", "Classes") },
  { id: "raids", label: L("Raids héroïques", "Heroic raids") },
  { id: "eye", label: L("L'Œil 80", "The Eye 80") },
  { id: "world-bosses", label: L("Boss du monde", "World bosses") },
  { id: "loot", label: L("Butin", "Loot") },
  { id: "archivists", label: L("Archivistes", "Archivists") },
  { id: "professions", label: L("Métiers", "Professions") },
  { id: "fishing", label: L("Pêche", "Fishing") },
  { id: "treasures", label: L("Trésors", "Treasures") },
  { id: "collections", label: L("Collections", "Collections") },
  { id: "economy", label: L("Économie", "Economy") },
  { id: "quiz", label: L("Quiz", "Quiz") },
  { id: "transmog", label: L("Transmog", "Transmog") },
  { id: "pvp", label: L("JcJ", "PvP") },
  { id: "guilds", label: L("Guildes", "Guilds") },
  { id: "glory", label: L("Hauts faits", "Achievements") },
];
