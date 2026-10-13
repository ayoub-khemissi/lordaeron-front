import {
  SkeletonArea,
  SkeletonInput,
  SkeletonPage,
  SkeletonRows,
} from "@/components/skeleton";

export default function Loading() {
  return (
    <SkeletonPage lede={false}>
      <SkeletonArea className="space-y-6">
        <SkeletonInput />
        <SkeletonRows
          lead="h-11 w-11 rounded-full"
          trail="h-6 w-20 rounded-full"
        />
      </SkeletonArea>
    </SkeletonPage>
  );
}
