"use client";

import type { Character, ShopItemLocalized, ShopSetLocalized } from "@/types";
import type { ModelItem } from "@/lib/armory-model";
import type { DressingModel } from "@/components/shop/dressing-room/dressing-viewer";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@heroui/button";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from "@heroui/drawer";
import { Select, SelectItem } from "@heroui/select";
import clsx from "clsx";
import { useTranslations } from "next-intl";

import { DressingViewer } from "@/components/shop/dressing-room/dressing-viewer";
import { type RealmSlug } from "@/lib/realms";
import { OVERLAY_POPOVER } from "@/lib/overlay-motion";

/*
 * The shop's dressing room (Ayoub, 18/10/2026: the game's own, on the site): a magnifier on each piece of gear, mount and companion
 * (TryOnButton), or Ctrl + click on its card (Cmd + click on a Mac, whose Ctrl + click opens the context menu), dresses the selected
 * character in it, over its own gear (lib/dressing-room.ts: its looks, its visible gear, its transmogs); several pieces add up as in
 * game, a two-hander takes both hands. A mount or companion shows alone. The room floats over the page, moved by its handle (two lines
 * at its top), where the reader left it; on a phone it is a drawer from the bottom.
 */

interface CharacterLooks {
  name: string;
  race: number;
  gender: number;
  skin: number;
  face: number;
  hairStyle: number;
  hairColor: number;
  facialStyle: number;
  items: ModelItem[];
}

interface DressingRoomApi {
  tryItem: (item: ShopItemLocalized) => void;
  trySet: (set: ShopSetLocalized) => void;
}

const DressingRoomContext = createContext<DressingRoomApi | null>(null);

// the shop's cards: null outside the shop (the room's buttons not shown)
export const useDressingRoom = () => useContext(DressingRoomContext);

// the hands and the chest: a piece takes its place's other forms off (a robe and a chest, a two-hander and both hands)
function group(slot: number) {
  if (slot === 5 || slot === 20) return "chest";
  if (slot === 21 || slot === 13 || slot === 17) return "main";
  if (slot === 22 || slot === 14 || slot === 23) return "off";
  if (slot === 15 || slot === 25 || slot === 26) return "ranged";

  return String(slot);
}

function wear(items: ModelItem[], piece: ModelItem): ModelItem[] {
  const g = group(piece[0]);
  const twoHand = piece[0] === 17;
  const rest = items.filter((i) => {
    const h = group(i[0]);

    if (h === g) return false;
    if (twoHand && h === "off") return false;
    if (g === "off" && i[0] === 17) return false;

    return true;
  });

  return [...rest, piece].sort((a, b) => a[0] - b[0]);
}

// the races a character without the account's own may take (3.3.5: 1-8, 10, 11)
const RACES = [1, 2, 3, 4, 5, 6, 7, 8, 10, 11];
const POSITION_KEY = "lordaeron.dressingRoom.position";
const WIDTH = 340;

type Notice = "unavailable" | "partial" | null;

// a phone's width: the drawer rather than the floating room (one viewer at a time, one WebGL context)
function usePhone() {
  const [phone, setPhone] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setPhone(query.matches);

    update();
    query.addEventListener("change", update);

    return () => query.removeEventListener("change", update);
  }, []);

  return phone;
}

