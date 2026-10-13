import {
  Bone,
  SkeletonArea,
  SkeletonHeading,
  SkeletonTile,
} from "@/components/skeleton";

// a guild's card (progression-content.tsx GuildCard): its place, crest and name, then a raid's difficulties as bars
function GuildCardSkeleton() {
  return (
    <div className="glass rounded-xl border border-white/5 p-3 sm:p-4">
      <div className="flex items-center gap-3">
        <Bone className="h-6 w-8 shrink-0" />
        <Bone className="h-11 w-11 shrink-0 rounded-full" />
        <Bone className="h-5 w-44" />
      </div>
      <Bone className="mt-4 h-4 w-36" />
      <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="space-y-1.5">
            <Bone className="h-3 w-full" />
            <Bone className="h-1.5 w-full rounded-full" />
          </div>
        ))}
      </div>
      <Bone className="mt-3 h-3 w-24" />
    </div>
  );
}

/* The guilds' progression while it loads: the realm's first kills, then the guilds' cards */
export function ProgressionSkeleton() {
  return (
    <SkeletonArea className="space-y-8">
      <section>
        <SkeletonHeading />
        <div className="-mx-4 flex gap-2 overflow-hidden px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <SkeletonTile key={i} className="w-64 shrink-0 sm:w-auto" />
          ))}
        </div>
      </section>
      <section>
        <SkeletonHeading />
        <div className="space-y-2">
          {Array.from({ length: 3 }, (_, i) => (
            <GuildCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </SkeletonArea>
  );
}
