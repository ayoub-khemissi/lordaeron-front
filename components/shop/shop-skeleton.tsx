import {
  Bone,
  SkeletonArea,
  SkeletonGrid,
  SkeletonPanel,
} from "@/components/skeleton";

// the shop's items while they load (item-grid.tsx: their cards, 1 to 4 a row)
export function ShopItemsSkeleton({ count = 8 }: { count?: number }) {
  return (
    <SkeletonGrid
      card={(i) => (
        <SkeletonPanel key={i} className="space-y-3 rounded-xl p-4">
          <Bone className="h-12 w-12 rounded-lg" />
          <Bone className="h-4 w-3/4" />
          <Bone className="h-3 w-full" />
          <div className="flex items-center justify-between pt-3">
            <Bone className="h-5 w-20" />
            <Bone className="h-8 w-20 rounded-lg" />
          </div>
        </SkeletonPanel>
      )}
      className="gap-4"
      count={count}
      grid="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    />
  );
}

/* The whole shop while the session and its items load (shop-content.tsx): its header and balance, the character, the search and
   filters, then the items */
export function ShopSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <SkeletonArea>
        <SkeletonPanel className="mb-8 flex flex-col items-center justify-between gap-4 p-8 md:flex-row">
          <div className="flex flex-col items-center gap-3 md:items-start">
            <Bone className="h-9 w-48 md:h-10" />
            <Bone className="h-4 w-72 max-w-full" />
          </div>
          <Bone className="h-12 w-48 rounded-xl" />
        </SkeletonPanel>
        <SkeletonPanel className="mb-6 flex flex-col items-center gap-4 rounded-xl p-4 sm:flex-row">
          <Bone className="h-12 w-full rounded-xl sm:max-w-sm" />
          <Bone className="h-4 w-56" />
        </SkeletonPanel>
        <div className="mb-6 flex flex-col gap-2 sm:flex-row">
          <Bone className="h-10 w-full rounded-xl sm:flex-1" />
          <div className="flex gap-2">
            <Bone className="h-10 flex-1 rounded-xl sm:w-56 sm:flex-none" />
            <Bone className="h-10 w-28 rounded-xl" />
          </div>
        </div>
        <ShopItemsSkeleton />
      </SkeletonArea>
    </div>
  );
}
