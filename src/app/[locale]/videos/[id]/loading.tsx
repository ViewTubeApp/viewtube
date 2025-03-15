import { Skeleton } from "@/components/ui/skeleton";
import { RelatedVideosSkeleton } from "@/components/video/related-videos-skeleton";

export default async function Loading() {
  return (
    <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-4 lg:col-span-2">
        <Skeleton className="aspect-video w-full rounded-xl" />
        <Skeleton className="h-4 w-1/2 rounded-lg" />
        <Skeleton className="h-4 w-2/3 rounded-lg" />
        <Skeleton className="h-4 w-1/3 rounded-lg" />
      </div>

      <RelatedVideosSkeleton />
    </div>
  );
}
