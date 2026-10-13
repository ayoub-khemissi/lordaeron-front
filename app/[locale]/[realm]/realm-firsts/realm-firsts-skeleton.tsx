import {
  Bone,
  SkeletonArea,
  SkeletonChips,
  SkeletonGrid,
  SkeletonHeading,
  SkeletonTile,
} from "@/components/skeleton";

/* The realm firsts while they load (realm-firsts-content.tsx): the kinds as chips, the count, then each kind's cards */
export function RealmFirstsSkeleton() {
  return (
    <SkeletonArea className="space-y-8">
      <SkeletonChips count={6} />
      <Bone className="mx-auto h-4 w-56" />
      {[6, 3].map((count, s) => (
        <section key={s}>
          <SkeletonHeading />
          <SkeletonGrid
            card={(i) => <SkeletonTile key={i} lines={3} />}
            count={count}
          />
        </section>
      ))}
    </SkeletonArea>
  );
}