export function DressingRoomProvider({
  realm,
  character,
  children,
}: {
  realm: RealmSlug;
  character: Character | null;
  children: React.ReactNode;
}) {
  const t = useTranslations("shop");
  const tRace = useTranslations("rankings");
  const [open, setOpen] = useState(false);
  const [looks, setLooks] = useState<CharacterLooks | null>(null);
  // the race and gender of a reader without a character on the realm
  const [stand, setStand] = useState({ race: 1, gender: 0 });
  const [worn, setWorn] = useState<ModelItem[] | null>(null);
  const [creature, setCreature] = useState<number | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const phone = usePhone();

  // the selected character's looks and gear, read when the room first opens and when the selection changes
  useEffect(() => {
    if (!open || !character) {
      if (!character) setLooks(null);

      return;
    }
    let cancelled = false;

    fetch(`/api/shop/dressing-room?realm=${realm}&guid=${character.guid}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        setLooks(data?.character ?? null);
        setWorn(null);
      })
      .catch(() => !cancelled && setLooks(null));

    return () => {
      cancelled = true;
    };
  }, [open, character, realm]);

  const base = looks?.items ?? [];
  const items = worn ?? base;

  const show = useCallback(
    async (query: string) => {
      setOpen(true);
      setBusy(true);
      setNotice(null);
      try {
        const res = await fetch(
          `/api/shop/dressing-room/try?realm=${realm}&${query}`,
        );
        const data = await res.json();

        if (data.kind === "creature") setCreature(data.display);
        else if (data.kind === "gear") {
          setCreature(null);
          setWorn((current) =>
            (data.items as ModelItem[]).reduce(wear, current ?? base),
          );
          if (data.missing) setNotice("partial");
        } else setNotice("unavailable");
      } catch {
        setNotice("unavailable");
      } finally {
        setBusy(false);
      }
    },
    [realm, base],
  );

  const api = useMemo<DressingRoomApi>(
    () => ({
      tryItem: (item) => show(`item=${item.id}`),
      trySet: (set) => show(`set=${set.id}`),
    }),
    [show],
  );

  const model = useMemo<DressingModel>(
    () =>
      creature
        ? { kind: "creature", display: creature }
        : looks
          ? { kind: "character", ...looks, items }
          : {
              kind: "character",
              ...stand,
              skin: 0,
              face: 0,
              hairStyle: 0,
              hairColor: 0,
              facialStyle: 0,
              items,
            },
    [creature, looks, stand, items],
  );

  const body = (
    <>
      <div className="relative">
        <DressingViewer
          className="h-[420px] w-full sm:h-[400px]"
          model={model}
          onFailed={() => setFailed(true)}
        />
        {busy && (
          <span className="absolute right-3 top-3 h-2 w-2 animate-ping rounded-full bg-wow-gold" />
        )}
        {failed && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6 text-center text-sm text-gray-300">
            {t("dressingFailed")}
          </div>
        )}
        {notice && !failed && (
          <p className="absolute inset-x-3 bottom-3 rounded-lg bg-black/70 px-3 py-2 text-center text-xs text-amber-200">
            {notice === "unavailable"
              ? t("dressingUnavailable")
              : t("dressingPartial")}
          </p>
        )}
      </div>
      {!looks && !creature && (
        <div className="grid grid-cols-2 gap-2 px-3 pt-3">
          <Select
            aria-label={t("dressingRace")}
            classNames={{ trigger: "bg-white/[0.04]" }}
            popoverProps={OVERLAY_POPOVER}
            selectedKeys={[String(stand.race)]}
            size="sm"
            onSelectionChange={(keys) => {
              const race = Number(Array.from(keys)[0]);

              if (race) setStand((s) => ({ ...s, race }));
            }}
          >
            {RACES.map((r) => (
              <SelectItem key={String(r)}>{tRace(`race_${r}`)}</SelectItem>
            ))}
          </Select>
          <Select
            aria-label={t("dressingGender")}
            classNames={{ trigger: "bg-white/[0.04]" }}
            popoverProps={OVERLAY_POPOVER}
            selectedKeys={[String(stand.gender)]}
            size="sm"
            onSelectionChange={(keys) => {
              const gender = Number(Array.from(keys)[0]);

              setStand((s) => ({ ...s, gender }));
            }}
          >
            <SelectItem key="0">{t("dressingMale")}</SelectItem>
            <SelectItem key="1">{t("dressingFemale")}</SelectItem>
          </Select>
        </div>
      )}
    </>
  );

  const actions = (
    <div className="flex w-full flex-wrap gap-2">
      {creature ? (
        <Button
          className="flex-1 bg-white/[0.06] text-gray-200"
          size="sm"
          variant="flat"
          onPress={() => {
            setCreature(null);
            setNotice(null);
          }}
        >
          {t("dressingBack")}
        </Button>
      ) : (
        <>
          <Button
            className="flex-1 bg-white/[0.06] text-gray-200"
            isDisabled={worn === null}
            size="sm"
            variant="flat"
            onPress={() => {
              setWorn(null);
              setNotice(null);
            }}
          >
            {t("dressingReset")}
          </Button>
          <Button
            className="flex-1 bg-white/[0.06] text-gray-200"
            isDisabled={items.length === 0}
            size="sm"
            variant="flat"
            onPress={() => {
              setWorn([]);
              setNotice(null);
            }}
          >
            {t("dressingUndress")}
          </Button>
        </>
      )}
    </div>
  );

  const title = creature
    ? t("dressingTitle")
    : looks
      ? t("dressingOn", { name: looks.name })
      : t("dressingTitle");

  return (
    <DressingRoomContext.Provider value={api}>
      {children}
      {phone ? (
        <Drawer
          classNames={{ base: "bg-[#0b0f15] border-t border-wow-gold/20" }}
          isOpen={open}
          placement="bottom"
          size="xl"
          onClose={() => setOpen(false)}
        >
          <DrawerContent>
            <DrawerHeader className="text-base text-gray-50">
              {title}
            </DrawerHeader>
            <DrawerBody className="px-0 py-0">{body}</DrawerBody>
            <DrawerFooter>{actions}</DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <FloatingRoom
          actions={actions}
          closeLabel={t("close")}
          handleLabel={t("dressingMove")}
          open={open}
          title={title}
          onClose={() => setOpen(false)}
        >
          {body}
        </FloatingRoom>
      )}
    </DressingRoomContext.Provider>
  );
}

/* The room on a laptop or a desktop: a panel over the page, moved by its handle, kept where the reader left it (this browser), within the
   window; not shown on a phone (the drawer is) */
function FloatingRoom({
  open,
  title,
  onClose,
  closeLabel,
  handleLabel,
  actions,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  closeLabel: string;
  handleLabel: string;
  actions: React.ReactNode;
  children: React.ReactNode;
}) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const panel = useRef<HTMLDivElement>(null);

  const clamp = useCallback((x: number, y: number) => {
    const h = panel.current?.offsetHeight ?? 560;

    return {
      x: Math.min(Math.max(8, x), window.innerWidth - WIDTH - 8),
      y: Math.min(Math.max(72, y), window.innerHeight - Math.min(h, 120)),
    };
  }, []);

  useEffect(() => {
    if (!open || pos) return;
    let saved: { x: number; y: number } | null = null;

    try {
      saved = JSON.parse(localStorage.getItem(POSITION_KEY) ?? "null");
    } catch {
      saved = null;
    }
    setPos(clamp(saved?.x ?? window.innerWidth - WIDTH - 24, saved?.y ?? 96));
  }, [open, pos, clamp]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!pos) return;
    drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setPos(clamp(e.clientX - drag.current.dx, e.clientY - drag.current.dy));
  };
  const onPointerUp = () => {
    drag.current = null;
    try {
      if (pos) localStorage.setItem(POSITION_KEY, JSON.stringify(pos));
    } catch {
      // a private window: the room comes back at its default place
    }
  };

  if (!open || !pos) return null;

  return (
    <div
      ref={panel}
      aria-label={title}
      className="fixed z-50 overflow-hidden rounded-2xl border border-wow-gold/25 bg-[#0b0f15]/95 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl"
      role="dialog"
      style={{ left: pos.x, top: pos.y, width: WIDTH }}
    >
      <div
        aria-label={handleLabel}
        className="flex cursor-grab touch-none select-none flex-col items-center gap-[3px] pt-2 active:cursor-grabbing"
        title={handleLabel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <span className="h-[3px] w-10 rounded-full bg-white/25" />
        <span className="h-[3px] w-10 rounded-full bg-white/25" />
      </div>
      <div className="flex items-center justify-between px-4 pb-2 pt-1">
        <p className="truncate text-sm font-semibold text-wow-gold-light">
          {title}
        </p>
        <button
          aria-label={closeLabel}
          className="rounded-md p-1 text-gray-400 hover:bg-white/10 hover:text-gray-100"
          type="button"
          onClick={onClose}
        >
          <svg
            aria-hidden
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={2.2}
            viewBox="0 0 24 24"
          >
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
      {children}
      <div className={clsx("border-t border-white/[0.06] p-3")}>{actions}</div>
    </div>
  );
}

/* The magnifier on a card (the game's inspect cursor): a round button over its corner; null outside the shop or for what the room
   cannot show */
export function TryOnButton({
  onPress,
  label,
}: {
  onPress: () => void;
  label: string;
}) {
  return (
    <button
      aria-label={label}
      className="absolute right-2.5 top-2.5 z-10 grid h-8 w-8 place-items-center rounded-full border border-wow-gold/50 bg-[#0b0f15]/90 text-wow-gold-light shadow-[0_0_0_1px_rgba(0,0,0,0.6),0_2px_10px_rgba(0,0,0,0.5)] transition-all hover:scale-110 hover:border-wow-gold hover:shadow-[0_0_14px_rgba(199,156,62,0.45)]"
      title={label}
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onPress();
      }}
    >
      <svg aria-hidden className="h-[18px] w-[18px]" viewBox="0 0 24 24">
        {/* the game's magnifier: a gilded rim, a pale lens, a dark handle */}
        <circle
          cx="10"
          cy="10"
          fill="rgba(170,210,255,0.25)"
          r="6.2"
          stroke="#e8c36a"
          strokeWidth="2.2"
        />
        <path
          d="M8 7.5a3 3 0 0 1 2.5-1.4"
          fill="none"
          stroke="rgba(255,255,255,0.7)"
          strokeLinecap="round"
          strokeWidth="1.2"
        />
        <path
          d="M14.6 14.6 20 20"
          stroke="#8a5a22"
          strokeLinecap="round"
          strokeWidth="3.2"
        />
        <path
          d="M14.6 14.6 16 16"
          stroke="#e8c36a"
          strokeLinecap="round"
          strokeWidth="3.2"
        />
      </svg>
    </button>
  );
}
