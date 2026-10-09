"use client";

import { EquipmentSlot } from "@/types/armory";
import { WowItemIcon } from "@/components/game-tooltip";

/** Left column slot order (top to bottom) — matches WoW character sheet */
const LEFT_SLOTS = [0, 1, 2, 14, 4, 3, 18, 8];
/** Right column slot order */
const RIGHT_SLOTS = [9, 5, 6, 7, 10, 11, 12, 13];
/** Bottom row: Main Hand, Off Hand, Ranged */
const BOTTOM_SLOTS = [15, 16, 17];

interface EquipmentPanelProps {
  equipment: EquipmentSlot[];
  children: React.ReactNode; // ModelViewer goes here
}

// an equipped item: its icon and tooltip from the realm's own data (components/game-tooltip)
function SlotIcon({ item }: { item: EquipmentSlot | undefined }) {
  if (!item) {
    return (
      <div className="w-11 h-11 rounded-md border border-white/10 bg-black/40" />
    );
  }

  return (
    <WowItemIcon
      className="rounded-md bg-black/60 transition hover:brightness-125"
      itemId={item.itemEntry}
      size={44}
    />
  );
}

export function EquipmentPanel({ equipment, children }: EquipmentPanelProps) {
  const equipmentMap = new Map(equipment.map((e) => [e.slot, e]));

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Main area: left slots — model — right slots */}
      <div className="flex items-start gap-2 w-full">
        {/* Left column */}
        <div className="flex flex-col gap-1.5 pt-2">
          {LEFT_SLOTS.map((slotId) => (
            <SlotIcon key={slotId} item={equipmentMap.get(slotId)} />
          ))}
        </div>

        {/* Model viewer */}
        <div className="flex-1 min-w-0">{children}</div>

        {/* Right column */}
        <div className="flex flex-col gap-1.5 pt-2">
          {RIGHT_SLOTS.map((slotId) => (
            <SlotIcon key={slotId} item={equipmentMap.get(slotId)} />
          ))}
        </div>
      </div>

      {/* Bottom row: weapons */}
      <div className="flex gap-1.5 justify-center">
        {BOTTOM_SLOTS.map((slotId) => (
          <SlotIcon key={slotId} item={equipmentMap.get(slotId)} />
        ))}
      </div>
    </div>
  );
}
