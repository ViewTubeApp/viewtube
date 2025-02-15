import { api } from "@/trpc/react";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { type APICommentType } from "@/server/api/routers/comments";

interface UseLiveCommentProps {
  videoId: number;
  initialData: APICommentType;
}

export function useLiveComment({ videoId, initialData }: UseLiveCommentProps) {
  const [comment, setComment] = useState(() => initialData);
  const queryClient = useQueryClient();

  const updateComment = useCallback(
    (incoming: APICommentType) => {
      setComment((current) => {
        // If this is a reply, we don't need to update it
        if (incoming.parentId !== null && incoming.parentId !== current.id) {
          return current;
        }

        // If this is the comment we're watching or one of its replies
        if (incoming.id === current.id) {
          return incoming;
        }

        // If this is a reply to our comment, update the replies array
        if (incoming.parentId === current.id) {
          return {
            ...current,
            replies: current.replies.map((reply) => (reply.id === incoming.id ? incoming : reply)),
          };
        }

        return current;
      });

      // Update React Query cache for getComments
      queryClient.setQueryData(
        getQueryKey(api.comments.getComments, { videoId }, "query"),
        (cache: APICommentType[] | undefined) => {
          if (!cache) return cache;

          return cache.map((item) => {
            // If this is the comment we're updating
            if (item.id === incoming.id) {
              return incoming;
            }

            // If this is a parent comment and we're updating its reply
            if (incoming.parentId === item.id) {
              return {
                ...item,
                replies: item.replies.map((reply) => (reply.id === incoming.id ? incoming : reply)),
              };
            }

            return item;
          });
        },
      );
    },
    [queryClient, videoId],
  );

  // Subscribe to comment updates
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
