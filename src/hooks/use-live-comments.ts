import { api } from "@/trpc/react";
import { skipToken } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { type CommentListResponse } from "@/server/api/routers/comments";

interface UseLiveCommentsProps {
  videoId: number;
  initialData: CommentListResponse;
}

export function useLiveComments({ videoId, initialData }: UseLiveCommentsProps) {
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

  const addComment = useCallback((incoming: Comment[]) => {
    setComments((current) => {
      const map: Record<Comment["id"], Comment> = {};
      for (const value of current ?? []) {
        map[value.id] = value;
      }
      for (const value of incoming ?? []) {
        map[value.id] = value;
      }
      return Object.values(map).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    });
  }, []);

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
        addComment([{ ...event.data, replies: [] }]);
      },
      onError: (error) => {
        toast.error(error.message);

        const lastCommentEventId = comments.at(-1)?.id;
        if (lastCommentEventId) {
          setLastEventId(lastCommentEventId);
        }
      },
    },
  );

  return { query, comments, subscription };
}
