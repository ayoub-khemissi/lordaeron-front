-- Character Services: Appearance, Rename, Race Change, Faction Change
-- Prices in Soul Shards: 250, 350, 500, 650

INSERT INTO `shop_items` (
  `category`, `service_type`, `item_id`,
  `name_en`, `name_fr`, `name_es`, `name_de`, `name_it`,
  `description_en`, `description_fr`, `description_es`, `description_de`, `description_it`,
  `price`, `discount_percentage`, `realm_ids`, `race_ids`, `class_ids`, `faction`,
  `icon_url`, `quality`, `is_highlighted`, `is_active`, `is_refundable`, `min_level`, `sort_order`
) VALUES
-- Character Rename
(
  'services', 'name_change', NULL,
  'Character Rename', 'Changement de nom', 'Cambio de nombre', 'Namensänderung', 'Cambio nome',
  'Change your character''s name. The change will take effect at the next login.',
  'Changez le nom de votre personnage. Le changement prendra effet à la prochaine connexion.',
  'Cambia el nombre de tu personaje. El cambio se aplicará en el próximo inicio de sesión.',
  'Ändere den Namen deines Charakters. Die Änderung wird beim nächsten Login wirksam.',
  'Cambia il nome del tuo personaggio. La modifica avrà effetto al prossimo accesso.',
  350, 0, NULL, NULL, NULL, 'both',
  'https://wow.zamimg.com/images/wow/icons/large/inv_scroll_03.jpg',
  NULL, 0, 1, 0, 0, 10
),
-- Race Change
(
  'services', 'race_change', NULL,
  'Race Change', 'Changement de race', 'Cambio de raza', 'Rassenwechsel', 'Cambio razza',
  'Change your character''s race within the same faction. The change will take effect at the next login.',
  'Changez la race de votre personnage au sein de la même faction. Le changement prendra effet à la prochaine connexion.',
  'Cambia la raza de tu personaje dentro de la misma facción. El cambio se aplicará en el próximo inicio de sesión.',
  'Ändere die Rasse deines Charakters innerhalb derselben Fraktion. Die Änderung wird beim nächsten Login wirksam.',
  'Cambia la razza del tuo personaggio all''interno della stessa fazione. La modifica avrà effetto al prossimo accesso.',
  500, 0, NULL, NULL, NULL, 'both',
  'https://wow.zamimg.com/images/wow/icons/large/achievement_character_orc_male.jpg',
  NULL, 0, 1, 0, 0, 20
),
-- Faction Change
(
  'services', 'faction_change', NULL,
  'Faction Change', 'Changement de faction', 'Cambio de facción', 'Fraktionswechsel', 'Cambio fazione',
  'Transfer your character to the opposite faction. The change will take effect at the next login.',
  'Transférez votre personnage vers la faction opposée. Le changement prendra effet à la prochaine connexion.',
  'Transfiere tu personaje a la facción opuesta. El cambio se aplicará en el próximo inicio de sesión.',
  'Übertrage deinen Charakter zur gegnerischen Fraktion. Die Änderung wird beim nächsten Login wirksam.',
  'Trasferisci il tuo personaggio alla fazione opposta. La modifica avrà effetto al prossimo accesso.',
  650, 0, NULL, NULL, NULL, 'both',
  'https://wow.zamimg.com/images/wow/icons/large/spell_shadow_charm.jpg',
  NULL, 0, 1, 0, 0, 30
),
-- Appearance Change
(
  'services', 'appearance_change', NULL,
  'Appearance Change', 'Changement d''apparence', 'Cambio de apariencia', 'Aussehensänderung', 'Cambio aspetto',
  'Change your character''s hairstyle, hair color, facial features and skin color. The change will take effect at the next login.',
  'Changez la coiffure, la couleur des cheveux, les traits du visage et la couleur de peau de votre personnage. Le changement prendra effet à la prochaine connexion.',
  'Cambia el peinado, color de pelo, rasgos faciales y color de piel de tu personaje. El cambio se aplicará en el próximo inicio de sesión.',
  'Ändere Frisur, Haarfarbe, Gesichtszüge und Hautfarbe deines Charakters. Die Änderung wird beim nächsten Login wirksam.',
  'Cambia acconciatura, colore dei capelli, tratti del viso e colore della pelle del tuo personaggio. La modifica avrà effetto al prossimo accesso.',
  250, 0, NULL, NULL, NULL, 'both',
  'https://wow.zamimg.com/images/wow/icons/large/ability_rogue_disguise.jpg',
  NULL, 0, 1, 0, 0, 5
);
