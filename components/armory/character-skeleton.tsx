import { Bone, SkeletonArea, SkeletonPanel } from "@/components/skeleton";

const slots = (count: number) =>
  Array.from({ length: count }, (_, i) => (
    <Bone key={i} className="h-11 w-11 shrink-0" />
  ));

/* A character's armory page while it loads (character-profile.tsx): its name and identity, its gear around the model
   (equipment-panel.tsx: 8 slots a side, the weapons under it), the transmog switch, then its tabs */
export function CharacterSkeleton() {
  return (
    <div className="container mx-auto max-w-6xl px-6 py-12">
      <SkeletonArea>
        <div className="mb-8 flex flex-col items-center">
          <Bone className="h-9 w-48 sm:h-10" />
          <Bone className="mt-3 h-7 w-64 max-w-full" />
          <div className="mt-3 flex gap-3">
            <Bone className="h-5 w-16 rounded-full" />
            <Bone className="h-5 w-16 rounded-full" />
            <Bone className="h-5 w-24 rounded-full" />
          </div>
          <Bone className="mt-3 h-5 w-44" />
          <Bone className="mt-2 h-3 w-24" />
        </div>
        <div className="mx-auto mb-8 max-w-[500px]">
          <div className="flex w-full items-start gap-2">
            <div className="flex flex-col gap-1.5 pt-2">{slots(8)}</div>
            <SkeletonPanel className="h-[420px] min-w-0 flex-1 rounded-lg" />
            <div className="flex flex-col gap-1.5 pt-2">{slots(8)}</div>
          </div>
          <div className="mt-2 flex justify-center gap-1.5">{slots(3)}</div>
          <Bone className="mx-auto mt-3 h-6 w-56" />
        </div>
        <div className="mx-auto max-w-3xl">
          <Bone className="h-10 w-72 max-w-full rounded-xl" />
          <SkeletonPanel className="mt-4 h-64" />
        </div>
      </SkeletonArea>
    </div>
  );
}
