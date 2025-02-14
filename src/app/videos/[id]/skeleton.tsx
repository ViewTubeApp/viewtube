import * as m from "@/paraglide/messages";

import { Skeleton } from "@/components/ui/skeleton";

export function VideoPageSkeleton() {
  return (
    <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-4 lg:col-span-2">
        <Skeleton className="aspect-video w-full rounded-xl" />
        <Skeleton className="h-4 w-1/2 rounded-lg" />
        <Skeleton className="h-4 w-2/3 rounded-lg" />
        <Skeleton className="h-4 w-1/3 rounded-lg" />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">{m.related_videos()}</h2>

        <div className="flex flex-col gap-2">
          <div className="relative h-24 w-40 shrink-0">
            <Skeleton className="h-full w-full rounded-lg" />
          </div>

          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full rounded-lg" />
            <Skeleton className="h-3 w-1/2 rounded-lg" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="relative h-24 w-40 shrink-0">
            <Skeleton className="h-full w-full rounded-lg" />
          </div>

          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full rounded-lg" />
            <Skeleton className="h-3 w-1/2 rounded-lg" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="relative h-24 w-40 shrink-0">
            <Skeleton className="h-full w-full rounded-lg" />
          </div>

          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full rounded-lg" />
            <Skeleton className="h-3 w-1/2 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
