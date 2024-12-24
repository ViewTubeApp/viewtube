import { api } from "@/trpc/react";
import { log as globalLog } from "@/utils/react/logger";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { type VideoExtended } from "@/server/db/schema";

import { DASHBOARD_QUERY_OPTIONS } from "@/constants/query";

export function useUpdateVideoMutation() {
  const router = useRouter();

  const queryClient = useQueryClient();
  const log = globalLog.withTag("UpdateVideoMutation");
  const videoListQueryKey = getQueryKey(api.video.getVideoList, DASHBOARD_QUERY_OPTIONS);

  return api.video.updateVideo.useMutation({
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: videoListQueryKey });
      const previousVideos = queryClient.getQueryData<VideoExtended[]>(videoListQueryKey);

      queryClient.setQueryData(videoListQueryKey, (old: VideoExtended[] | undefined) => {
        if (!old) return [];
        return old.map((video) => (video.id === data.id ? { ...video, ...data } : video));
      });

      return { previousVideos };
    },
    onSuccess: () => {
      toast.success("Video updated successfully");
      router.push("/admin/dashboard");
    },
    onError: (error, _, context) => {
      toast.error(error.message);
      log.error(error);
      queryClient.setQueryData(videoListQueryKey, context?.previousVideos);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: videoListQueryKey });
    },
  });
}
