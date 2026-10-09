/*
 * Tooltip refs of the realm showcase: which in-game item or spell each card, reward, icon or class spell of content.ts shows on hover.
 * The tooltips themselves (our versions, FR and EN) are in public/data/experience-tooltips.json, written by the content generator
 * (contrib/wotlk-plus/tools/site-tooltips.js, refs in tools/site-tooltips.refs.json). Keys are the FR strings exactly as in content.ts.
 */

// display name (the FR string exactly as it appears in content.ts) -> tooltip ref
export const refByName: Record<string, string> = {
  // Artifact
  "Le Jeton d'ascension": "item:901960", // Ascension Token
  // Classes (the 30 new spells, also in classSpellRefs) and the mage raid haste
  "Bannière de l'Aube d'argent": "spell:100400", // Banner of the Argent Dawn
  "Veillée du chevalier": "spell:100402", // Knight's Vigil
  "Serment de protection": "spell:100404", // Oath of Protection
  "Vertu de ténacité": "spell:100450", // Virtue of Tenacity
  "Litanie de Faol": "spell:100451", // Litany of Faol
  "Fracture de l'esprit": "spell:100452", // Mind Fracture
  "Ruée du gladiateur": "spell:100500", // Gladiator's Rush
  "Hache tournoyante": "spell:100501", // Whirling Axe
  "Colère de Broxigar": "spell:100510", // Broxigar's Wrath
  "Ombres des San'layn": "spell:100600", // Shadows of the San'layn
  "Sillage gelé": "spell:100610", // Frozen Wake
  "Esprits vils": "spell:100620", // Vile Spirits
  "Graine d'étoile": "spell:100650", // Starseed
  "Bonds du prédateur": "spell:100653", // Predator's Leaps
  "Peau d'Ursoc": "spell:100652", // Ursoc's Hide
  "Feu follet du bosquet": "spell:100654", // Grove Wisp
  "Écho sauvage": "spell:100700", // Wild Echo
  "Tir de Nesingwary": "spell:100702", // Nesingwary's Trophy Shot
  "Leurre du trappeur": "spell:100703", // Trapper's Decoy
  "Singularité céleste": "spell:100750", // Celestial Singularity
  "Terre brûlée": "spell:100751", // Scorched Earth
  "Marque de l'hiver": "spell:100752", // Winter's Mark
  "Contrat de Ravenholdt": "spell:100800", // Ravenholdt Contract
  "Couteau rebondissant": "spell:100801", // Ricochet Knife
  "Double d'ombre": "spell:100802", // Shadow Double
  "Rafale orageuse": "spell:100850", // Stormgust
  "Fureur d'Al'Akir": "spell:100853", // Al'Akir's Fury
  Ressac: "spell:100855", // Undertow
  "Chaînes de tourment": "spell:100900", // Chains of Torment
  "Curée démoniaque": "spell:100903", // Demon's Quarry
  "Faille ardente": "spell:100904", // Searing Rift
  "Afflux chronique": "spell:100771", // Chronal Surge
  // Heroic raids
  "380 pièces d'ensemble héroïques": "item:87400", // Chestguard of the Lost Conqueror
  // Kael'thas's Eye (the points' texts)
  "Les 7 armes légendaires de Kael'thas, au niveau d'objet 251 et 258.":
    "item:83299", // Warp Slicer
  "Les Cendres d'Al'ar tombent toujours.": "item:32458", // Ashes of Al'ar
  "2 ensembles inédits pour chevalier de la mort : le Fléau-du-soleil.":
    "item:83311", // Sunbane Breastplate
  // World bosses (tags)
  "Surcharge du Nexus": "spell:106039", // Nexus Overload
  "Égide violette du Kirin Tor": "spell:106037", // Violet Aegis
  "Mascotte : Petit drake tellurique": "item:902001", // Ley Drakeling
  "Regard sans visage à partager": "spell:106005", // Faceless Gaze
  "Mascotte : Rejeton de saronite": "item:902000", // Saronite Spawnling
  // The Archivists
  "Tabard des Archivistes": "item:900101", // Tabard of the Archivists
  "Plume de l'Archiviste": "item:900103", // Archivist's Quill
  "Destrier de l'Archive": "item:900104", // Reins of the Archive Steed
  "Jeton d'ascension": "item:901960", // Ascension Token
  "Caveau d'Archavon": "item:43228", // Stone Keeper's Shard
  // Professions (highlights)
  "8 diamants méta des Titans": "item:900620", // Relentless Titansiege Diamond
  "Yeux de dragon bicolores et Prisme de lumière stellaire": "item:900716", // Starlight Prism
  "Figurines de 245, anneaux de 264": "item:80023", // Figurine - Majestic Zircon Wyrm
  "Colère de Thorim, Écho du sablier, Rempart de Hodir": "item:900756", // Scroll of Enchant Weapon - Thorim's Wrath
  "L'Égide du croisé": "item:900785", // Scroll of Enchant Chest - Crusader's Aegis
  "Parchemins de maître": "item:900757", // Master's Scroll of Enchant Weapon - Thorim's Wrath
  "Festins taunka, du Kirin Tor, du Repos du ver…": "item:900873", // Taunka Feast
  "Le Grand banquet kalu'ak vous déguise en rohart": "item:900879", // Great Kalu'ak Banquet
  "Plats « mémorables » de 2 heures": "item:900880", // Memorable Taunka Feast
  "Une arme de maître par palier, là où Blizzard n'en faisait aucune":
    "item:80525", // Argent Crusader's Greatsword
  "9 capes-trophées : Roi Krush, Skoll, Loque'nahak…": "item:80711", // King Krush Hide Cloak
  "Tambours de l'esprit taunka": "item:901240", // Drums of the Taunka Spirit
  "Une pièce en tisse-ébène par saison JcJ": "item:80910", // Gladiator's Ebonweave Belt
  "Broderie de rempart": "spell:102430", // Bulwark Embroidery
  "Transporteur ultra-sécurisé : Ulduar": "item:901440", // Ultrasafe Transporter: Ulduar
  "Déchiqueteur de poche gobelin, un compagnon de combat": "item:901451", // Goblin Pocket Shredder
  "11 lunettes de 245": "item:81100", // Saronite Siege Goggles
  "7 potions infinies": "item:901504", // Endless Haste Potion
  "9 pierres d'alchimiste jusqu'au niveau 264": "item:81407", // Primordial Carnage Alchemist Stone
  "Transmutation de l'Orbe gelé": "spell:102862", // Transmute: Frozen Orb
  "Une deuxième recherche quotidienne": "spell:103010", // Glyphist's Research
  "Le Codex de la guerre du Nexus": "item:81305", // Nexus-War Codex
  "4 nouvelles cartes : Titans, Tournoi, Couronne de glace, Crépuscule":
    "spell:103200", // Darkmoon Card of the Titans
  "20 bijoux épiques, de 226 à 271": "item:81500", // Darkmoon Card: Rampart
  "Sauvez 8 croisés blessés pour devenir Grand maître": "item:901940", // Argent Triage Bandage
  "Un bandage par phase, jusqu'à 9 800 points de vie": "item:901903", // Ashen Frostweave Bandage
  // Fishing
  "Poissons légendaires": "item:900952", // Old Frostfin
  "130 équipements pêchés": "item:80198", // Saronite Harpoon Head
  "La Raie des abysses": "item:900963", // Reins of the Abyssal Ray
  // Treasures
  "La carte": "item:902232", // Treasure Map of the Dragonblight
  "La fouille": "spell:103902", // Dig Up the Treasure
  "Le Grand coffre enfoui": "item:902240", // Buried Coffer
  "Kodo des caravanes": "item:902350", // Caravan Kodo
  "Destrier de la mort": "item:902351", // Deathcharger
  "Trotteur des fouilles bleu": "item:902352", // Blue Excavation Strider
  "Griffon de Falstad": "item:902353", // Falstad's Gryphon
  "Wyrm de givre de la Couronne": "item:902354", // Icecrown Frost Wyrm
  "Drake crépusculaire rubis": "item:902355", // Ruby Twilight Drake
  // Collections (highlights)
  "Le Cornet acoustique": "item:902375", // Archivist's Ear Trumpet
  "Le Masque des Chroniques": "item:902378", // Mask of the Chronicles
  "Tabards des royaumes perdus": "item:902200", // Tabard of Tranquillien
  // Economy
  "Le marché noir": "item:902300", // Consortium Membership Card
  "La loterie de Gentepression": "item:902381", // Steamwheedle Scratch Ticket
  "L'antiquaire": "item:902418", // Tarnished Vrykul Crown
  // PvP
  "Récompenses exclusives": "item:901981", // Armored Midnight Drake
  "Le tournoi des égouts": "item:901992", // Tabard of the Sewer Champion
  // Guild perks (their texts; level 3 shows the reputation perk, level 4 the hearthstone one)
  "Trésor de guerre : une part de l'or ramassé pour la banque": "spell:103620", // War Chest
  "+10 % de vitesse en monture": "spell:103622", // Northrend Roads
  "Réputation et expérience en plus": "spell:103623", // Good Standing
  "Pierre de foyer plus rapide et honneur en plus": "spell:103627", // Homeward Bound
  "Courrier instantané": "spell:103630", // Guild Courier
  "Souffle de vie : revenir à la vie avec toute sa vie": "spell:103631", // Second Breath
  "Élixirs et flacons +50 % de durée": "spell:103632", // Guild Alchemy
  "Rassemblement de la guilde": "spell:103633", // Rally
  "Résurrection collective": "spell:103634", // Rise Together
};

