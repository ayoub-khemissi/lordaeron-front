import {
  Bone,
  SkeletonArea,
  SkeletonPage,
  SkeletonPanel,
} from "@/components/skeleton";

/* The talent calculator while the server reads the realm's trees (page.tsx): the classes, the build's bar, the three trees (one at a
   time on a phone, behind its tab) */
export default function Loading() {
  return (
    <SkeletonPage width="max-w-6xl">
      <SkeletonArea className="space-y-5">
        <div className="-mx-4 -my-2 overflow-hidden px-4 py-3 sm:mx-0 sm:px-2">
          <div className="mx-auto flex w-max gap-2 sm:flex-wrap sm:justify-center">
            {Array.from({ length: 10 }, (_, i) => (
              <Bone
                key={i}
                className="h-11 w-11 shrink-0 rounded-full sm:h-12 sm:w-12"
              />
            ))}
          </div>
        </div>
        <SkeletonPanel className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-xl px-4 py-3">
          <div className="min-w-0 flex-1 space-y-2">
            <Bone className="h-6 w-32" />
            <Bone className="h-4 w-56 max-w-full" />
          </div>
          <Bone className="h-8 w-24" />
          <Bone className="h-8 w-44" />
        </SkeletonPanel>
        <Bone className="mx-auto h-3 w-72 max-w-full" />
        <div className="grid grid-cols-3 gap-1.5 lg:hidden">
          {[0, 1, 2].map((i) => (
            <Bone key={i} className="h-14 rounded-lg" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <SkeletonPanel
              key={i}
              className={`mx-auto aspect-[400/940] w-full max-w-[380px] rounded-xl ${i ? "hidden lg:block" : ""}`}
            />
          ))}
        </div>
      </SkeletonArea>
    </SkeletonPage>
  );
}
