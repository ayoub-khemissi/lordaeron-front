import {
  Bone,
  SkeletonArea,
  SkeletonChips,
  SkeletonRows,
} from "@/components/skeleton";

// a ranking's rows while they load (ranked-row.tsx: the place, the race and class icons, the name over its line, the value)
export function RankedRowsSkeleton({ count = 10 }: { count?: number }) {
  return (
    <SkeletonRows
      rank
      count={count}
      lead="h-[22px] w-[46px]"
      trail="h-9 w-16"
    />
  );
}

// a whole ranking while the server answers (the PvP ladder, the hall of fame): its boards, its filters, its count and its rows
export function RankingSkeleton({ boards = 5 }: { boards?: number }) {
  return (
    <SkeletonArea className="space-y-5">
      <SkeletonChips count={boards} />
      <div className="flex flex-wrap gap-2">
        <Bone className="h-8 w-56 rounded-lg" />
        <Bone className="h-8 w-36 rounded-lg" />
      </div>
      <Bone className="h-4 w-28" />
      <RankedRowsSkeleton />
    </SkeletonArea>
  );
}
