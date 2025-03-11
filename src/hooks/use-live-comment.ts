import { api } from "@/trpc/react";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { type CommentListElement } from "@/server/api/routers/comments";

interface UseLiveCommentProps {
  videoId: number;
  initialData: CommentListElement;
}

/**
 * Hook for managing live comment updates for a video
 * 
 * Provides real-time updates to a comment by subscribing to comment update events
 * and automatically updating both local state and query cache when changes occur.
 * 
 * @param videoId - ID of the video the comment belongs to
 * @param initialData - Initial comment data to display
 * @returns Object containing the current comment data and subscription status
 */
export function useLiveComment({ videoId, initialData }: UseLiveCommentProps) {
  const queryClient = useQueryClient();

  const [comment, setComment] = useState(() => initialData);

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
      setComment((current) => {
        if (incoming.id === current.id) {
          return incoming;
        }

        return current;
      });

      queryClient.setQueryData(
        getQueryKey(api.comments.getComments, { videoId }, "query"),
        (cache: CommentListElement[] | undefined) => {
          if (!cache) return cache;

          return cache.map((item) => {
            if (item.id === incoming.id) {
              return incoming;
            }

            return item;
          });
        },
      );
    },
    [queryClient, videoId],
  );

  const subscription = api.comments.onCommentUpdated.useSubscription(
    { videoId, lastEventId: null },
    {
      onData: (event) => {
        updateComment(event.data);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    },
  );

  return {
    comment,
    subscription,
  };
}
