import { SkeletonInput, SkeletonPage } from "@/components/skeleton";

export default function Loading() {
  return (
    <SkeletonPage lede={false}>
      <SkeletonInput />
    </SkeletonPage>
  );
}
