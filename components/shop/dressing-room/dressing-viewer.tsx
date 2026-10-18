"use client";

import type { ModelItem } from "@/lib/armory-model";
import type { Looks } from "@/components/armory/model-viewer";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

import {
  CONTENT_PATH,
  VIEWER_SCRIPT,
  customization,
  litPixels,
  releaseCanvases,
  setupGlobals,
  webglAvailable,
} from "@/components/armory/model-viewer";

export type DressingModel =
  | ({
      kind: "character";
      race: number;
      gender: number;
      items: ModelItem[];
      // a mount's creature display: the character rides it
      mount?: number;
    } & Looks)
  | { kind: "creature"; display: number };

const SCRIPTS_TIMEOUT = 30_000;
// a model not drawn within this time is made again once, then said lost (Ayoub, 18/10/2026: a set showed only at the second try)
const DRAW_TIMEOUT = 20_000;
const DRAW_CHECK = 700;
// lit pixels (of 64 x 64) that make a drawn model
const LIT_MIN = 60;

/* The dressing room's 3D view: Wowhead's viewer (the armory's, components/armory/model-viewer.tsx) on our mirror of its data. A
   character is made once per look; the gear tried on changes in place (the viewer's own setItems / clearSlots), the whole model drawn
   again only if that fails. A mount or a companion alone is a creature model (type 8). */
