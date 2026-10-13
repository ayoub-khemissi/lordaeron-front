"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useTranslations } from "next-intl";

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
 * - without WebGL, or when the model fails, a plain panel says so (the equipment around it still shows).
 */

interface ModelViewerProps {
  race: number;
  gender: number;
  skin: number;
  face: number;
  hairStyle: number;
  hairColor: number;
  facialStyle: number;
  // [viewer slot, WotLK Classic display]
  items: [number, number][];
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
}: ModelViewerProps) {
  const t = useTranslations("armory");
  const viewerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptsReady, setScriptsReady] = useState(false);
  const [jqueryLoaded, setJqueryLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  // On mount: check if scripts are already loaded (client-side navigation)
  useEffect(() => {
    if (!webglAvailable()) setFailed(true);
    if ((window as any).jQuery) {
      setupGlobals();
      setJqueryLoaded(true);
    }
    if ((window as any).ZamModelViewer) {
      setScriptsReady(true);
    }

    return () => {
      if (viewerRef.current?.destroy) {
        try {
          viewerRef.current.destroy();
        } catch {
          // Ignore cleanup errors
        }
      }
      viewerRef.current = null;
    };
  }, []);

  // Initialize viewer once scripts are ready
  useEffect(() => {
    if (!scriptsReady || failed) return;

    let cancelled = false;
    let rafId: number;

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
      if (viewerRef.current?.destroy) {
        try {
          viewerRef.current.destroy();
        } catch {
          // Ignore
        }
        viewerRef.current = null;
      }
      container.innerHTML = "";

      // the 3.3.5 model: race and gender (0 male, 1 female)
      const modelId = race * 2 - 1 + gender;

      try {
        const options = await customization(modelId, race, {
          skin,
          face,
          hairStyle,
          hairColor,
          facialStyle,
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
          charCustomization: { options },
          items,
        });
      } catch (e) {
        console.error("Armory model:", e);
        if (!cancelled) setFailed(true);
      }
    };

    rafId = requestAnimationFrame(() => {
      createViewer();
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [
    scriptsReady,
    failed,
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
        src="https://code.jquery.com/jquery-3.7.1.min.js"
        strategy="afterInteractive"
        onLoad={handleJqueryLoad}
      />
      {jqueryLoaded && (
        <Script
          src={VIEWER_SCRIPT}
          strategy="afterInteractive"
          onError={() => setFailed(true)}
          onLoad={handleViewerScriptLoad}
        />
      )}
      {failed ? (
        <div
          className="flex flex-col items-center justify-center gap-2 rounded-lg border border-white/10 bg-gradient-to-b from-[#0b1018] to-black px-6 text-center"
          style={{ width: "100%", height: 420 }}
        >
          <p className="font-heading text-lg text-wow-gold-light">
            {t("modelUnavailable")}
          </p>
          <p className="text-sm text-gray-400">{t("modelUnavailableHint")}</p>
        </div>
      ) : (
        <div
          ref={containerRef}
          id="armory-model-viewer"
          style={{ width: "100%", height: 420, background: "#000" }}
        />
      )}
    </>
  );
}
