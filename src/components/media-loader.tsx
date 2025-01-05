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
      {!isLoaded && <Skeleton className="absolute rounded-lg inset-0" />}

      {isError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <AlertTriangleIcon className="size-[25%] text-red-500" />
        </div>
      )}
    </>
  );
};
