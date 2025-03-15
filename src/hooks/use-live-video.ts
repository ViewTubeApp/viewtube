import { api } from "@/trpc/react";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { useCallback } from "react";
import { toast } from "sonner";

import { type VideoByIdResponse } from "@/server/api/routers/video";

interface UseLiveVideoProps {
  videoId: number;
}

export function useLiveVideo({ videoId }: UseLiveVideoProps) {
  const queryClient = useQueryClient();

  const updateVideo = useCallback(
    (incoming: VideoByIdResponse) => {
      // Update React Query cache for getVideoById
      queryClient.setQueryData(
        getQueryKey(api.video.getVideoById, { id: videoId }, "query"),
        (cache: VideoByIdResponse | undefined) => {
          if (!cache) return cache;

          return {
            ...cache,
            ...incoming,
          } satisfies VideoByIdResponse;
        },
      );
    },
    [queryClient, videoId],
  );

  // Subscribe to video updates
  const subscription = api.video.onVideoUpdated.useSubscription(
    { id: videoId },
    {
      onData: (event) => {
        updateVideo(event.data);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    },
  );

  return { subscription };
}
