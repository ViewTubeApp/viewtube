import { api } from "@/trpc/react";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { type VideoByIdResponse } from "@/server/api/routers/video";

interface UseLiveVideoProps {
  videoId: number;
  initialData: VideoByIdResponse;
}

export function useLiveVideo({ videoId, initialData }: UseLiveVideoProps) {
  const queryClient = useQueryClient();

  const [video, setVideo] = useState(() => initialData);

  const updateVideo = useCallback(
    (incoming: VideoByIdResponse) => {
      setVideo((current) => {
        if (!current) return current;

        // If this is not the video we're watching
        if (incoming.id !== current.id) {
          return current;
        }

        return incoming;
      });

      // Update React Query cache for getVideoById
      queryClient.setQueryData(
        getQueryKey(api.video.getVideoById, { id: videoId, related: true, shallow: true }, "query"),
        (cache: VideoByIdResponse | undefined) => {
          if (!cache) return cache;

          return {
            ...cache,
            video: incoming,
          };
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

  return {
    video,
    subscription,
  };
}