// names found inside longer texts of content.ts (not card titles), for inline highlighting -> tooltip ref
export const refByInlineText: Record<string, string> = {
  "Fragments de chronique": "item:900100", // Chronicle Fragment
  "Palefroi gangrené défias": "item:900212", // Reins of the Fel-Touched Defias Palfrey
  "Cauchemar de braise": "item:900320", // Reins of the Ember Nightmare
  "Éclats du gardien de pierre": "item:43228", // Stone Keeper's Shard
  "Vieille Nageoire-de-givre": "item:900952", // Old Frostfin
  "Léviathan des eaux mortes": "item:900960", // Deadwater Leviathan
  "Harpon kalu'ak": "item:80150", // Moa'ki Harpooner's Hook
  "Harpon de saronite": "item:80198", // Saronite Harpoon Head
  "Crue drakkari": "item:80174", // Totem of the Drakkari Flood
  "canne du Kirin Tor": "item:900981", // Kirin Tor Enchanted Fishing Pole
  "Gnome porte-bonheur": "item:902383", // Lucky Gnome
  "cape légendaire": "item:900311", // Cloak of Searing Mist (Molten Core, Duke Hydraxis's quest)
  "Veine de saronite murmurante": "item:900500", // Whispering Saronite (from the vein)
  "Fleur des Gardiens": "item:900511", // Keepers' Petal
  "Rose des aurores": "item:900512", // Aurora Petal
};

