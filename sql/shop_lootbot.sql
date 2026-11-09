-- The Reprogrammed Collect-a-tron in the shop (Ayoub, 09/11/2026): the WotLK+ loot-bot companion (item 902660, epic, teaches spell 107050
-- which summons creature 191860; lordaeron-core contrib/wotlk-plus/content/lootbot.js). The Archivists sell it in game for 40 Chronicle
-- Fragments; the shop for 600 soul shards, the price of the realm's other custom companions (Pocket Ethereal, Mini Grokk).
--
-- Needs sql/shop_items_more_locales.sql first (its Russian, Polish and Portuguese columns).
-- Inserted inactive (hidden from the shop, listed in the admin's items): released by switching it on, below. Re-runnable: a second run
-- refreshes its texts, price and realms but never its is_active (a released article stays released).
--
-- Its realms: Rimeheart (4) now; Lordaeron (1) once Lordaeron's client patch has it: @realms = '[1, 4]' below (a re-run sets the realms
-- from it), or the UPDATE at the end of this header.
-- Its 3D view needs nothing here: the shop's dressing room draws a companion from its item's summon spell (lib/dressing-room.ts), the
-- realm's scaled copy of Blizzard's Collect-a-tron display (27577) converted by scripts/modelviewer-custom.py in the nightly deploy.
--
-- Release (Rimeheart):   UPDATE shop_items SET is_active = 1 WHERE item_id = 902660;
-- Later (Lordaeron too): UPDATE shop_items SET realm_ids = JSON_ARRAY(1, 4) WHERE item_id = 902660;

SET NAMES utf8mb4;
SET @realms = '[4]';

