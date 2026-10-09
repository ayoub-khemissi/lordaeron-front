import { notFound } from "next/navigation";

import { isRealmSlug } from "@/lib/realms";
import { realmViewForRequest } from "@/lib/realm-preview";

// a section only some realms have (lib/realms.ts): not found on the others, but for an administrator (lib/realm-preview.ts)
export default async function SectionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ realm: string }>;
}) {
  const { realm } = await params;

  if (
    !isRealmSlug(realm) ||
    !(await realmViewForRequest(realm)).sections.includes("features")
  )
    notFound();

  return children;
}
