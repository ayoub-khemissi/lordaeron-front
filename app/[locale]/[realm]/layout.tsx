import { notFound } from "next/navigation";

import { isRealmSlug } from "@/lib/realms";
import { RealmProvider } from "@/lib/realm-context";

// a realm's pages (/fr/lordaeron/..., /fr/rimeheart/...): an unknown realm is not found
export default async function RealmLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; realm: string }>;
}) {
  const { realm } = await params;

  if (!isRealmSlug(realm)) notFound();

  return <RealmProvider realm={realm}>{children}</RealmProvider>;
}
