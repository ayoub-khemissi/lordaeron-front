import { CalendarSkeleton } from "./calendar-skeleton";

import { SkeletonPage } from "@/components/skeleton";

export default function Loading() {
  return (
    <SkeletonPage width="max-w-3xl">
      <CalendarSkeleton />
    </SkeletonPage>
  );
}
