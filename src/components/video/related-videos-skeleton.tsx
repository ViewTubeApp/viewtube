import { useTranslations } from "next-intl";
import { type FC } from "react";

import { cn } from "@/lib/utils";

import { Skeleton } from "../ui/skeleton";

interface RelatedVideosSkeletonProps {
  className?: string;
}

export const RelatedVideosSkeleton: FC<RelatedVideosSkeletonProps> = ({ className }) => {
  const t = useTranslations();

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <h2 className="mb-2 text-lg font-semibold">{t("related_videos")}</h2>

      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex gap-2">
            <Skeleton className="h-24 w-40 rounded-lg" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-full rounded-lg" />
              <Skeleton className="h-4 w-2/3 rounded-lg" />
              <Skeleton className="h-4 w-3/4 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
