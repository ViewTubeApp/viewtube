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

export function useLiveComments({ videoId, initialData }: UseLiveCommentsProps) {
  const queryClient = useQueryClient();

  const [, query] = api.comments.getComments.useSuspenseQuery(
    { videoId },
    {
      initialData,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  );

  const [comments, setComments] = useState(() => query.data);
  type Comment = NonNullable<typeof comments>[number];

  const addComment = useCallback(
    (incoming: Comment[]) => {
      setComments((current) => {
        const map: Record<Comment["id"], Comment> = {};

        // First, copy all existing comments to the map
        for (const value of current ?? []) {
          map[value.id] = value;
        }

        // Then process incoming comments
        for (const value of incoming ?? []) {
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

        return Object.values(map).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      });

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

          return Object.values(map).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        },
      );
    },
    [queryClient, videoId],
  );

  useEffect(() => {
    addComment(query.data);
  }, [addComment, query.data]);

  const [lastEventId, setLastEventId] = useState<false | null | number>(false);

  if (comments && lastEventId === false) {
    setLastEventId(comments.at(-1)?.id ?? null);
  }

  const subscription = api.comments.onCommentAdded.useSubscription(
    lastEventId === false ? skipToken : { videoId, lastEventId },
    {
      onData: (event) => {
        addComment([event.data]);
      },
      onError: (error) => {
        toast.error(error.message);

        const lastCommentEventId = comments?.at(-1)?.id;
        if (lastCommentEventId) {
          setLastEventId(lastCommentEventId);
        }
      },
    },
  );

  return { query, comments, subscription };
}
