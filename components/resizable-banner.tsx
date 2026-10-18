"use client";

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useCallback, useRef, useState } from "react";

const DEFAULT_W = 468;
const DEFAULT_H = 60;
const MIN_W = 100;
const MIN_H = 20;

export const ResizableBanner = () => {
  const [width, setWidth] = useState(DEFAULT_W);
  const [height, setHeight] = useState(DEFAULT_H);
  const [resizable, setResizable] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!resizable) return;
      e.preventDefault();
      dragging.current = true;
      const startX = e.clientX;
      const startY = e.clientY;
      const startW = width;
      const startH = height;

      const onMove = (ev: PointerEvent) => {
        if (!dragging.current) return;
        setWidth(Math.max(MIN_W, startW + (ev.clientX - startX)));
        setHeight(Math.max(MIN_H, startH + (ev.clientY - startY)));
      };

      const onUp = () => {
        dragging.current = false;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [width, height, resizable],
  );

  const handleWidthInput = (val: string) => {
    const n = parseInt(val, 10);

    if (!isNaN(n) && n >= MIN_W) setWidth(n);
  };

  const handleHeightInput = (val: string) => {
    const n = parseInt(val, 10);

    if (!isNaN(n) && n >= MIN_H) setHeight(n);
  };

  const fontSize = Math.max(10, Math.min(height * 0.38, width * 0.06));
  const subFontSize = Math.max(7, fontSize * 0.45);

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Width input */}
        <Input
          aria-label="W"
          className="w-28"
          classNames={{
            inputWrapper:
              "h-8 min-h-8 border border-white/10 bg-wow-dark/50 data-[hover=true]:bg-wow-dark/60 group-data-[focus=true]:border-wow-gold/40",
            input: "text-center font-mono text-sm text-gray-200",
          }}
          endContent={<span className="text-sm text-gray-400">px</span>}
          min={MIN_W}
          size="sm"
          startContent={<span className="text-sm text-gray-400">W</span>}
          type="number"
          value={String(Math.round(width))}
          onValueChange={handleWidthInput}
        />

        {/* Height input */}
        <Input
          aria-label="H"
          className="w-28"
          classNames={{
            inputWrapper:
              "h-8 min-h-8 border border-white/10 bg-wow-dark/50 data-[hover=true]:bg-wow-dark/60 group-data-[focus=true]:border-wow-gold/40",
            input: "text-center font-mono text-sm text-gray-200",
          }}
          endContent={<span className="text-sm text-gray-400">px</span>}
          min={MIN_H}
          size="sm"
          startContent={<span className="text-sm text-gray-400">H</span>}
          type="number"
          value={String(Math.round(height))}
          onValueChange={handleHeightInput}
        />

        {/* Resize toggle */}
        <Button
          className={`h-auto min-w-0 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
            resizable
              ? "border-wow-gold/30 text-wow-gold bg-wow-gold/5"
              : "border-white/10 text-gray-500 bg-transparent"
          }`}
          variant="light"
          onPress={() => setResizable(!resizable)}
        >
          {resizable ? "Resize ON" : "Resize OFF"}
        </Button>

        {/* Reset */}
        <Button
          className="h-auto min-w-0 text-xs text-gray-500 hover:text-wow-gold transition-colors"
          variant="light"
          onPress={() => {
            setWidth(DEFAULT_W);
            setHeight(DEFAULT_H);
          }}
        >
          Reset
        </Button>
      </div>

      {/* Banner + resize handle */}
      <div ref={containerRef} className="relative inline-block">
        <div
          className="relative overflow-hidden border border-wow-gold/20"
          style={{ width, height }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e14] via-[#111927] to-[#0a0e14]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(180,140,60,0.1),transparent_70%)]" />

          <div className="relative flex items-center justify-center h-full px-3 gap-3">
            <span
              className="font-black tracking-widest wow-gradient-text whitespace-nowrap leading-none"
              style={{ fontSize }}
            >
              LORDAERON
            </span>
            {width > 300 && (
              <>
                <span
                  className="w-px bg-wow-gold/30 shrink-0"
                  style={{ height: height * 0.5 }}
                />
                <span
                  className="text-gray-400 whitespace-nowrap leading-tight"
                  style={{ fontSize: subFontSize }}
                >
                  The Ultimate Epic Progressive
                  <br />
                  WoW Experience
                </span>
              </>
            )}
          </div>
        </div>

        {/* Resize handle (bottom-right corner) */}
        {resizable && (
          <div
            className="absolute -bottom-1.5 -right-1.5 w-4 h-4 cursor-nwse-resize flex items-center justify-center"
            onPointerDown={onPointerDown}
          >
            <svg
              className="w-3 h-3 text-wow-gold/40"
              fill="currentColor"
              viewBox="0 0 12 12"
            >
              <circle cx="10" cy="10" r="1.5" />
              <circle cx="6" cy="10" r="1.5" />
              <circle cx="10" cy="6" r="1.5" />
              <circle cx="2" cy="10" r="1.5" />
              <circle cx="6" cy="6" r="1.5" />
              <circle cx="10" cy="2" r="1.5" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};
