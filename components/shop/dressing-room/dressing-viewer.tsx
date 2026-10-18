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
const HEALTH_CHECK = 2500;
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
  // the framing (zoom, drag) of each model, as the reader left it: the character's, each creature's, each mount ridden (Ayoub,
  // 18/10/2026: closed and opened again, the same view); a mount ridden for the first time framed on its picture (the viewer frames the
  // rider alone: the mount fell out of the frame)
  const zooms = useRef<Framings | null>(null);
  const viewShown = useRef<string>("character");
  // while the room frames a new mount, the reader's framing is not saved over it
  const framing = useRef(false);

  if (kept.current === null) kept.current = savedCamera();
  if (zooms.current === null) zooms.current = savedFramings();

  // the camera of the model shown, kept: its angles for every view, its zoom for its own
  const keep = () => {
    const camera = cameraOf(viewer.current);

    if (!camera || framing.current) return;
    kept.current = camera;
    zooms.current = {
      ...zooms.current!,
      [viewShown.current]: { zoom: camera.zoom, pan: camera.pan },
    };
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
        if (framing.current)
          // the mount's own time to come, then framed on what is drawn
          window.setTimeout(
            () =>
              autoFrame(v, () => token === watching.current).finally(() => {
                framing.current = false;
                if (token === watching.current) keep();
              }),
            1200,
          );

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

  // the model kept alive while the room stays open (Ayoub, 18/10/2026: after many outfits the room stayed black until closed): its frame
  // checked every few seconds once drawn, and its WebGL context watched; black twice in a row, or the context lost, and the model is made
  // again where it was (its outfit, its camera)
  useEffect(() => {
    if (!drawn) return;
    let strikes = 0;
    let busy = false;
    const watched = new WeakSet<HTMLCanvasElement>();
    const remake = () => {
      strikes = 0;
      setGeneration((g) => g + 1);
    };
    const timer = window.setInterval(async () => {
      box.current?.querySelectorAll("canvas").forEach((canvas) => {
        if (watched.has(canvas)) return;
        watched.add(canvas);
        canvas.addEventListener("webglcontextlost", remake);
      });
      if (busy || framing.current || !viewer.current) return;
      busy = true;
      const lit = await litPixels(viewer.current).catch(() => 0);

      busy = false;
      strikes = lit >= LIT_MIN ? 0 : strikes + 1;
      if (strikes >= 2) remake();
    }, HEALTH_CHECK);

    return () => window.clearInterval(timer);
  }, [drawn]);

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
      const key = framingKey(model);
      const own = zooms.current?.[key];
      const camera = {
        ...(kept.current ?? DEFAULT_CAMERA),
        ...(own ?? DEFAULT_FRAMINGS[view]),
      };

      viewShown.current = key;
      framing.current = view === "mounted" && !own;

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
    // a slot left bare (reset, undress, a two-hander taking the off hand, a robe over a chest): the model made again in its new gear.
    // The viewer's own clearSlots is not used: it mixes its two loops' indices and throws after a few outfits, the frame then black
    // until the room was closed (Ayoub, 18/10/2026, Chrome and Firefox; reproduced on the shop)
    const bare = shown.current.some(
      ([slot]) => !items.some(([other]) => other === slot),
    );

    if (bare) {
      setGeneration((g) => g + 1);

      return;
    }
    // the pieces new or changed set on the model drawn (a slot's piece replaces the one it had)
    const changed = items.filter(
      (i) => !shown.current.some((j) => j.join(":") === i.join(":")),
    );

    try {
      if (changed.length)
        v.method("setItems", [
          changed.map(([slot, display, visual]) => ({
            slot,
            display,
            visual: visual ?? 0,
          })),
        ]);
      shown.current = items;
    } catch (e) {
      console.error("Dressing room items:", e);
      setGeneration((g) => g + 1);
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
// a view's own framing: its zoom, and where the reader dragged it (the viewer's translation, a right-button drag)
interface Framing {
  zoom: number;
  pan: number[];
}
// by model: "character", "creature:<display>", "mounted:<display>"
type Framings = Record<string, Framing>;

function framingKey(model: DressingModel) {
  return model.kind === "creature"
    ? `creature:${model.display}`
    : model.mount
      ? `mounted:${model.mount}`
      : "character";
}

// the frame's lit box (64 x 64, the viewer's screenshot hook), null when nothing is drawn or the hook never answers
function litBox(
  viewer: any,
): Promise<{ x0: number; y0: number; x1: number; y1: number } | null> {
  return new Promise((resolve) => {
    const r = viewer?.renderer;

    if (!r) return resolve(null);
    const timer = window.setTimeout(() => resolve(null), 1500);

    r.makeDataURL = ["image/png"];
    r.screenshotCallback = () => {
      const img = new Image();

      img.onload = () => {
        window.clearTimeout(timer);
        const c = document.createElement("canvas");

        c.width = c.height = 64;
        const ctx = c.getContext("2d");

        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, 64, 64);
        const d = ctx.getImageData(0, 0, 64, 64).data;
        let x0 = 64,
          y0 = 64,
          x1 = -1,
          y1 = -1;

        for (let y = 0; y < 64; y++)
          for (let x = 0; x < 64; x++) {
            const o = (y * 64 + x) * 4;

            if (d[o] + d[o + 1] + d[o + 2] > 60) {
              x0 = Math.min(x0, x);
              x1 = Math.max(x1, x);
              y0 = Math.min(y0, y);
              y1 = Math.max(y1, y);
            }
          }
        resolve(x1 < 0 ? null : { x0, y0, x1, y1 });
      };
      img.onerror = () => resolve(null);
      img.src = r.screenshotDataURL;
    };
  });
}

// the model drawn centred and filling 80% of the frame: its lit box moved to the middle (the viewer's drag, in the world's units at the
// camera's distance) and the zoom set to fit it; three passes, each measured on the frame (checked on renders, 18/10/2026)
async function autoFrame(viewer: any, alive: () => boolean) {
  for (let pass = 0; pass < 3 && alive(); pass++) {
    const box = await litBox(viewer);
    const r = viewer?.renderer;

    if (!box || !r || !alive()) return;
    const cx = (box.x0 + box.x1 + 1) / 128 - 0.5;
    const cy = (box.y0 + box.y1 + 1) / 128 - 0.5;
    const size = Math.max(box.x1 - box.x0 + 1, box.y1 - box.y0 + 1) / 64;
    const distance = r.distance * Math.pow(1.1, -r.zoom.current);
    const height = 2 * distance * Math.tan(((r.fov / 2) * Math.PI) / 180);
    const width = (height * r.width) / r.height;
    const t = Array.from(r.translation ?? [0, 0, 0]) as number[];

    if (
      Math.abs(cx) < 0.03 &&
      Math.abs(cy) < 0.03 &&
      Math.abs(size - 0.8) < 0.08
    )
      return;
    r.setTranslation(t[0] - cx * width, t[1] - cy * height, t[2]);
    r.zoom.current = r.zoom.target =
      r.zoom.current - Math.log(size / 0.8) / Math.log(1.1);
    await new Promise((resolve) => window.setTimeout(resolve, 400));
  }
}

function viewOf(model: DressingModel): View {
  return model.kind === "creature"
    ? "creature"
    : model.mount
      ? "mounted"
      : "character";
}

// the viewer's camera (its renderer: azimuth and zenith in radians, a zoom over the distance it fits to each model)
interface Camera extends Framing {
  azimuth: number;
  zenith: number;
}

function cameraOf(viewer: any): Camera | null {
  const r = viewer?.renderer;

  return r && typeof r.azimuth === "number"
    ? {
        azimuth: r.azimuth,
        zenith: r.zenith,
        zoom: r.zoom?.target ?? 0,
        pan: Array.from(r.translation ?? [0, 0, 0]),
      }
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
    if (camera.pan?.length === 3 && r.setTranslation)
      r.setTranslation(camera.pan[0], camera.pan[1], camera.pan[2]);
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
  pan: [0, 0, 0],
};
const CAMERA_KEY = "lordaeron.dressingRoom.camera";
const FRAMINGS_KEY = "lordaeron.dressingRoom.framings";
// a rider framed alone: about twice as far for the whole mount in view
const DEFAULT_FRAMINGS: Framings = {
  character: { zoom: -1, pan: [0, 0, 0] },
  creature: { zoom: -1, pan: [0, 0, 0] },
  mounted: { zoom: -8, pan: [0, 0, 0] },
};

function savedFramings(): Framings {
  try {
    const f = JSON.parse(localStorage.getItem(FRAMINGS_KEY) ?? "null");

    if (f && typeof f === "object") {
      const ok = (v: any) =>
        v &&
        Number.isFinite(v.zoom) &&
        Array.isArray(v.pan) &&
        v.pan.length === 3;

      return Object.fromEntries(
        Object.entries(f)
          .filter(([, v]) => ok(v))
          .slice(-200),
      ) as Framings;
    }
  } catch {
    // a private window: the default framings
  }

  return DEFAULT_FRAMINGS;
}

function savedCamera(): Camera {
  try {
    const c = JSON.parse(localStorage.getItem(CAMERA_KEY) ?? "null");

    if (c && [c.azimuth, c.zenith].every(Number.isFinite))
      return { ...DEFAULT_CAMERA, ...c };
  } catch {
    // a private window: the presentation view
  }

  return DEFAULT_CAMERA;
}

function saveCamera(camera: Camera, framings: Framings) {
  try {
    localStorage.setItem(
      CAMERA_KEY,
      JSON.stringify({ azimuth: camera.azimuth, zenith: camera.zenith }),
    );
    localStorage.setItem(FRAMINGS_KEY, JSON.stringify(framings));
  } catch {
    // a private window: kept for the visit only
  }
}
