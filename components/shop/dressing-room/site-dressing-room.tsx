"use client";

import { DressingRoomProvider } from "@/components/shop/dressing-room/dressing-room";
import { useRealm } from "@/lib/realm-context";

/* The site's dressing room, on every page (Ayoub, 18/10/2026: wherever an item is shown, the features, the black market...): the account's
   last played character on the realm browsed, else a human in a tuxedo. The shop keeps its own, on its selected character. */
export function SiteDressingRoom({ children }: { children: React.ReactNode }) {
  const realm = useRealm();

  return (
    <DressingRoomProvider auto realm={realm.slug}>
      {children}
    </DressingRoomProvider>
  );
}