// icon name (as used in content.ts marquee lists collections.marquee / collections.marquee2, lowercase) -> ref
// a card's icon that pictures one item of a card about several things: the tooltip on the icon only (lowercase icon name -> ref)
export const refByCardIcon: Record<string, string> = {
  inv_mace_37: "item:900204", // Master Mason's Trowel (Deadmines), on the "Deadmines and Molten Core revisited" card
};

export const refByIcon: Record<string, string> = {
  ability_mount_spectraltiger: "item:902161", // Reins of the Azure Spirit Tiger
  ability_mount_netherdrakeelite: "item:902181", // Reins of the Dragonmaw Fel Drake
  ability_mount_drake_twilight: "item:902179", // Reins of the Violet Twilight Drake
  ability_mount_warhippogryph: "item:902182", // Reins of the Armored Violet Hippogryph
  ability_mount_kodo_02: "item:902350", // Caravan Kodo
  ability_mount_gyrocoptor: "item:902358", // Contraband Gyrocopter
  ability_mount_mechastrider: "item:902352", // Blue Excavation Strider
  ability_mount_gryphon_01: "item:902353", // Falstad's Gryphon
  ability_mount_redfrostwyrm_01: "item:902354", // Icecrown Frost Wyrm
  ability_hunter_pet_netherray: "item:900963", // Reins of the Abyssal Ray
  ability_mount_nightmarehorse: "item:900212", // Reins of the Fel-Touched Defias Palfrey
  inv_misc_qirajicrystal_04: "item:902360", // Armored Azure Qiraji Battle Tank
  inv_misc_horn_02: "item:902375", // Archivist's Ear Trumpet
  inv_mask_03: "item:902378", // Mask of the Chronicles
  inv_ammo_snowball: "item:902377", // Northrend Snow Globe
  inv_misc_bag_10: "item:902380", // Expedition Camping Kit
  inv_misc_head_gnome_01: "item:902383", // Lucky Gnome
  inv_misc_head_kobold_01: "item:902370", // Cave Scavenger
  inv_misc_head_dragon_blue: "item:902001", // Ley Drakeling
  inv_ore_saronite_01: "item:902000", // Saronite Spawnling
  inv_misc_tabardsummer01: "item:902200", // Tabard of Tranquillien
  inv_misc_ticket_darkmoon_01: "item:902381", // Steamwheedle Scratch Ticket
  inv_misc_note_04: "item:902376", // Archivists' Calling Card
  inv_misc_horn_03: "item:902379", // Peak Eagle Whistle
};

