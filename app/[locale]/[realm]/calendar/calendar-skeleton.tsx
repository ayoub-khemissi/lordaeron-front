import {
  SkeletonArea,
  SkeletonGrid,
  SkeletonHeading,
  SkeletonRow,
  SkeletonRows,
  SkeletonTile,
} from "@/components/skeleton";

/* The live calendar while it loads (calendar-content.tsx): the realm's state, what comes next, the world bosses */
export function CalendarSkeleton() {
  return (
    <SkeletonArea className="space-y-6">
      <SkeletonRow lead="h-2.5 w-2.5 rounded-full" lines={1} trail={null} />
      <section>
        <SkeletonHeading />
        <SkeletonRows
          className="sm:[&>*]:p-4"
          count={6}
          lead="h-11 w-11"
          trail="h-5 w-20"
        />
      </section>
      <section>
        <SkeletonHeading />
        <SkeletonGrid
          card={(i) => <SkeletonTile key={i} icon="h-11 w-11" />}
          count={2}
          grid="sm:grid-cols-2"
        />
      </section>
    </SkeletonArea>
  );
}
