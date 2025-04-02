import { api } from "@/trpc/react";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { type RunHandle } from "@trigger.dev/sdk/v3";
import { Loader2 } from "lucide-react";
import { type FC, useEffect } from "react";

import { type VideoListElement } from "@/server/api/routers/video";

import { cn } from "@/lib/utils";

interface RunStatusProps {
  video: VideoListElement;
  run: RunHandle<"process-video", unknown, void>;
}

export const RunStatus: FC<RunStatusProps> = ({ video, run }) => {
  const utils = api.useUtils();

  const { run: realtime, error } = useRealtimeRun(run.id, { accessToken: run.publicAccessToken });

  useEffect(() => {
    if (realtime?.status === "COMPLETED") {
      void utils.video.invalidate();

      const storage = localStorage.getItem("runs");

      if (storage) {
        const runs = JSON.parse(storage);
        delete runs[video.id];
        localStorage.setItem("runs", JSON.stringify(runs));
      }
    }
  }, [realtime?.status, run.id, utils, video.id]);

  if (error) {
    return <span className="text-sm text-red-500 whitespace-nowrap overflow-ellipsis">{error.message}</span>;
  }

  if (!realtime) {
    return <Loader2 className="size-4 animate-spin" />;
  }

  type RunStatus = typeof realtime.status;

  const colors: Record<RunStatus, string> = {
    WAITING_FOR_DEPLOY: "text-gray-500",
    QUEUED: "text-gray-500",
    EXECUTING: "text-yellow-500",
    REATTEMPTING: "text-yellow-500",
    FROZEN: "text-gray-500",
    COMPLETED: "text-green-500",
    CANCELED: "text-gray-500",
    FAILED: "text-red-500",
    CRASHED: "text-red-500",
    INTERRUPTED: "text-red-500",
    SYSTEM_FAILURE: "text-red-500",
    DELAYED: "text-gray-500",
    EXPIRED: "text-gray-500",
    TIMED_OUT: "text-gray-500",
  };

  return (
    <span className={cn("whitespace-nowrap flex items-center gap-1 text-sm", colors[realtime.status])}>
      {realtime.status}
      {realtime.status === "EXECUTING" && <Loader2 className="size-4 animate-spin" />}
    </span>
  );
};
