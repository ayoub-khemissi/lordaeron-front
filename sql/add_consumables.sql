-- Consumables (Ayoub, 13/10/2026): Rimeheart's Vials of Insight (lordaeron-core-lab contrib/wotlk-plus content/xp-potions.js, items 902530-902532):
-- experience from kills and quests +50% for 6, 12 or 24 hours of play (paused while logged out), tradeable and sold at the auction house.
-- The shop sells them once every level 80 realm first (each race, each class) is earned on the realm (lib/realm-unlocks.ts).
-- Prices in Soul Shards (100 = 1 EUR): 150, 250, 400. Re-runnable.

ALTER TABLE shop_items MODIFY category
  ENUM('services','bags','heirlooms','transmog','mounts','tabards','pets','toys','consumables') COLLATE utf8mb4_unicode_ci NOT NULL;

INSERT INTO shop_items (category, item_id, name_en, name_fr, name_es, name_de, name_it, description_en, description_fr, description_es,
  description_de, description_it, price, realm_ids, faction, icon_url, quality, is_highlighted, is_active, is_refundable, min_level, sort_order)
VALUES
('consumables', 902530, 'Minor Vial of Insight', 'Fiole de perspicacité mineure', 'Vial de perspicacia menor', 'Schwaches Fläschchen der Einsicht', 'Fiala della perspicacia minore',
 'Experience +50% (monsters and quests) for 6 hours of play, paused while logged out. Distilled by Dalaran''s alchemists. Tradeable.',
 'Expérience +50 % (monstres et quêtes) pendant 6 heures de jeu, en pause quand vous êtes déconnecté. Distillée par les alchimistes de Dalaran. Échangeable.',
 'Experiencia +50% (monstruos y misiones) durante 6 horas de juego, en pausa mientras estés desconectado. Destilado por los alquimistas de Dalaran. Comerciable.',
 'Erfahrung +50% (Monster und Quests) für 6 Spielstunden, pausiert, solange Ihr abgemeldet seid. Von den Alchemisten Dalarans destilliert. Handelbar.',
 'Esperienza +50% (mostri e missioni) per 6 ore di gioco, in pausa quando sei disconnesso. Distillata dagli alchimisti di Dalaran. Scambiabile.',
 150, JSON_ARRAY(4), 'both', 'https://wow.zamimg.com/images/wow/icons/large/inv_alchemy_elixir_02.jpg', 1, 0, 1, 1, 0, 900),
('consumables', 902531, 'Vial of Insight', 'Fiole de perspicacité', 'Vial de perspicacia', 'Fläschchen der Einsicht', 'Fiala della perspicacia',
 'Experience +50% (monsters and quests) for 12 hours of play, paused while logged out. Distilled by Dalaran''s alchemists. Tradeable.',
 'Expérience +50 % (monstres et quêtes) pendant 12 heures de jeu, en pause quand vous êtes déconnecté. Distillée par les alchimistes de Dalaran. Échangeable.',
 'Experiencia +50% (monstruos y misiones) durante 12 horas de juego, en pausa mientras estés desconectado. Destilado por los alquimistas de Dalaran. Comerciable.',
 'Erfahrung +50% (Monster und Quests) für 12 Spielstunden, pausiert, solange Ihr abgemeldet seid. Von den Alchemisten Dalarans destilliert. Handelbar.',
 'Esperienza +50% (mostri e missioni) per 12 ore di gioco, in pausa quando sei disconnesso. Distillata dagli alchimisti di Dalaran. Scambiabile.',
 250, JSON_ARRAY(4), 'both', 'https://wow.zamimg.com/images/wow/icons/large/inv_alchemy_elixir_06.jpg', 2, 0, 1, 1, 0, 901),
('consumables', 902532, 'Greater Vial of Insight', 'Fiole de grande perspicacité', 'Vial de perspicacia superior', 'Großes Fläschchen der Einsicht', 'Fiala della perspicacia superiore',
 'Experience +50% (monsters and quests) for 24 hours of play, paused while logged out. Distilled by Dalaran''s alchemists. Tradeable.',
 'Expérience +50 % (monstres et quêtes) pendant 24 heures de jeu, en pause quand vous êtes déconnecté. Distillée par les alchimistes de Dalaran. Échangeable.',
 'Experiencia +50% (monstruos y misiones) durante 24 horas de juego, en pausa mientras estés desconectado. Destilado por los alquimistas de Dalaran. Comerciable.',
 'Erfahrung +50% (Monster und Quests) für 24 Spielstunden, pausiert, solange Ihr abgemeldet seid. Von den Alchemisten Dalarans destilliert. Handelbar.',
 'Esperienza +50% (mostri e missioni) per 24 ore di gioco, in pausa quando sei disconnesso. Distillata dagli alchimisti di Dalaran. Scambiabile.',
 400, JSON_ARRAY(4), 'both', 'https://wow.zamimg.com/images/wow/icons/large/inv_potion_110.jpg', 3, 0, 1, 1, 0, 902)
AS v ON DUPLICATE KEY UPDATE category = v.category, name_en = v.name_en, name_fr = v.name_fr, name_es = v.name_es, name_de = v.name_de,
  name_it = v.name_it, description_en = v.description_en, description_fr = v.description_fr, description_es = v.description_es,
  description_de = v.description_de, description_it = v.description_it, realm_ids = v.realm_ids, icon_url = v.icon_url, quality = v.quality;
