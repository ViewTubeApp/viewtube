import { api } from "@/trpc/react";
import { logger } from "@/utils/react/logger";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { useCallback } from "react";

import { type CommentListElement } from "@/server/api/routers/comments";

interface UseLiveCommentProps {
  videoId: number;
}

/**
 * Hook for managing live comment updates for a video
 *
 * Provides real-time updates to a comment by subscribing to comment update events
 * and automatically updating both local state and query cache when changes occur.
 *
 * @param options.videoId - ID of the video the comment belongs to
 * @param options.initialData - Initial comment data to display
 * @returns Object containing the current comment data and subscription status
 */
export function useLiveComment({ videoId }: UseLiveCommentProps) {
  const log = logger.withTag("useLiveComment");
  const queryClient = useQueryClient();

  /**
   * Updates the comment in both local state and query cache
   *
   * When a comment is updated via the subscription, this function ensures
   * that both the local state and the query cache are updated consistently.
   *
   * @param incoming - The updated comment data received from the server
   */
  const updateComment = useCallback(
    (incoming: CommentListElement) => {
      queryClient.setQueryData(
        getQueryKey(api.comments.getComments, { videoId }, "query"),
        (cache: CommentListElement[] | undefined) => {
          if (!cache) return cache;

          return cache.map((item) => {
            if (item.id === incoming.id) {
              return incoming;
            }

            return item;
          }) satisfies CommentListElement[];
        },
      );
    },
    [queryClient, videoId],
  );

  /**
   * Subscribes to real-time comment updates
   *
   * - Adds new comments as they arrive
   * - Handles errors by showing a toast
   */
  const subscription = api.comments.onCommentUpdated.useSubscription(
    { videoId, lastEventId: null },
    {
      onData: (event) => {
        log.debug(event.data);
        updateComment(event.data);
      },
      onError: (error) => {
        log.error(error);
      },
    },
  );

  return { subscription };
}
