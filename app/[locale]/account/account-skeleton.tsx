import { Bone, SkeletonArea, SkeletonPanel } from "@/components/skeleton";

/* The account while the session and its data load (page.tsx): its identity's card, its sections' column, the overview's tiles and realms */
export function AccountSkeleton() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <SkeletonArea>
        <SkeletonPanel className="flex items-center gap-4 p-5 sm:p-6">
          <Bone className="h-16 w-16 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Bone className="h-7 w-48" />
            <Bone className="h-4 w-72 max-w-full" />
          </div>
          <Bone className="hidden h-14 w-56 rounded-xl md:block" />
        </SkeletonPanel>
        <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:mt-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
          <div className="space-y-2">
            <Bone className="h-10 w-full rounded-xl" />
            <Bone className="hidden h-10 w-full rounded-xl lg:block" />
            <Bone className="hidden h-10 w-full rounded-xl lg:block" />
            <Bone className="hidden h-10 w-full rounded-xl lg:block" />
          </div>
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }, (_, i) => (
                <Bone key={i} className="h-[4.5rem] rounded-2xl" />
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Bone className="h-48 rounded-2xl" />
              <Bone className="h-48 rounded-2xl" />
            </div>
          </div>
        </div>
      </SkeletonArea>
    </div>
  );
}
