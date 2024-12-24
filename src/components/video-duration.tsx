import { formatVideoDuration } from "@/utils/react/video";
import { type FC } from "react";

interface VideoDurationProps {
  duration: number;
}

export const VideoDuration: FC<VideoDurationProps> = ({ duration }) => {
  return <span className="rounded-sm bg-background/80 p-1 text-xs font-semibold text-foreground">{formatVideoDuration(duration)}</span>;
};
