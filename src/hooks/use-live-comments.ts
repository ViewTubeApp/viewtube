import { api } from "@/trpc/react";
import { skipToken, useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { type CommentListResponse } from "@/server/api/routers/comments";

interface UseLiveCommentsProps {
  videoId: number;
  initialData: CommentListResponse;
}

/**
 * Hook for managing live comments on a video
 *
 * - Provides real-time comment updates using tRPC subscriptions
 * - Handles both top-level comments and replies
 * - Maintains local state and React Query cache in sync
 *
 * @param options.videoId - ID of the video the comments belong to
 * @param options.initialData - Initial comment data to display
 * @returns Object containing the current comment data and subscription status
 */
export function useLiveComments({ videoId, initialData }: UseLiveCommentsProps) {
  const queryClient = useQueryClient();

  const [, query] = api.comments.getComments.useSuspenseQuery(
    { videoId },
    {
      initialData,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  );

  type Comment = NonNullable<typeof query.data>[number];

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
            if (value.parentId === null) {
              // For top-level comments, just add them to the map
              map[value.id] = value;
            } else {
              // For replies, update the parent's replies array
              const parent = map[value.parentId];
              if (parent) {
                map[value.parentId] = {
                  ...parent,
                  replies: [...parent.replies, value],
                };
              }
            }
          }

          return Object.values(map).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) satisfies Comment[];
        },
      );
    },
    [queryClient, videoId],
  );

  // Sync comments state with query data when it changes
  useEffect(() => {
    addComment(query.data);
  }, [addComment, query.data]);

  const [lastEventId, setLastEventId] = useState<false | null | number>(false);

  // Initialize lastEventId with the ID of the most recent comment
  if (query.data && lastEventId === false) {
    setLastEventId(query.data.at(-1)?.id ?? null);
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
        addComment([event.data]);
      },
      onError: (error) => {
        toast.error(error.message);

        const lastCommentEventId = query.data?.at(-1)?.id;
        if (lastCommentEventId) {
          setLastEventId(lastCommentEventId);
        }
      },
    },
  );

  return { query, subscription };
}
