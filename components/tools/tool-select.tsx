"use client";

import type { ReactNode } from "react";

import { Select, SelectItem } from "@heroui/select";
import clsx from "clsx";

import { OVERLAY_POPOVER } from "@/lib/overlay-motion";

export type ToolOption = { value: string; label: string; icon?: ReactNode };

// HeroUI's selection keys cannot be empty: the tools' "all" choice ("") travels as this key
const ALL = "__all__";

/* A tool's dropdown (Ayoub, 18/10/2026: real HeroUI dropdowns everywhere): HeroUI's Select in the shop's look, one value chosen, "" for
   "all" allowed, an optional icon before each choice; its label above it when `showLabel`. */
export function ToolSelect({
  label,
  value,
  options,
  onChange,
  className,
  showLabel = false,
}: {
  label: string;
  value: string;
  options: ToolOption[];
  onChange: (value: string) => void;
  className?: string;
  showLabel?: boolean;
}) {
  return (
    <Select
      disallowEmptySelection
      aria-label={label}
      className={clsx("w-full", !showLabel && "sm:w-52", className)}
      classNames={{
        label: "text-xs text-gray-400",
        trigger:
          "glass min-h-9 h-9 border border-wow-gold/20 data-[hover=true]:border-wow-gold/35",
        value: "text-sm text-gray-200",
        popoverContent: "bg-[#161b22] border border-wow-gold/15",
      }}
      label={showLabel ? label : undefined}
      labelPlacement="outside"
      popoverProps={OVERLAY_POPOVER}
      selectedKeys={[value || ALL]}
      size="sm"
      onSelectionChange={(keys) => {
        const key = Array.from(keys)[0] as string | undefined;

        if (key !== undefined) onChange(key === ALL ? "" : key);
      }}
    >
      {options.map((o) => (
        <SelectItem key={o.value || ALL} textValue={o.label}>
          {o.icon ? (
            <span className="flex items-center gap-2">
              {o.icon}
              {o.label}
            </span>
          ) : (
            o.label
          )}
        </SelectItem>
      ))}
    </Select>
  );
}
