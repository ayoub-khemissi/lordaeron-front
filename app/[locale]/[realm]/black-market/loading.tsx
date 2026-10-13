import { BlackMarketSkeleton } from "./black-market-skeleton";

import { SkeletonPage } from "@/components/skeleton";

export default function Loading() {
  return (
    <SkeletonPage width="max-w-3xl">
      <BlackMarketSkeleton />
    </SkeletonPage>
  );
}
