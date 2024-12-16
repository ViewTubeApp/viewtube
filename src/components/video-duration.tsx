import { type FC } from "react";

import { formatVideoDuration } from "@/lib/video/client";

interface VideoDurationProps {
  duration: number;
}

export const VideoDuration: FC<VideoDurationProps> = ({ duration }) => {
  return <span className="rounded-sm bg-background/80 p-1 text-xs font-semibold text-foreground">{formatVideoDuration(duration)}</span>;
};
