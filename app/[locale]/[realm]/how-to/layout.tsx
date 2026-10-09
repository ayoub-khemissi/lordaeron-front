import { notFound } from "next/navigation";

import { isRealmSlug, realmHasSection } from "@/lib/realms";

// a section only some realms have (lib/realms.ts): not found on the others
export default async function SectionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ realm: string }>;
}) {
  const { realm } = await params;

  if (!isRealmSlug(realm) || !realmHasSection(realm, "how-to")) notFound();

  return children;
}
