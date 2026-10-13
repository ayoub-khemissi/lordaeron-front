import {
  Bone,
  SkeletonArea,
  SkeletonChips,
  SkeletonInput,
  SkeletonRows,
} from "@/components/skeleton";

// the codex's items while they load (components/codex/codex-row.tsx: the icon, the name, its sources)
export function CodexRowsSkeleton({ count = 8 }: { count?: number }) {
  return (
    <SkeletonArea>
      <SkeletonRows count={count} lead="h-10 w-10" lines={3} trail={null} />
    </SkeletonArea>
  );
}

/* The whole codex while the server answers (loading.tsx): its search, the kinds, the filters, then its items */
export function CodexSkeleton() {
  return (
    <div className="space-y-5">
      <SkeletonInput />
      <SkeletonChips count={6} />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i}>
            <Bone className="mb-1 h-3 w-16" />
            <Bone className="h-9 w-full rounded-lg" />
          </div>
        ))}
      </div>
      <CodexRowsSkeleton />
    </div>
  );
}
