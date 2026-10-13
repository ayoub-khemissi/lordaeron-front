import { ProgressionSkeleton } from "./progression-skeleton";

import { SkeletonPage } from "@/components/skeleton";

export default function Loading() {
  return (
    <SkeletonPage width="max-w-5xl">
      <ProgressionSkeleton />
    </SkeletonPage>
  );
}
