import { RealmFirstsSkeleton } from "./realm-firsts-skeleton";

import { SkeletonPage } from "@/components/skeleton";

export default function Loading() {
  return (
    <SkeletonPage width="max-w-5xl">
      <RealmFirstsSkeleton />
    </SkeletonPage>
  );
}
