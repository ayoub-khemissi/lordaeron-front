"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useTranslations } from "next-intl";

import { DEFAULT_OUTFIT } from "@/lib/armory-constants";

declare global {
  interface Window {
    CONTENT_PATH: string;
    jQuery: unknown;
    ZamModelViewer: unknown;
  }
}

/*
 * A character in 3D, drawn by Wowhead's model viewer on its WotLK Classic data (Ayoub, 13/10/2026: the armory drew nothing).
 * - the viewer's script is Wowhead's current one (/modelviewer/live/viewer/): the wrath folder's own script still asks for the .mo3
 *   models Wowhead no longer serves, while the current one reads the raw models the wrath data now has;
 * - the gear comes resolved by the server in WotLK Classic's numbering (lib/armory-model.ts);
 * - 3.3.5 stores the looks as indices (skin, face, hair style and color, facial style); WotLK Classic's customization lists the same
 *   choices in the same order (OrderIndex), one option per look, the facial one named after the race (Tusks, Markings, Earrings...);
 *   the tauren's hair is their horns.
 * - a weapon carries its enchantment's glow (the third element of an item, an ItemVisual);
 * - the viewer reports no failure, so the frame it draws is checked (its screenshot hook, a few lit pixels): nothing drawn within
 *   LOAD_TIMEOUT (a file that did not load, a phone's GPU that cannot draw it) and the character is drawn again, bare in the default
 *   attire (DEFAULT_OUTFIT); then, or without WebGL or the viewer's script, a plain panel says why (Ayoub, 13/10/2026). The slots the
 *   server could not dress are listed under the viewer.
 */

interface ModelViewerProps {
  race: number;
  gender: number;
  skin: number;
  face: number;
  hairStyle: number;
  hairColor: number;
  facialStyle: number;
  // [viewer slot, WotLK Classic display, the weapon's enchantment glow]
  items: [number, number, number?][];
  // equipment slots shown in the default attire, or not shown (lib/armory-model.ts)
  defaulted?: number[];
  missing?: number[];
  // the server could not resolve the gear: start in the default attire
  gearFailed?: boolean;
}

type Failure = "webgl" | "viewer" | "model";

// the first try loads everything (a phone on a slow network: the body alone is 2 to 6 MB); the second finds most of it cached
const LOAD_TIMEOUT = 30_000;
const RETRY_TIMEOUT = 20_000;
const CHECK_EVERY = 2_000;
// lit pixels (out of 64 x 64) that make a drawn character; a lone weapon draws fewer
const LIT_MIN = 150;

// how much of the frame the viewer drew: its screenshot hook (renderer.makeDataURL / screenshotCallback), sampled at 64 x 64
function litPixels(viewer: any): Promise<number> {
  return new Promise((resolve) => {
    const r = viewer?.renderer;

    if (!r) return resolve(0);
    const timer = setTimeout(() => resolve(0), 1500);

    r.makeDataURL = ["image/png"];
    r.screenshotCallback = () => {
      const img = new Image();

      img.onload = () => {
        clearTimeout(timer);
        const c = document.createElement("canvas");

        c.width = 64;
        c.height = 64;
        const ctx = c.getContext("2d");

        if (!ctx) return resolve(0);
        ctx.drawImage(img, 0, 0, 64, 64);
        const d = ctx.getImageData(0, 0, 64, 64).data;
        let lit = 0;

        for (let i = 0; i < d.length; i += 4)
          if (d[i] + d[i + 1] + d[i + 2] > 40) lit++;
        resolve(lit);
      };
      img.onerror = () => resolve(0);
      img.src = r.screenshotDataURL;
    };
  });
}

type Looks = Pick<
  ModelViewerProps,
  "skin" | "face" | "hairStyle" | "hairColor" | "facialStyle"
>;

const CONTENT_PATH = "/modelviewer/wrath/";
const VIEWER_SCRIPT = "/modelviewer/live/viewer/viewer.min.js";
const TAUREN = 6;

// the 3.3.5 look each WotLK Classic option stands for
function lookOf(option: string, race: number): keyof Looks | null {
  if (option === "Skin Color") return "skin";
  if (option === "Face") return "face";
  if (option === "Hair Style") return "hairStyle";
  if (option === "Hair Color") return "hairColor";
  if (race === TAUREN && option === "Horn Style") return "hairStyle";
  if (race === TAUREN && option === "Horn Color") return "hairColor";

  // Facial Hair, Piercings, Earrings, Markings, Features, Tusks, a draenei woman's horns, a tauren woman's hair
  return option === "Horn Color" ? null : "facialStyle";
}

interface Customization {
  Options: {
    Id: number;
    Name: string;
    Choices: { Id: number; OrderIndex: number }[];
  }[];
}