INSERT INTO shop_items (
  category, service_type, item_id,
  name_en, name_fr, name_es, name_de, name_it, name_ru, name_pl, name_pt,
  description_en, description_fr, description_es, description_de, description_it, description_ru, description_pl, description_pt,
  price, discount_percentage, realm_ids, race_ids, class_ids, faction,
  icon_url, quality, is_highlighted, is_active, is_refundable, min_level, sort_order
) VALUES (
  'pets', NULL, 902660,
  'Reprogrammed Collect-a-tron',
  'Collect-o-tron reprogrammé',
  'Recolect-a-trón reprogramado',
  'Umprogrammierter Samm-lo-Mat',
  'Raccogli-tron riprogrammato',
  'Перепрограммированный собериметр',
  'Przeprogramowany Collect-a-tron',
  'Recolhe-tron reprogramado',

'Chronicle Collector: an epic companion that loots the corpses around you for you.

At Fizzcrank Airstrip in the Borean Tundra, Gearmaster Mechazod''s 55-D Collect-a-trons gathered scrap for their master. The gnomes reprogrammed one, but only for a while. The Archivist Order''s reprogramming is permanent: it now collects for its owner, for every fallen foe carries a page of history.

How it works:
• Out of combat, it trots to the corpses within 30 yards and loots them for you.
• It follows your own loot rules: in a group it never takes what is rolled for or handed out by the master looter, it respects round robin, and it picks up quest items.
• Coins are shared with your group, just as when you loot them yourself.
• Bags full: the item stays on the corpse and it tells you once. Nothing is mailed.
• It does not open chests, skin or gather.
• Speak to it to switch it on or off, choose what it picks up (all items, no poor items, or uncommon and better) and whether it takes coins.

In game, the Archivists also sell it for 40 Chronicle Fragments.',

'Collecteur de chroniques : une mascotte épique qui fouille pour vous les corps autour de vous.

À la Piste d''atterrissage de Spumelevier, dans la Toundra Boréenne, les Collect-o-trons 55-D du Maître des rouages Mécazod ramassaient la ferraille pour leur maître. Les gnomes en ont reprogrammé un, mais pour un temps seulement. La reprogrammation de l''Ordre des Archivistes, elle, est définitive : il collecte désormais pour son propriétaire, car chaque ennemi vaincu porte une page d''histoire.

Comment il fonctionne :
• Hors combat, il trottine jusqu''aux corps à moins de 30 mètres et les fouille pour vous.
• Il suit vos propres règles de butin : en groupe, il ne prend jamais ce qui est tiré au dé ou attribué par le responsable du butin, il respecte le chacun son tour et ramasse les objets de quête.
• Les pièces sont partagées avec votre groupe, comme lorsque vous fouillez vous-même.
• Sacs pleins : l''objet reste sur le corps et il vous prévient une fois. Rien n''est envoyé par courrier.
• Il n''ouvre pas les coffres, ne dépèce pas et ne récolte pas.
• Parlez-lui pour l''activer ou le désactiver, choisir ce qu''il ramasse (tous les objets, sans les objets médiocres, ou inhabituels et mieux) et s''il prend les pièces.

En jeu, les Archivistes le vendent aussi pour 40 Fragments de chronique.',

'Recolector de crónicas: un compañero épico que despoja por ti los cadáveres a tu alrededor.

En la Pista de Aterrizaje de Palanqueta, en la Tundra Boreal, los Recolect-a-trones 55-D del Maestro de palancas Mecazod recogían chatarra para su amo. Los gnomos reprogramaron uno, pero solo por un tiempo. La reprogramación de la Orden de los Archiveros es permanente: ahora recolecta para su dueño, porque cada enemigo caído lleva una página de la historia.

Cómo funciona:
• Fuera de combate, trota hasta los cadáveres a menos de 30 metros y los despoja por ti.
• Sigue tus propias reglas de botín: en grupo nunca toma lo que se sortea ni lo que reparte el maestro despojador, respeta el despojo por turnos y recoge los objetos de misión.
• Las monedas se reparten con tu grupo, igual que cuando despojas tú.
• Bolsas llenas: el objeto se queda en el cadáver y te avisa una vez. No se envía nada por correo.
• No abre cofres, no despelleja ni recolecta.
• Habla con él para activarlo o desactivarlo, elegir qué recoge (todos los objetos, sin objetos pobres, o poco comunes y mejores) y si recoge monedas.

En el juego, los Archiveros también lo venden por 40 Fragmentos de crónica.',

'Chroniksammler: ein epischer Begleiter, der die Leichen um dich herum für dich plündert.

Auf der Landebahn Kurbelzisch in der Boreanischen Tundra sammelten die Samm-lo-Mats 55-D von Ritzelmeister Mechazod Schrott für ihren Meister. Die Gnome programmierten einen davon um, doch nur für kurze Zeit. Die Umprogrammierung des Ordens der Archivare ist dauerhaft: Er sammelt nun für seinen Besitzer, denn jeder besiegte Feind trägt eine Seite der Geschichte.

So funktioniert er:
• Außerhalb des Kampfes trabt er zu den Leichen im Umkreis von 30 Metern und plündert sie für dich.
• Er folgt deinen eigenen Plünderregeln: In einer Gruppe nimmt er nie, was ausgewürfelt oder vom Plündermeister verteilt wird, er hält sich an „Reihum“ und hebt Questgegenstände auf.
• Münzen werden mit deiner Gruppe geteilt, genau wie wenn du selbst plünderst.
• Taschen voll: Der Gegenstand bleibt auf der Leiche, und er sagt es dir einmal. Nichts wird per Post verschickt.
• Er öffnet keine Truhen, kürschnert nicht und sammelt keine Rohstoffe.
• Sprich ihn an, um ihn ein- oder auszuschalten, zu wählen, was er aufhebt (alle Gegenstände, keine schlechten Gegenstände oder selten und besser), und ob er Münzen nimmt.

Im Spiel verkaufen ihn auch die Archivare für 40 Chronikfragmente.',

'Collezionista di cronache: una mascotte epica che saccheggia per te i corpi intorno a te.

Alla Pista d''atterraggio di Fizzcrank, nella Tundra Boreale, i Raccogli-tron 55-D del Maestro degli Ingranaggi Mechazod raccoglievano rottami per il loro padrone. Gli gnomi ne riprogrammarono uno, ma solo per un po''. La riprogrammazione dell''Ordine degli Archivisti invece è permanente: ora raccoglie per il suo proprietario, perché ogni nemico caduto porta con sé una pagina di storia.

Come funziona:
• Fuori dal combattimento, trotterella fino ai corpi entro 30 metri e li saccheggia per te.
• Segue le tue regole di bottino: in gruppo non prende mai ciò che viene tirato ai dadi o assegnato dal responsabile del bottino, rispetta il turno a rotazione e raccoglie gli oggetti delle missioni.
• Le monete vengono divise con il gruppo, come quando saccheggi tu.
• Borse piene: l''oggetto resta sul corpo e te lo dice una volta. Nulla viene spedito per posta.
• Non apre forzieri, non scuoia e non raccoglie risorse.
• Parlagli per attivarlo o disattivarlo, scegliere cosa raccoglie (tutti gli oggetti, niente oggetti scadenti, oppure non comuni e superiori) e se prende le monete.

In gioco, anche gli Archivisti lo vendono per 40 Frammenti di cronaca.',

'Собиратель хроник: эпический спутник, который обыскивает за вас тела вокруг.

На взлетной полосе Выкрутеня в Борейской тундре собериметры 55-D механизатора Механозода собирали металлолом для своего хозяина. Гномы перепрограммировали одного из них, но лишь на время. Перепрограммирование Ордена архивариусов — навсегда: теперь он собирает для своего владельца, ведь каждый павший враг хранит страницу истории.

Как он работает:
• Вне боя он подбегает к телам в радиусе 30 метров и обыскивает их за вас.
• Он следует вашим правилам добычи: в группе он никогда не берет то, что разыгрывается или распределяется ответственным за добычу, соблюдает очередность и подбирает предметы для заданий.
• Деньги делятся с группой, как если бы вы обыскивали тела сами.
• Сумки полны: предмет остается на теле, и он предупредит вас один раз. Ничего не отправляется по почте.
• Он не открывает сундуки, не снимает шкуры и не собирает ресурсы.
• Поговорите с ним, чтобы включить или выключить его, выбрать, что он подбирает (все предметы, без предметов низкого качества или от необычного и выше), и берет ли он деньги.

В игре его также продают Архивариусы за 40 фрагментов хроники.',

'Zbieracz kronik: epicki towarzysz, który przeszukuje za ciebie ciała wokół ciebie.

Na Fizzcrank Airstrip w Borean Tundra Collect-a-trony 55-D Gearmastera Mechazoda zbierały złom dla swojego pana. Gnomy przeprogramowały jednego z nich, ale tylko na jakiś czas. Przeprogramowanie Zakonu Archiwistów jest trwałe: teraz zbiera dla swojego właściciela, bo każdy pokonany wróg nosi w sobie stronę historii.

Jak działa:
• Poza walką podbiega do ciał w promieniu 30 jardów i przeszukuje je za ciebie.
• Przestrzega twoich zasad łupów: w grupie nigdy nie bierze tego, o co się losuje ani co rozdziela master looter, przestrzega kolejki (round robin) i podnosi przedmioty do zadań.
• Monety są dzielone z twoją grupą, tak jak gdy sam przeszukujesz ciała.
• Pełne torby: przedmiot zostaje na ciele, a on powie ci o tym raz. Nic nie jest wysyłane pocztą.
• Nie otwiera skrzyń, nie oprawia skór i nie zbiera surowców.
• Porozmawiaj z nim, aby go włączyć lub wyłączyć, wybrać, co podnosi (wszystkie przedmioty, bez przedmiotów słabej jakości albo niepospolite i lepsze), i czy zbiera monety.

W grze sprzedają go też Archiwiści za 40 Fragmentów Kroniki.',

'Colecionador de crónicas: uma mascote épica que saqueia por ti os corpos à tua volta.

Na Pista de Aterragem de Fizzcrank, na Tundra Boreal, os Recolhe-trons 55-D do Mestre das Engrenagens Mechazod recolhiam sucata para o seu mestre. Os gnomos reprogramaram um deles, mas só por algum tempo. A reprogramação da Ordem dos Arquivistas é permanente: agora recolhe para o seu dono, pois cada inimigo derrotado traz consigo uma página da história.

Como funciona:
• Fora de combate, trota até aos corpos num raio de 30 metros e saqueia-os por ti.
• Segue as tuas próprias regras de saque: em grupo nunca leva o que vai a sorteio nem o que o mestre do saque distribui, respeita a vez de cada um e apanha os objetos de missão.
• As moedas são divididas com o teu grupo, tal como quando saqueias tu mesmo.
• Sacos cheios: o objeto fica no corpo e ele avisa-te uma vez. Nada é enviado por correio.
• Não abre arcas, não esfola nem recolhe recursos.
• Fala com ele para o ligar ou desligar, escolher o que apanha (todos os objetos, sem objetos fracos, ou invulgares e melhores) e se apanha moedas.

No jogo, os Arquivistas também o vendem por 40 Fragmentos de Crónica.',

  600, 0, @realms, NULL, NULL, 'both',
  'https://wow.zamimg.com/images/wow/icons/large/inv_gizmo_02.jpg', 4, 0, 0, 1, 0, 1076
) AS new
ON DUPLICATE KEY UPDATE
  category = new.category,
  name_en = new.name_en, name_fr = new.name_fr, name_es = new.name_es, name_de = new.name_de,
  name_it = new.name_it, name_ru = new.name_ru, name_pl = new.name_pl, name_pt = new.name_pt,
  description_en = new.description_en, description_fr = new.description_fr, description_es = new.description_es,
  description_de = new.description_de, description_it = new.description_it, description_ru = new.description_ru,
  description_pl = new.description_pl, description_pt = new.description_pt,
  price = new.price, realm_ids = new.realm_ids, faction = new.faction,
  icon_url = new.icon_url, quality = new.quality, is_refundable = new.is_refundable;
