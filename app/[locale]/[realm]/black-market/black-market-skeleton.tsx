import {
  Bone,
  SkeletonArea,
  SkeletonPanel,
  SkeletonRows,
} from "@/components/skeleton";

/* The black market while it loads (black-market-content.tsx): the countdown to the next delivery, the reader's characters, the
   showcase's items */
export function BlackMarketSkeleton() {
  return (
    <SkeletonArea className="space-y-6">
      <SkeletonPanel className="flex flex-col items-center gap-3 p-5 sm:p-6">
        <Bone className="h-3 w-36" />
        <Bone className="h-9 w-48 sm:h-10" />
        <Bone className="h-4 w-40" />
      </SkeletonPanel>
      <SkeletonPanel className="flex items-center gap-3 rounded-xl p-4">
        <Bone className="h-4 flex-1" />
        <Bone className="h-9 w-28 rounded-lg" />
      </SkeletonPanel>
      <SkeletonRows
        className="sm:[&>*]:p-4"
        count={8}
        lead="h-11 w-11"
        trail="h-6 w-20 rounded-full"
      />
    </SkeletonArea>
  );
}