async function customization(modelId: number, race: number, looks: Looks) {
  const res = await fetch(
    `${CONTENT_PATH}meta/charactercustomization/${modelId}.json`,
  );

  if (!res.ok) throw new Error(`customization ${modelId}: ${res.status}`);
  const json = await res.json();
  const data: Customization = json.data ?? json;

  return data.Options.map((o) => {
    const look = lookOf(o.Name, race);
    const index = look ? looks[look] : 0;
    const choice =
      o.Choices.find((c) => c.OrderIndex === index) ??
      o.Choices[index] ??
      o.Choices[0];

    return { optionId: o.Id, choiceId: choice.Id };
  });
}

function webglAvailable() {
  try {
    const canvas = document.createElement("canvas");

    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function setupGlobals() {
  window.CONTENT_PATH = CONTENT_PATH;

  if (!(window as any).WH) {
    (window as any).WH = {};
  }
  const WH = (window as any).WH;

  if (!WH.debug) {
    WH.debug = function () {};
  }
  if (!WH.defaultAnimation) {
    WH.defaultAnimation = "Stand";
  }
  if (!WH.WebP) {
    WH.WebP = {
      getImageExtension() {
        return ".webp";
      },
    };
  }
  if (!WH.Wow) {
    WH.Wow = {
      Item: {
        INVENTORY_TYPE_HEAD: 1,
        INVENTORY_TYPE_NECK: 2,
        INVENTORY_TYPE_SHOULDERS: 3,
        INVENTORY_TYPE_SHIRT: 4,
        INVENTORY_TYPE_CHEST: 5,
        INVENTORY_TYPE_WAIST: 6,
        INVENTORY_TYPE_LEGS: 7,
        INVENTORY_TYPE_FEET: 8,
        INVENTORY_TYPE_WRISTS: 9,
        INVENTORY_TYPE_HANDS: 10,
        INVENTORY_TYPE_FINGER: 11,
        INVENTORY_TYPE_TRINKET: 12,
        INVENTORY_TYPE_ONE_HAND: 13,
        INVENTORY_TYPE_SHIELD: 14,
        INVENTORY_TYPE_RANGED: 15,
        INVENTORY_TYPE_BACK: 16,
        INVENTORY_TYPE_TWO_HAND: 17,
        INVENTORY_TYPE_BAG: 18,
        INVENTORY_TYPE_TABARD: 19,
        INVENTORY_TYPE_ROBE: 20,
        INVENTORY_TYPE_MAIN_HAND: 21,
        INVENTORY_TYPE_OFF_HAND: 22,
        INVENTORY_TYPE_HELD_IN_OFF_HAND: 23,
        INVENTORY_TYPE_PROJECTILE: 24,
        INVENTORY_TYPE_THROWN: 25,
        INVENTORY_TYPE_RANGED_RIGHT: 26,
        INVENTORY_TYPE_QUIVER: 27,
        INVENTORY_TYPE_RELIC: 28,
        INVENTORY_TYPE_PROFESSION_TOOL: 29,
        INVENTORY_TYPE_PROFESSION_ACCESSORY: 30,
      },
    };
  }
}

export function ModelViewer({
  race,
  gender,
  skin,
  face,
  hairStyle,
  hairColor,
  facialStyle,
  items,
  defaulted = [],
  missing = [],
  gearFailed = false,
}: ModelViewerProps) {
  const t = useTranslations("armory");
  const viewerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptsReady, setScriptsReady] = useState(false);
  const [jqueryLoaded, setJqueryLoaded] = useState(false);
  const [failed, setFailed] = useState<Failure | null>(null);
  // the second try: the bare character in the default attire
  const [fallback, setFallback] = useState(gearFailed);

  // the viewer gone, its canvas and the elements it added to the box with it (a failed try frees the GPU)
  const destroyViewer = () => {
    if (viewerRef.current?.destroy) {
      try {
        viewerRef.current.destroy();
      } catch {
        // Ignore cleanup errors
      }
    }
    viewerRef.current = null;
    if (containerRef.current) containerRef.current.innerHTML = "";
  };

  // On mount: check if scripts are already loaded (client-side navigation); a script that never comes is the viewer's failure
  useEffect(() => {
    if (!webglAvailable()) setFailed("webgl");
    const scriptTimer = window.setTimeout(() => {
      if (!(window as any).ZamModelViewer) setFailed((f) => f ?? "viewer");
    }, LOAD_TIMEOUT);

    // the scripts' own load events can be lost (a client-side navigation, a script already in the page): watch for what they define
    // too (Ayoub's phone, 13/10/2026: jQuery from a third-party CDN never signalled; it is now served by the site, public/vendor)
    let globalsSet = false;
    const watch = window.setInterval(() => {
      if ((window as any).jQuery && !globalsSet) {
        globalsSet = true;
        setupGlobals();
        setJqueryLoaded(true);
      }
      if ((window as any).ZamModelViewer) {
        setScriptsReady(true);
        window.clearInterval(watch);
      }
    }, 250);
    const watchEnd = window.setTimeout(
      () => window.clearInterval(watch),
      LOAD_TIMEOUT,
    );

    return () => {
      window.clearTimeout(scriptTimer);
      window.clearInterval(watch);
      window.clearTimeout(watchEnd);
      destroyViewer();
    };
  }, []);

  // Initialize viewer once scripts are ready
  useEffect(() => {
    if (!scriptsReady || failed) return;

    let cancelled = false;
    let rafId: number;
    let checkTimer: number | undefined;

    const createViewer = async () => {
      const container = containerRef.current;

      if (!container || cancelled) return;

      const $ = (window as any).jQuery;
      const Zam = (window as any).ZamModelViewer;

      if (!$ || !Zam) return;

      // Ensure layout is resolved
      if (container.clientWidth === 0) {
        rafId = requestAnimationFrame(() => {
          createViewer();
        });

        return;
      }

      // Destroy previous instance
      destroyViewer();

      // the 3.3.5 model: race and gender (0 male, 1 female)
      const modelId = race * 2 - 1 + gender;
      // the second try wears the default attire, its looks when they load (else the race's default ones)
      const outfit = fallback ? Object.values(DEFAULT_OUTFIT) : items;
      const failNow = () => {
        if (cancelled) return;
        if (fallback) {
          destroyViewer();
          setFailed("model");
        } else setFallback(true);
      };

      try {
        const options = await customization(modelId, race, {
          skin,
          face,
          hairStyle,
          hairColor,
          facialStyle,
        }).catch((e) => {
          if (!fallback) throw e;

          return null;
        });

        if (cancelled) return;
        viewerRef.current = new Zam({
          type: 2,
          contentPath: window.CONTENT_PATH,
          container: $(container),
          aspect: container.clientWidth / container.clientHeight,
          models: {
            id: modelId,
            type: 16,
          },
          ...(options ? { charCustomization: { options } } : {}),
          items: outfit,
        });
      } catch (e) {
        console.error("Armory model:", e);

        return failNow();
      }

      // the viewer reports no failure: its frame tells whether the character is drawn
      const started = Date.now();
      const check = async () => {
        if (cancelled) return;
        const lit = await litPixels(viewerRef.current).catch(() => 0);

        if (cancelled) return;
        if (lit >= LIT_MIN) return;
        if (Date.now() - started > (fallback ? RETRY_TIMEOUT : LOAD_TIMEOUT)) {
          console.error("Armory model: nothing drawn", { modelId, fallback });

          return failNow();
        }
        checkTimer = window.setTimeout(check, CHECK_EVERY);
      };

      checkTimer = window.setTimeout(check, CHECK_EVERY * 2);
    };

    rafId = requestAnimationFrame(() => {
      createViewer();
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      window.clearTimeout(checkTimer);
    };
  }, [
    scriptsReady,
    failed,
    fallback,
    race,
    gender,
    skin,
    face,
    hairStyle,
    hairColor,
    facialStyle,
    items,
  ]);

  const handleJqueryLoad = () => {
    setupGlobals();
    setJqueryLoaded(true);
  };

  const handleViewerScriptLoad = () => {
    setScriptsReady(true);
  };

  return (
    <>
      <Script
        src="/vendor/jquery-3.7.1.min.js"
        strategy="afterInteractive"
        onError={() => setFailed("viewer")}
        onLoad={handleJqueryLoad}
      />
      {jqueryLoaded && (
        <Script
          src={VIEWER_SCRIPT}
          strategy="afterInteractive"
          onError={() => setFailed("viewer")}
          onLoad={handleViewerScriptLoad}
        />
      )}
      {/* the viewer's box always stays (the viewer owns what is inside it); the panel covers it when the 3D view fails */}
      <div
        className="relative overflow-hidden"
        style={{ width: "100%", height: 420 }}
      >
        <div
          ref={containerRef}
          className="absolute inset-0"
          id="armory-model-viewer"
          style={{ background: "#000" }}
        />
        {failed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg border border-white/10 bg-gradient-to-b from-[#0b1018] to-black px-6 text-center">
            <p className="font-heading text-lg text-wow-gold-light">
              {t("modelUnavailable")}
            </p>
            <p className="text-sm text-gray-400">{t("modelUnavailableHint")}</p>
            <p className="mt-4 text-xs text-gray-500">
              {t(`modelReason.${failed}`)}
            </p>
          </div>
        )}
      </div>
      {!failed && (fallback || defaulted.length > 0 || missing.length > 0) && (
        <div className="mt-2 space-y-0.5 text-center text-xs text-gray-500">
          {fallback ? (
            <p>{t("modelRetried")}</p>
          ) : (
            <>
              {defaulted.length > 0 && (
                <p>
                  {t("modelDefaulted", {
                    slots: defaulted.map((n) => t(`slots.${n}`)).join(", "),
                  })}
                </p>
              )}
              {missing.length > 0 && (
                <p>
                  {t("modelMissing", {
                    slots: missing.map((n) => t(`slots.${n}`)).join(", "),
                  })}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
