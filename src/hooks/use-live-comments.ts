import { api } from "@/trpc/react";
import { logger } from "@/utils/react/logger";
import { skipToken, useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { useCallback, useEffect, useState } from "react";

import { type CommentListResponse } from "@/server/api/routers/comments";

interface UseLiveCommentsProps {
  videoId: number;
  comments: CommentListResponse;
}

const log = logger.withTag("user:comments:live");

/**
 * Hook for managing live comments on a video
 *
 * - Provides real-time comment updates using tRPC subscriptions
 * - Handles both top-level comments and replies
 *
 * @param options.videoId - ID of the video the comments belong to
 * @param options.comments - Initial comment data to display
 * @returns Object containing the current comment data and subscription status
 */
export function useLiveComments({ videoId, comments }: UseLiveCommentsProps) {
  const queryClient = useQueryClient();

  type Comment = NonNullable<typeof comments>[number];

  /**
   *  Adds new comments to the state and updates React Query cache
   *
   * - Handles both top-level comments and replies
   * - Sorts comments by creation time (newest first)
   *
   * @param incoming - New comments to add
   */
  const addComment = useCallback(
    (incoming: Comment[]) => {
      // Update React Query cache
      queryClient.setQueryData(
        getQueryKey(api.comments.getComments, { videoId }, "query"),
        (cache: Comment[] | undefined) => {
          if (!cache) return cache;

          const map: Record<Comment["id"], Comment> = {};

          // First, copy all existing comments to the map
          for (const value of cache) {
            map[value.id] = value;
          }

          // Then process incoming comments
          for (const value of incoming) {
            if (value.parent_id === null) {
              // For top-level comments, just add them to the map
              map[value.id] = value;
            } else {
              // For replies, update the parent's replies array
              const parent = map[value.parent_id];
              if (parent) {
                map[value.parent_id] = {
                  ...parent,
                  replies: [...parent.replies, value],
                };
              }
            }
          }

          return Object.values(map).sort((a, b) => b.created_at.getTime() - a.created_at.getTime()) satisfies Comment[];
        },
      );
    },
    [queryClient, videoId],
  );

  // Sync comments state with query data when it changes
  useEffect(() => {
    addComment(comments);
  }, [addComment, comments]);

  const [lastEventId, setLastEventId] = useState<false | null | number>(false);

  // Initialize lastEventId with the ID of the most recent comment
  if (comments && lastEventId === false) {
    setLastEventId(comments.at(-1)?.id ?? null);
  }

  /**
   * Subscribe to real-time comment updates
   *
   * - Adds new comments as they arrive
   * - Handles errors by showing a toast and resetting the lastEventId
   */
  const subscription = api.comments.onCommentAdded.useSubscription(
    lastEventId === false ? skipToken : { videoId, lastEventId },
    {
      onData: (event) => {
        log.debug(event.data);
        addComment([event.data]);
      },
      onError: (error) => {
        log.error(error);

        const lastCommentEventId = comments.at(-1)?.id;
        if (lastCommentEventId) {
          setLastEventId(lastCommentEventId);
        }
      },
    },
  );

  return { subscription };
}
