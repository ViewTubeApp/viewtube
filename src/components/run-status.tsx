import { api } from "@/trpc/react";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { Loader2 } from "lucide-react";
import { type FC, useEffect } from "react";

import { type StoredRun, db } from "@/lib/db";
import { cn } from "@/lib/utils";

interface RunStatusProps {
  run: StoredRun;
}

export const RunStatus: FC<RunStatusProps> = ({ run }) => {
  const utils = api.useUtils();

  const { run: realtime, error } = useRealtimeRun(run.runId, { accessToken: run.publicAccessToken });

  useEffect(() => {
    if (realtime?.status === "COMPLETED") {
      void utils.video.invalidate();
      void db.runs.delete(run.runId);
    }
  }, [realtime?.status, run.runId, utils]);

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
