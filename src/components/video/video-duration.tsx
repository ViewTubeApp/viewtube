import { formatVideoDuration } from "@/utils/react/video";
import { type FC } from "react";

interface VideoDurationProps {
  duration: number;
}

export const VideoDuration: FC<VideoDurationProps> = ({ duration }) => {
  return (
    <span className="rounded-sm bg-black/60 p-1 text-xs font-semibold text-white">{formatVideoDuration(duration)}</span>
  );
};