// three new spells per class, in the same order as classes.list[i].spells in content.ts: class key -> [{ ref, icon }]
export const classSpellRefs: Record<string, { ref: string; icon: string }[]> = {
  paladin: [
    { ref: "spell:100400", icon: "inv_misc_token_argentdawn" }, // Banner of the Argent Dawn
    { ref: "spell:100402", icon: "spell_holy_proclaimchampion_02" }, // Knight's Vigil
    { ref: "spell:100404", icon: "spell_holy_championsbond" }, // Oath of Protection
  ],
  priest: [
    { ref: "spell:100450", icon: "spell_holy_championsgrace" }, // Virtue of Tenacity
    { ref: "spell:100451", icon: "spell_holy_proclaimchampion" }, // Litany of Faol
    { ref: "spell:100452", icon: "spell_shadow_spectralsight" }, // Mind Fracture
  ],
  warrior: [
    { ref: "spell:100500", icon: "ability_warrior_intervene" }, // Gladiator's Rush
    { ref: "spell:100501", icon: "inv_axe_114" }, // Whirling Axe
    { ref: "spell:100510", icon: "ability_warrior_bloodbath" }, // Broxigar's Wrath
  ],
  deathknight: [
    { ref: "spell:100600", icon: "achievement_boss_lanathel" }, // Shadows of the San'layn
    { ref: "spell:100610", icon: "spell_fire_bluehellfire" }, // Frozen Wake
    { ref: "spell:100620", icon: "inv_jewelcrafting_shadowspirit_02" }, // Vile Spirits
  ],
  druid: [
    { ref: "spell:100650", icon: "spell_nature_brilliance" }, // Starseed
    { ref: "spell:100653", icon: "ability_druid_catformattack" }, // Predator's Leaps
    { ref: "spell:100652", icon: "inv_misc_pelt_bear_01" }, // Ursoc's Hide
    { ref: "spell:100654", icon: "inv_enchant_dustdream" }, // Grove Wisp
  ],
  hunter: [
    { ref: "spell:100700", icon: "ability_mount_spectraltiger" }, // Wild Echo
    { ref: "spell:100702", icon: "inv_weapon_rifle_21" }, // Nesingwary's Trophy Shot
    { ref: "spell:100703", icon: "inv_mask_02" }, // Trapper's Decoy
  ],
  mage: [
    { ref: "spell:100750", icon: "inv_misc_orb_04" }, // Celestial Singularity
    { ref: "spell:100751", icon: "spell_fire_rune" }, // Scorched Earth
    { ref: "spell:100752", icon: "inv_misc_frostemblem_01" }, // Winter's Mark
  ],
  rogue: [
    { ref: "spell:100800", icon: "ability_rogue_stayofexecution" }, // Ravenholdt Contract
    { ref: "spell:100801", icon: "inv_throwingknife_01" }, // Ricochet Knife
    { ref: "spell:100802", icon: "ability_rogue_disguise" }, // Shadow Double
  ],
  shaman: [
    { ref: "spell:100850", icon: "inv_elemental_primal_air" }, // Stormgust
    { ref: "spell:100853", icon: "spell_nature_elementalprecision_2" }, // Al'Akir's Fury
    { ref: "spell:100855", icon: "inv_elemental_mote_water01" }, // Undertow
  ],
  warlock: [
    { ref: "spell:100900", icon: "spell_shadow_lastingafflictions" }, // Chains of Torment
    { ref: "spell:100903", icon: "ability_warlock_demonicpower" }, // Demon's Quarry
    { ref: "spell:100904", icon: "spell_fire_felflamering" }, // Searing Rift
  ],
};

// Chronal Surge / Afflux chronique (mage raid haste)
export const surgeRef = "spell:100771";
// Void Sabre: the Ulduar epic and its Artifact copy
export const voidSabre = { epic: "item:46036", artifact: "item:646036" };
