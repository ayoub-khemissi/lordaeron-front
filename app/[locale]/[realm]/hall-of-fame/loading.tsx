import { RankingSkeleton } from "@/components/rankings/ranking-skeleton";
import { SkeletonPage } from "@/components/skeleton";

export default function Loading() {
  return (
    <SkeletonPage>
      <RankingSkeleton boards={2} />
    </SkeletonPage>
  );
}
