import { cn } from "@/utils/shared/clsx";
import { AlertTriangleIcon } from "lucide-react";
import { type FC } from "react";

import { Skeleton } from "./ui/skeleton";

interface MediaLoaderProps {
  isError: boolean;
  isLoaded: boolean;
}

export const MediaLoader: FC<MediaLoaderProps> = ({ isLoaded, isError }) => {
  return (
    <>
      <Skeleton className={cn("absolute rounded-lg inset-0", { "opacity-0": isLoaded })} />
      <div className={cn("absolute inset-0 flex items-center justify-center", { "opacity-0": !isError })}>
        <AlertTriangleIcon className="size-[25%] text-red-500" />
      </div>
    </>
  );
};
