-- The Reprogrammed Collect-a-tron in the shop (Ayoub, 09/11/2026; its calibration Mark I to V the same day): the WotLK+ loot-bot companion (item 902660, epic, teaches spell 107050
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
• Out of combat, it trots to the corpses around you (30 yards, up to 50 once calibrated) and loots them for you.
• It follows your own loot rules: in a group it never takes what is rolled for or handed out by the master looter, it respects round robin, and it picks up quest items.
• Coins are shared with your group, just as when you loot them yourself.
• Bags full: the item stays on the corpse and it tells you once (from Mark V, its hold keeps it). Nothing is mailed.
• It does not open chests, skin or gather.
• Speak to it, or type /collectotron, to open its own window: on or off, what it picks up (all items, no poor items, or uncommon and better), coins, its calibration and its hold.

Calibration, from Mark I to Mark V:
• The Archivists'' modules upgrade it, paid in game with Chronicle Fragments: Mark II 15, Mark III 30, Mark IV 45, Mark V 60. One calibration for your whole account.
• Every Mark makes it faster (up to 180%), reach farther (up to 50 yards) and loot more corpses at each stop (all of those around it at Mark V).
• Mark III: it keeps collecting while you ride a ground mount.
• Mark IV: it sells the poor items it collects on the spot.
• Mark V: a 12-slot hold keeps what your full bags cannot take.
• Each upgrade plays a level-up and gives it its new name, up to Collect-a-tron Mark V.
• Bought here, it starts at Mark I, like everyone''s: the modules are earned in game only.

In game, the Archivists also sell it for 40 Chronicle Fragments.',

'Collecteur de chroniques : une mascotte épique qui fouille pour vous les corps autour de vous.

À la Piste d''atterrissage de Spumelevier, dans la Toundra Boréenne, les Collect-o-trons 55-D du Maître des rouages Mécazod ramassaient la ferraille pour leur maître. Les gnomes en ont reprogrammé un, mais pour un temps seulement. La reprogrammation de l''Ordre des Archivistes, elle, est définitive : il collecte désormais pour son propriétaire, car chaque ennemi vaincu porte une page d''histoire.

Comment il fonctionne :
• Hors combat, il trottine jusqu''aux corps autour de vous (30 mètres, jusqu''à 50 une fois calibré) et les fouille pour vous.
• Il suit vos propres règles de butin : en groupe, il ne prend jamais ce qui est tiré au dé ou attribué par le responsable du butin, il respecte le chacun son tour et ramasse les objets de quête.
• Les pièces sont partagées avec votre groupe, comme lorsque vous fouillez vous-même.
• Sacs pleins : l''objet reste sur le corps et il vous prévient une fois (dès le Mark V, sa soute le garde). Rien n''est envoyé par courrier.
• Il n''ouvre pas les coffres, ne dépèce pas et ne récolte pas.
• Parlez-lui, ou tapez /collectotron, pour ouvrir sa propre fenêtre : marche ou arrêt, ce qu''il ramasse (tous les objets, sans les objets médiocres, ou inhabituels et mieux), les pièces, sa calibration et sa soute.

Calibration, du Mark I au Mark V :
• Les modules des Archivistes l''améliorent, payés en jeu en Fragments de chronique : Mark II 15, Mark III 30, Mark IV 45, Mark V 60. Une seule calibration pour tout votre compte.
• Chaque Mark le rend plus rapide (jusqu''à 180 %), lui fait porter plus loin (jusqu''à 50 mètres) et fouiller plus de corps à chaque arrêt (tous ceux qui l''entourent au Mark V).
• Mark III : il continue de ramasser quand vous êtes sur une monture terrestre.
• Mark IV : il revend sur place les objets médiocres qu''il ramasse.
• Mark V : une soute de 12 emplacements garde ce que vos sacs pleins ne peuvent pas prendre.
• Chaque amélioration joue une montée de niveau et lui donne son nouveau nom, jusqu''au Collect-o-tron Mark V.
• Acheté ici, il démarre au Mark I comme celui de tout le monde : les modules se gagnent uniquement en jeu.

En jeu, les Archivistes le vendent aussi pour 40 Fragments de chronique.',

'Recolector de crónicas: un compañero épico que despoja por ti los cadáveres a tu alrededor.

En la Pista de Aterrizaje de Palanqueta, en la Tundra Boreal, los Recolect-a-trones 55-D del Maestro de palancas Mecazod recogían chatarra para su amo. Los gnomos reprogramaron uno, pero solo por un tiempo. La reprogramación de la Orden de los Archiveros es permanente: ahora recolecta para su dueño, porque cada enemigo caído lleva una página de la historia.

Cómo funciona:
• Fuera de combate, trota hasta los cadáveres a tu alrededor (30 metros, hasta 50 una vez calibrado) y los despoja por ti.
• Sigue tus propias reglas de botín: en grupo nunca toma lo que se sortea ni lo que reparte el maestro despojador, respeta el despojo por turnos y recoge los objetos de misión.
• Las monedas se reparten con tu grupo, igual que cuando despojas tú.
• Bolsas llenas: el objeto se queda en el cadáver y te avisa una vez (desde el Mark V, su compartimento lo guarda). No se envía nada por correo.
• No abre cofres, no despelleja ni recolecta.
• Habla con él, o escribe /collectotron, para abrir su propia ventana: activado o no, qué recoge (todos los objetos, sin objetos pobres, o poco comunes y mejores), las monedas, su calibración y su compartimento.

Calibración, del Mark I al Mark V:
• Los módulos de los Archiveros lo mejoran, pagados en el juego con Fragmentos de crónica: Mark II 15, Mark III 30, Mark IV 45, Mark V 60. Una sola calibración para toda tu cuenta.
• Cada Mark lo hace más rápido (hasta un 180 %), llegar más lejos (hasta 50 metros) y despojar más cadáveres en cada parada (todos los que lo rodean en el Mark V).
• Mark III: sigue recogiendo cuando vas en una montura terrestre.
• Mark IV: vende en el acto los objetos pobres que recoge.
• Mark V: un compartimento de 12 huecos guarda lo que tus bolsas llenas no pueden llevar.
• Cada mejora muestra una subida de nivel y le da su nuevo nombre, hasta el Recolect-a-trón Mark V.
• Comprado aquí, empieza en el Mark I como el de todos: los módulos solo se consiguen en el juego.

En el juego, los Archiveros también lo venden por 40 Fragmentos de crónica.',

'Chroniksammler: ein epischer Begleiter, der die Leichen um dich herum für dich plündert.

Auf der Landebahn Kurbelzisch in der Boreanischen Tundra sammelten die Samm-lo-Mats 55-D von Ritzelmeister Mechazod Schrott für ihren Meister. Die Gnome programmierten einen davon um, doch nur für kurze Zeit. Die Umprogrammierung des Ordens der Archivare ist dauerhaft: Er sammelt nun für seinen Besitzer, denn jeder besiegte Feind trägt eine Seite der Geschichte.

So funktioniert er:
• Außerhalb des Kampfes trabt er zu den Leichen um dich herum (30 Meter, bis zu 50 nach der Kalibrierung) und plündert sie für dich.
• Er folgt deinen eigenen Plünderregeln: In einer Gruppe nimmt er nie, was ausgewürfelt oder vom Plündermeister verteilt wird, er hält sich an „Reihum“ und hebt Questgegenstände auf.
• Münzen werden mit deiner Gruppe geteilt, genau wie wenn du selbst plünderst.
• Taschen voll: Der Gegenstand bleibt auf der Leiche, und er sagt es dir einmal (ab Mark V bewahrt ihn sein Laderaum auf). Nichts wird per Post verschickt.
• Er öffnet keine Truhen, kürschnert nicht und sammelt keine Rohstoffe.
• Sprich ihn an oder tippe /collectotron, um sein eigenes Fenster zu öffnen: an oder aus, was er aufhebt (alle Gegenstände, keine schlechten Gegenstände oder selten und besser), Münzen, seine Kalibrierung und sein Laderaum.

Kalibrierung, von Mark I bis Mark V:
• Die Module der Archivare rüsten ihn auf, im Spiel mit Chronikfragmenten bezahlt: Mark II 15, Mark III 30, Mark IV 45, Mark V 60. Eine Kalibrierung für deinen ganzen Account.
• Jede Mark macht ihn schneller (bis zu 180 %), lässt ihn weiter reichen (bis zu 50 Meter) und bei jedem Halt mehr Leichen plündern (bei Mark V alle um ihn herum).
• Mark III: Er sammelt weiter, während du ein Bodenreittier reitest.
• Mark IV: Er verkauft die gesammelten schlechten Gegenstände an Ort und Stelle.
• Mark V: Ein Laderaum mit 12 Plätzen bewahrt auf, was deine vollen Taschen nicht aufnehmen können.
• Jede Aufrüstung zeigt einen Stufenaufstieg und gibt ihm seinen neuen Namen, bis zum Samm-lo-Mat Mark V.
• Hier gekauft, beginnt er wie jeder andere bei Mark I: Die Module gibt es nur im Spiel.

Im Spiel verkaufen ihn auch die Archivare für 40 Chronikfragmente.',

'Collezionista di cronache: una mascotte epica che saccheggia per te i corpi intorno a te.

Alla Pista d''atterraggio di Fizzcrank, nella Tundra Boreale, i Raccogli-tron 55-D del Maestro degli Ingranaggi Mechazod raccoglievano rottami per il loro padrone. Gli gnomi ne riprogrammarono uno, ma solo per un po''. La riprogrammazione dell''Ordine degli Archivisti invece è permanente: ora raccoglie per il suo proprietario, perché ogni nemico caduto porta con sé una pagina di storia.

Come funziona:
• Fuori dal combattimento, trotterella fino ai corpi intorno a te (30 metri, fino a 50 una volta calibrato) e li saccheggia per te.
• Segue le tue regole di bottino: in gruppo non prende mai ciò che viene tirato ai dadi o assegnato dal responsabile del bottino, rispetta il turno a rotazione e raccoglie gli oggetti delle missioni.
• Le monete vengono divise con il gruppo, come quando saccheggi tu.
• Borse piene: l''oggetto resta sul corpo e te lo dice una volta (dal Mark V lo custodisce la sua stiva). Nulla viene spedito per posta.
• Non apre forzieri, non scuoia e non raccoglie risorse.
• Parlagli, o digita /collectotron, per aprire la sua finestra: acceso o spento, cosa raccoglie (tutti gli oggetti, niente oggetti scadenti, oppure non comuni e superiori), le monete, la sua calibrazione e la sua stiva.

Calibrazione, dal Mark I al Mark V:
• I moduli degli Archivisti lo potenziano, pagati in gioco con Frammenti di cronaca: Mark II 15, Mark III 30, Mark IV 45, Mark V 60. Una sola calibrazione per tutto il tuo account.
• Ogni Mark lo rende più veloce (fino al 180%), gli fa raggiungere corpi più lontani (fino a 50 metri) e saccheggiare più corpi a ogni sosta (tutti quelli intorno a lui al Mark V).
• Mark III: continua a raccogliere mentre cavalchi una cavalcatura terrestre.
• Mark IV: vende sul posto gli oggetti scadenti che raccoglie.
• Mark V: una stiva da 12 posti custodisce ciò che le tue borse piene non possono prendere.
• Ogni potenziamento mostra un salto di livello e gli dà il suo nuovo nome, fino al Raccogli-tron Mark V.
• Acquistato qui, parte dal Mark I come quello di tutti: i moduli si ottengono solo in gioco.

In gioco, anche gli Archivisti lo vendono per 40 Frammenti di cronaca.',

'Собиратель хроник: эпический спутник, который обыскивает за вас тела вокруг.

На взлетной полосе Выкрутеня в Борейской тундре собериметры 55-D механизатора Механозода собирали металлолом для своего хозяина. Гномы перепрограммировали одного из них, но лишь на время. Перепрограммирование Ордена архивариусов — навсегда: теперь он собирает для своего владельца, ведь каждый павший враг хранит страницу истории.

Как он работает:
• Вне боя он подбегает к телам вокруг вас (30 метров, до 50 после калибровки) и обыскивает их за вас.
• Он следует вашим правилам добычи: в группе он никогда не берет то, что разыгрывается или распределяется ответственным за добычу, соблюдает очередность и подбирает предметы для заданий.
• Деньги делятся с группой, как если бы вы обыскивали тела сами.
• Сумки полны: предмет остается на теле, и он предупредит вас один раз (с модели V его сохранит отсек). Ничего не отправляется по почте.
• Он не открывает сундуки, не снимает шкуры и не собирает ресурсы.
• Поговорите с ним или введите /collectotron, чтобы открыть его окно: включение, что он подбирает (все предметы, без предметов низкого качества или от необычного и выше), деньги, калибровка и отсек.

Калибровка, от модели I до модели V:
• Модули архивариусов улучшают его, оплачиваются в игре фрагментами хроники: модель II — 15, III — 30, IV — 45, V — 60. Одна калибровка на всю учетную запись.
• Каждая модель делает его быстрее (до 180%), увеличивает дальность (до 50 метров) и число тел, обыскиваемых за остановку (у модели V — все вокруг).
• Модель III: он продолжает собирать, когда вы на наземном транспорте.
• Модель IV: он сразу продает собранные предметы низкого качества.
• Модель V: отсек на 12 ячеек хранит то, что не помещается в полные сумки.
• Каждое улучшение сопровождается эффектом нового уровня и дает ему новое имя, вплоть до «Собериметр, модель V».
• Купленный здесь, он начинает с модели I, как у всех: модули добываются только в игре.

В игре его также продают Архивариусы за 40 фрагментов хроники.',

'Zbieracz kronik: epicki towarzysz, który przeszukuje za ciebie ciała wokół ciebie.

Na Fizzcrank Airstrip w Borean Tundra Collect-a-trony 55-D Gearmastera Mechazoda zbierały złom dla swojego pana. Gnomy przeprogramowały jednego z nich, ale tylko na jakiś czas. Przeprogramowanie Zakonu Archiwistów jest trwałe: teraz zbiera dla swojego właściciela, bo każdy pokonany wróg nosi w sobie stronę historii.

Jak działa:
• Poza walką podbiega do ciał wokół ciebie (30 jardów, do 50 po kalibracji) i przeszukuje je za ciebie.
• Przestrzega twoich zasad łupów: w grupie nigdy nie bierze tego, o co się losuje ani co rozdziela master looter, przestrzega kolejki (round robin) i podnosi przedmioty do zadań.
• Monety są dzielone z twoją grupą, tak jak gdy sam przeszukujesz ciała.
• Pełne torby: przedmiot zostaje na ciele, a on powie ci o tym raz (od Mark V przechowa go jego ładownia). Nic nie jest wysyłane pocztą.
• Nie otwiera skrzyń, nie oprawia skór i nie zbiera surowców.
• Porozmawiaj z nim albo wpisz /collectotron, aby otworzyć jego okno: włączenie, co podnosi (wszystkie przedmioty, bez przedmiotów słabej jakości albo niepospolite i lepsze), monety, kalibracja i ładownia.

Kalibracja, od Mark I do Mark V:
• Moduły Archiwistów ulepszają go, opłacane w grze Fragmentami Kroniki: Mark II 15, Mark III 30, Mark IV 45, Mark V 60. Jedna kalibracja dla całego konta.
• Każdy Mark czyni go szybszym (do 180%), zwiększa zasięg (do 50 jardów) i liczbę ciał przeszukiwanych na postoju (przy Mark V wszystkie wokół niego).
• Mark III: zbiera dalej, gdy jedziesz na wierzchowcu naziemnym.
• Mark IV: od razu sprzedaje zebrane przedmioty słabej jakości.
• Mark V: ładownia na 12 miejsc przechowuje to, czego nie zmieszczą twoje pełne torby.
• Każde ulepszenie pokazuje efekt awansu i daje mu nową nazwę, aż do Collect-a-tron Mark V.
• Kupiony tutaj zaczyna od Mark I, jak każdy: moduły zdobywa się tylko w grze.

W grze sprzedają go też Archiwiści za 40 Fragmentów Kroniki.',

'Colecionador de crónicas: uma mascote épica que saqueia por ti os corpos à tua volta.

Na Pista de Aterragem de Fizzcrank, na Tundra Boreal, os Recolhe-trons 55-D do Mestre das Engrenagens Mechazod recolhiam sucata para o seu mestre. Os gnomos reprogramaram um deles, mas só por algum tempo. A reprogramação da Ordem dos Arquivistas é permanente: agora recolhe para o seu dono, pois cada inimigo derrotado traz consigo uma página da história.

Como funciona:
• Fora de combate, trota até aos corpos à tua volta (30 metros, até 50 depois de calibrado) e saqueia-os por ti.
• Segue as tuas próprias regras de saque: em grupo nunca leva o que vai a sorteio nem o que o mestre do saque distribui, respeita a vez de cada um e apanha os objetos de missão.
• As moedas são divididas com o teu grupo, tal como quando saqueias tu mesmo.
• Sacos cheios: o objeto fica no corpo e ele avisa-te uma vez (a partir do Mark V, o seu porão guarda-o). Nada é enviado por correio.
• Não abre arcas, não esfola nem recolhe recursos.
• Fala com ele, ou escreve /collectotron, para abrir a sua própria janela: ligado ou não, o que apanha (todos os objetos, sem objetos fracos, ou invulgares e melhores), as moedas, a sua calibração e o seu porão.

Calibração, do Mark I ao Mark V:
• Os módulos dos Arquivistas melhoram-no, pagos no jogo com Fragmentos de Crónica: Mark II 15, Mark III 30, Mark IV 45, Mark V 60. Uma única calibração para toda a tua conta.
• Cada Mark torna-o mais rápido (até 180%), aumenta o alcance (até 50 metros) e o número de corpos saqueados em cada paragem (todos os que o rodeiam no Mark V).
• Mark III: continua a recolher enquanto montas uma montada terrestre.
• Mark IV: vende no momento os objetos fracos que recolhe.
• Mark V: um porão de 12 espaços guarda o que os teus sacos cheios não conseguem levar.
• Cada melhoria mostra uma subida de nível e dá-lhe o seu novo nome, até ao Recolhe-tron Mark V.
• Comprado aqui, começa no Mark I como o de todos: os módulos só se ganham no jogo.

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
