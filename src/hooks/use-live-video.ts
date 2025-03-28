import { api } from "@/trpc/react";
import { logger } from "@/utils/react/logger";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { useCallback } from "react";

import { type VideoByIdResponse } from "@/server/api/routers/video";

interface UseLiveVideoProps {
  videoId: number;
}

const log = logger.withTag("user:video:live");

/**
 * Hook for managing live video updates
 *
 * Provides real-time updates to a video by subscribing to video update events
 * and automatically updating both local state and query cache when changes occur.
 *
 * @param options.videoId - ID of the video to subscribe to
 * @returns Object containing the current video data and subscription status
 */
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
        log.debug(event.data);
        updateVideo(event.data);
      },
      onError: (error) => {
        log.error(error);
      },
    },
  );

  return { subscription };
}
