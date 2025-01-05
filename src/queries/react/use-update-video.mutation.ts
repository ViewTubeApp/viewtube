import { api } from "@/trpc/react";
import { log as globalLog } from "@/utils/react/logger";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { toast } from "sonner";

import { type VideoListResponse } from "@/server/api/routers/video";

import { useRouter } from "@/lib/i18n";

import { adminVideoListQueryOptions } from "@/constants/query";

export function useUpdateVideoMutation() {
  const router = useRouter();

  const queryClient = useQueryClient();
  const log = globalLog.withTag("UpdateVideoMutation");
  const videoListQueryKey = getQueryKey(api.video.getVideoList, adminVideoListQueryOptions);

  return api.video.updateVideo.useMutation({
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: videoListQueryKey });
      const previousVideos = queryClient.getQueryData<VideoListResponse>(videoListQueryKey);

      queryClient.setQueryData(videoListQueryKey, (old: VideoListResponse | undefined) => {
        if (!old) return { data: [] };

        const next = old.data.map((video) => (video.id === data.id ? { ...video, ...data } : video));

        return {
          ...old,
          data: next,
        };
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
