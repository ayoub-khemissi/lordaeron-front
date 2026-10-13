import { Bone, SkeletonArea, SkeletonPanel } from "@/components/skeleton";

/* The account while the session and its data load (page.tsx): its title, its tabs, the account's card (the avatar, its rows) */
export function AccountSkeleton() {
  return (
    <div className="container mx-auto max-w-5xl px-6 py-16">
      <SkeletonArea>
        <div className="mb-12 flex flex-col items-center">
          <Bone className="mb-3 h-10 w-56" />
          <Bone className="h-4 w-72 max-w-full" />
          <div className="shimmer-line mx-auto mt-4 w-24" />
        </div>
        <Bone className="mb-6 h-12 w-full rounded-xl sm:mb-8 sm:h-10 sm:rounded-none" />
        <SkeletonPanel className="mx-auto w-full max-w-2xl p-6">
          <Bone className="mb-5 h-6 w-40" />
          <Bone className="mx-auto mb-6 h-20 w-20 rounded-full" />
          <div className="space-y-4">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <Bone className="h-4 w-28" />
                <Bone className="h-4 w-40" />
              </div>
            ))}
          </div>
        </SkeletonPanel>
      </SkeletonArea>
    </div>
  );
}
