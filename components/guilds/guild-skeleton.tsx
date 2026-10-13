import {
  Bone,
  SkeletonArea,
  SkeletonGrid,
  SkeletonHeading,
  SkeletonRows,
} from "@/components/skeleton";

// a guild's members while they load (character rows: the race and class icons, the name over its rank)
export function GuildMembersSkeleton({ count = 10 }: { count?: number }) {
  return (
    <SkeletonRows
      count={count}
      lead="h-[22px] w-[46px]"
      trail="h-6 w-16 rounded-full"
    />
  );
}

/* A guild's page while it loads (guild-profile.tsx): its crest beside its name and lines, its achievements, its members */
export function GuildSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl px-5 py-10 sm:px-6 sm:py-12">
      <SkeletonArea>
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-end">
          <Bone className="h-32 w-32 shrink-0 rounded-full" />
          <div className="flex w-full min-w-0 flex-1 flex-col items-center gap-2 sm:items-start">
            <Bone className="h-9 w-56 sm:h-10" />
            <Bone className="h-4 w-64 max-w-full" />
            <Bone className="h-4 w-40" />
          </div>
          <Bone className="h-7 w-28 rounded-full" />
        </div>
        <section className="mt-8">
          <SkeletonHeading />
          <SkeletonGrid count={4} grid="sm:grid-cols-2" />
        </section>
        <section className="mt-8">
          <SkeletonHeading className="w-28" />
          <GuildMembersSkeleton />
        </section>
      </SkeletonArea>
    </div>
  );
}