export function DressingViewer({
  model,
  className,
  onFailed,
  hold = false,
  waiting = false,
  loadingLabel,
}: {
  model: DressingModel;
  className?: string;
  onFailed?: () => void;
  // the character's looks still coming: nothing made yet (not a stand-in drawn first)
  hold?: boolean;
  // something the room waits for (a try-on's answer): the loading sign shown
  waiting?: boolean;
  loadingLabel?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const viewer = useRef<any>(null);
  const shown = useRef<ModelItem[]>([]);
  // the model as it is now: a model made after a slow load wears the gear tried on meanwhile
  const latest = useRef(model);
  // the reader's view: its last one in this browser (Ayoub, 18/10/2026: kept across visits), else a three-quarter view from a little above
  const kept = useRef<Camera | null>(null);
  // the zoom of each view (a character, a creature alone, a character riding): a mount's rider is framed on the rider alone by the
  // viewer, so its view steps further back (Ayoub, 18/10/2026: the drake ridden filled the room)
  const zooms = useRef<Zooms | null>(null);
  const viewShown = useRef<View>("character");

  if (kept.current === null) kept.current = savedCamera();
  if (zooms.current === null) zooms.current = savedZooms();

  // the camera of the model shown, kept: its angles for every view, its zoom for its own
  const keep = () => {
    const camera = cameraOf(viewer.current);

    if (!camera) return;
    kept.current = camera;
    zooms.current = { ...zooms.current!, [viewShown.current]: camera.zoom };
    saveCamera(camera, zooms.current);
  };

  latest.current = model;
  const [ready, setReady] = useState(false);
  const [jquery, setJquery] = useState(false);
  const [failed, setFailed] = useState(false);
  // the model made is drawn (its frame lit); a new one made on demand (generation), retried once when it never draws
  const [drawn, setDrawn] = useState(false);
  const [generation, setGeneration] = useState(0);
  // never drawn, even made again: said so (the next model tries afresh)
  const [lost, setLost] = useState(false);
  const retries = useRef(0);
  const watching = useRef(0);

  // the frame watched until the model shows: then drawn; past DRAW_TIMEOUT, made again once, then lost
  const watch = (v: any) => {
    const token = ++watching.current;
    const started = Date.now();

    setDrawn(false);
    const check = async () => {
      if (token !== watching.current) return;
      const lit = await litPixels(v).catch(() => 0);

      if (token !== watching.current) return;
      if (lit >= LIT_MIN) {
        setDrawn(true);
        retries.current = 0;

        return;
      }
      if (Date.now() - started > DRAW_TIMEOUT) {
        if (retries.current < 1) {
          retries.current += 1;
          setGeneration((g) => g + 1);
        } else setLost(true);

        return;
      }
      window.setTimeout(check, DRAW_CHECK);
    };

    window.setTimeout(check, DRAW_CHECK);
  };

  const destroy = () => {
    keep();
    try {
      viewer.current?.destroy?.();
    } catch {
      // the viewer's own cleanup
    }
    viewer.current = null;
    releaseCanvases(box.current);
    if (box.current) box.current.innerHTML = "";
  };

  // the scripts (shared with the armory): their globals watched, their load events can be lost on a client-side navigation
  useEffect(() => {
    if (!webglAvailable()) setFailed(true);
    let globals = false;
    const watch = window.setInterval(() => {
      if ((window as any).jQuery && !globals) {
        globals = true;
        setupGlobals();
        setJquery(true);
      }
      if ((window as any).ZamModelViewer) {
        setReady(true);
        window.clearInterval(watch);
      }
    }, 200);
    const give = window.setTimeout(() => {
      window.clearInterval(watch);
      if (!(window as any).ZamModelViewer) setFailed(true);
    }, SCRIPTS_TIMEOUT);

    return () => {
      window.clearInterval(watch);
      window.clearTimeout(give);
      destroy();
    };
  }, []);

  useEffect(() => {
    if (failed || lost) onFailed?.();
  }, [failed, lost, onFailed]);

  // the view saved as the reader turns and zooms (read every second: the viewer has no camera event)
  useEffect(() => {
    let last = "";
    const timer = window.setInterval(() => {
      const key = JSON.stringify(cameraOf(viewer.current));

      if (key !== "null" && key !== last) {
        last = key;
        keep();
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  // what makes a new model: the creature, or the character's race, gender and looks (its gear changes in place)
  const identity =
    model.kind === "creature"
      ? `npc:${model.display}`
      : `char:${model.race}:${model.gender}:${model.skin}:${model.face}:${model.hairStyle}:${model.hairColor}:${model.facialStyle}:${model.mount ?? 0}`;

  // a new model: its own retry and its own chance to draw
  useEffect(() => {
    retries.current = 0;
    setLost(false);
  }, [identity]);

  useEffect(() => {
    if (!ready || failed || hold) return;
    let cancelled = false;
    let raf = 0;

    const create = async () => {
      const container = box.current;
      const $ = (window as any).jQuery;
      const Zam = (window as any).ZamModelViewer;

      if (!container || !$ || !Zam || cancelled) return;
      if (container.clientWidth === 0) {
        raf = requestAnimationFrame(create);

        return;
      }
      // the reader's view kept from one model to the next (Ayoub, 18/10/2026): its angles, and the zoom of the new model's view; the
      // distance fits each model
      destroy();
      const model = latest.current;
      const view = viewOf(model);
      const camera = {
        ...(kept.current ?? DEFAULT_CAMERA),
        zoom: zooms.current?.[view] ?? DEFAULT_ZOOMS[view],
      };

      viewShown.current = view;

      try {
        if (model.kind === "creature") {
          viewer.current = new Zam({
            type: 2,
            contentPath: CONTENT_PATH,
            container: $(container),
            aspect: container.clientWidth / container.clientHeight,
            models: { id: model.display, type: 8 },
          });
          shown.current = [];
          restoreCamera(viewer.current, camera);
          watch(viewer.current);

          return;
        }
        const modelId = model.race * 2 - 1 + model.gender;
        const options = await customization(modelId, model.race, model).catch(
          () => null,
        );

        if (cancelled) return;
        viewer.current = new Zam({
          type: 2,
          contentPath: CONTENT_PATH,
          container: $(container),
          aspect: container.clientWidth / container.clientHeight,
          models: { id: modelId, type: 16 },
          ...(options ? { charCustomization: { options } } : {}),
          items: model.items,
          ...(model.mount ? { mount: { id: model.mount } } : {}),
        });
        shown.current = model.items;
        restoreCamera(viewer.current, camera);
        watch(viewer.current);
      } catch (e) {
        console.error("Dressing room:", e);
        setFailed(true);
      }
    };

    raf = requestAnimationFrame(create);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [ready, failed, hold, identity, generation]);

  // the gear tried on: the slots that changed cleared, the new pieces set, on the model already drawn
  const items = model.kind === "character" ? model.items : null;

  useEffect(() => {
    const v = viewer.current;

    if (!items || !v) return;
    const key = (list: ModelItem[]) =>
      list
        .map((i) => i.join(":"))
        .sort()
        .join("|");

    if (key(items) === key(shown.current)) return;
    // a model still loading takes its new gear once drawn (this effect runs again then): never made again for it, each new model a
    // new WebGL context (Ayoub, 18/10/2026: outfits switched fast drew black)
    if (!drawn) return;
    try {
      const slots = [...new Set([...shown.current, ...items].map((i) => i[0]))];

      v.method("clearSlots", slots.join(","));
      if (items.length)
        v.method("setItems", [
          items.map(([slot, display, visual]) => ({
            slot,
            display,
            visual: visual ?? 0,
          })),
        ]);
      shown.current = items;
    } catch (e) {
      // the viewer without its methods: the character drawn again in its new gear
      console.error("Dressing room items:", e);
      destroy();
      setReady(false);
      requestAnimationFrame(() => setReady(true));
    }
  }, [items, drawn]);

  return (
    <>
      <Script
        src="/vendor/jquery-3.7.1.min.js"
        strategy="afterInteractive"
        onError={() => setFailed(true)}
        onLoad={() => {
          setupGlobals();
          setJquery(true);
        }}
      />
      {jquery && (
        <Script
          src={VIEWER_SCRIPT}
          strategy="afterInteractive"
          onError={() => setFailed(true)}
          onLoad={() => setReady(true)}
        />
      )}
      <div className="relative">
        <div
          ref={box}
          className={className}
          // black, as the game and the armory draw them: the particles' dark squares (their sparks' black, blended) vanish on it, not on
          // a coloured backdrop (Ayoub, 18/10/2026)
          style={{ background: "#000" }}
        />
        {/* the loading sign: the room's own wait, the character's looks, the model being drawn */}
        {!failed && !lost && (waiting || hold || !drawn) && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3">
            <span className="h-9 w-9 animate-spin rounded-full border-2 border-wow-gold/20 border-t-wow-gold" />
            {loadingLabel && (
              <span className="text-xs text-gray-400">{loadingLabel}</span>
            )}
          </div>
        )}
      </div>
    </>
  );
}

type View = "character" | "creature" | "mounted";
type Zooms = Record<View, number>;

function viewOf(model: DressingModel): View {
  return model.kind === "creature"
    ? "creature"
    : model.mount
      ? "mounted"
      : "character";
}

// the viewer's camera (its renderer: azimuth and zenith in radians, a zoom over the distance it fits to each model)
interface Camera {
  azimuth: number;
  zenith: number;
  zoom: number;
}

function cameraOf(viewer: any): Camera | null {
  const r = viewer?.renderer;

  return r && typeof r.azimuth === "number"
    ? { azimuth: r.azimuth, zenith: r.zenith, zoom: r.zoom?.target ?? 0 }
    : null;
}

// set on the new model's renderer as soon as it exists
function restoreCamera(viewer: any, camera: Camera | null) {
  if (!camera) return;
  let tries = 0;
  const apply = () => {
    const r = viewer?.renderer;

    if (!r) {
      if (++tries < 40) window.setTimeout(apply, 50);

      return;
    }
    r.azimuth = camera.azimuth;
    r.zenith = camera.zenith;
    if (r.zoom) r.zoom.current = r.zoom.target = camera.zoom;
  };

  apply();
}

// the presentation view (a three-quarter angle, the camera a little above, a step back: the way a figure is shown, never flat from the
// front; checked on renders, 18/10/2026): the viewer's front is an azimuth of 1.5 pi (less turns the head to the right), its horizon a
// zenith of pi / 2 (more looks from above), its zoom 1 by default (less steps back: the distance times 1.1 per step)
const DEFAULT_CAMERA: Camera = {
  azimuth: 1.5 * Math.PI - 0.6,
  zenith: Math.PI / 2 + 0.2,
  zoom: -1,
};
const CAMERA_KEY = "lordaeron.dressingRoom.camera";
const ZOOMS_KEY = "lordaeron.dressingRoom.zooms";
// a rider framed alone: about twice as far for the whole mount in view
const DEFAULT_ZOOMS: Zooms = { character: -1, creature: -1, mounted: -8 };

function savedZooms(): Zooms {
  try {
    const z = JSON.parse(localStorage.getItem(ZOOMS_KEY) ?? "null");

    if (z && typeof z === "object") return { ...DEFAULT_ZOOMS, ...z };
  } catch {
    // a private window: the default zooms
  }

  return DEFAULT_ZOOMS;
}

function savedCamera(): Camera {
  try {
    const c = JSON.parse(localStorage.getItem(CAMERA_KEY) ?? "null");

    if (c && [c.azimuth, c.zenith, c.zoom].every(Number.isFinite)) return c;
  } catch {
    // a private window: the presentation view
  }

  return DEFAULT_CAMERA;
}

function saveCamera(camera: Camera, zooms: Zooms) {
  try {
    localStorage.setItem(CAMERA_KEY, JSON.stringify(camera));
    localStorage.setItem(ZOOMS_KEY, JSON.stringify(zooms));
  } catch {
    // a private window: kept for the visit only
  }
}
