"use client";

import type { ModelItem } from "@/lib/armory-model";
import type { Looks } from "@/components/armory/model-viewer";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

import {
  CONTENT_PATH,
  VIEWER_SCRIPT,
  customization,
  setupGlobals,
  webglAvailable,
} from "@/components/armory/model-viewer";

export type DressingModel =
  | ({
      kind: "character";
      race: number;
      gender: number;
      items: ModelItem[];
    } & Looks)
  | { kind: "creature"; display: number };

const SCRIPTS_TIMEOUT = 30_000;

/* The dressing room's 3D view: Wowhead's viewer (the armory's, components/armory/model-viewer.tsx) on our mirror of its data. A
   character is made once per look; the gear tried on changes in place (the viewer's own setItems / clearSlots), the whole model drawn
   again only if that fails. A mount or a companion alone is a creature model (type 8). */
export function DressingViewer({
  model,
  className,
  onFailed,
}: {
  model: DressingModel;
  className?: string;
  onFailed?: () => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const viewer = useRef<any>(null);
  const shown = useRef<ModelItem[]>([]);
  // the model as it is now: a model made after a slow load wears the gear tried on meanwhile
  const latest = useRef(model);

  latest.current = model;
  const [ready, setReady] = useState(false);
  const [jquery, setJquery] = useState(false);
  const [failed, setFailed] = useState(false);

  const destroy = () => {
    try {
      viewer.current?.destroy?.();
    } catch {
      // the viewer's own cleanup
    }
    viewer.current = null;
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
    if (failed) onFailed?.();
  }, [failed, onFailed]);

  // what makes a new model: the creature, or the character's race, gender and looks (its gear changes in place)
  const identity =
    model.kind === "creature"
      ? `npc:${model.display}`
      : `char:${model.race}:${model.gender}:${model.skin}:${model.face}:${model.hairStyle}:${model.hairColor}:${model.facialStyle}`;

  useEffect(() => {
    if (!ready || failed) return;
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
      destroy();
      const model = latest.current;

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
        });
        shown.current = model.items;
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
  }, [ready, failed, identity]);

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
  }, [items]);

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
      <div
        ref={box}
        className={className}
        style={{
          background:
            "radial-gradient(ellipse at 50% 35%, #1b2433 0%, #07090d 75%)",
        }}
      />
    </>
  );
}
