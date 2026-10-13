import { CodexSkeleton } from "./codex-skeleton";

import { SkeletonPage } from "@/components/skeleton";

export default function Loading() {
  return (
    <SkeletonPage>
      <CodexSkeleton />
    </SkeletonPage>
  );
}
