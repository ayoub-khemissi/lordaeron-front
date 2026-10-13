import {
  Bone,
  SkeletonArea,
  SkeletonPage,
  SkeletonPanel,
} from "@/components/skeleton";

// a card of bars (population-content.tsx BarList): an icon and a name, the bar, the count
function BarsSkeleton() {
  return (
    <SkeletonPanel className="p-4 sm:p-6">
      <Bone className="mb-4 h-5 w-28" />
      <div className="space-y-2.5">
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className="grid grid-cols-[7rem_1fr_4.75rem] items-center gap-3 sm:grid-cols-[8.5rem_1fr_5rem]"
          >
            <Bone className="h-5 w-24" />
            <Bone className="h-2 w-full rounded-full" />
            <Bone className="ml-auto h-4 w-14" />
          </div>
        ))}
      </div>
    </SkeletonPanel>
  );
}

// a card of columns (the levels, the weeks)
function ColumnsSkeleton() {
  return (
    <SkeletonPanel className="p-4 sm:p-6">
      <Bone className="mb-4 h-5 w-36" />
      <div className="flex h-32 items-end justify-around gap-1 sm:gap-2">
        {[30, 55, 40, 70, 45, 85, 60, 35, 50, 75, 40, 65].map((h, i) => (
          <Bone
            key={i}
            className="w-full max-w-10 flex-1 rounded-b-none"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <Bone className="mt-2 h-4 w-full" />
    </SkeletonPanel>
  );
}

/* The realm's population while the server counts (page.tsx): its three numbers, the factions, the classes and the races, the levels and
   the weeks */
export default function Loading() {
  return (
    <SkeletonPage>
      <SkeletonArea className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {[0, 1, 2].map((i) => (
            <SkeletonPanel
              key={i}
              className="flex flex-col items-center gap-2 rounded-xl px-2 py-3 sm:px-4 sm:py-5"
            >
              <Bone className="h-8 w-16 sm:h-9" />
              <Bone className="h-3 w-20" />
            </SkeletonPanel>
          ))}
        </div>
        <SkeletonPanel className="p-4 sm:p-6">
          <Bone className="mb-4 h-5 w-24" />
          <Bone className="mb-2 h-4 w-full" />
          <Bone className="h-3 w-full rounded-full" />
        </SkeletonPanel>
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <BarsSkeleton />
          <BarsSkeleton />
        </div>
        <ColumnsSkeleton />
        <ColumnsSkeleton />
      </SkeletonArea>
    </SkeletonPage>
  );
}
