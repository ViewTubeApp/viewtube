import { ChevronDown, ThumbsDown, ThumbsUp } from "lucide-react";
import { type FC } from "react";

import { Skeleton } from "../ui/skeleton";

export const VideoCommentsSkeleton: FC = () => {
  return (
    <div className="w-full p-4 space-y-6">
      {/* First comment */}
      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 w-full">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-5 w-3/4" />

            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                <ThumbsUp className="size-3" />
                <Skeleton className="h-4 w-12" />
              </div>
              <div className="flex items-center gap-1">
                <ThumbsDown className="size-3" />
                <Skeleton className="h-4 w-8" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>

        <div className="ml-12 flex items-center gap-1 text-blue-500">
          <ChevronDown className="size-4" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Second comment */}
      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 w-full">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-5 w-1/2" />

            <div className="flex items-center gap-6 mt-2">
              <div className="flex items-center gap-2">
                <ThumbsUp className="size-3" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex items-center gap-2">
                <ThumbsDown className="size-3" />
                <Skeleton className="h-4 w-10" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>

        <div className="ml-12 flex items-center gap-2 text-blue-500">
          <ChevronDown className="size-4" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>

      {/* Third comment */}
      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 w-full">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-5 w-2/3" />

            <div className="flex items-center gap-6 mt-2">
              <div className="flex items-center gap-2">
                <ThumbsUp className="size-3" />
                <Skeleton className="h-4 w-10" />
              </div>
              <div className="flex items-center gap-2">
                <ThumbsDown className="size-3" />
                <Skeleton className="h-4 w-10" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>

        <div className="ml-12 flex items-center gap-2 text-blue-500">
          <ChevronDown className="size-4" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
};
