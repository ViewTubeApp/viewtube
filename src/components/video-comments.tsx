import { useFormattedDistance } from "@/hooks/use-formatted-distance";
import { useLiveComments } from "@/hooks/use-live-comments";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronUp, Loader2, ThumbsDown, ThumbsUp } from "lucide-react";
import { memo, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { type CommentListResponse, type CommentResponse } from "@/server/api/routers/comments";

import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Form, FormControl, FormField, FormItem } from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

interface CommentItemProps {
  isReply?: boolean;
  comment: CommentResponse;
}

const CommentItem = memo<CommentItemProps>(({ comment, isReply = false }) => {
  const formattedDistance = useFormattedDistance();

  return (
    <div className={cn("flex gap-4", isReply && "ml-12")}>
      <Avatar>
        <AvatarFallback>
          {comment.username
            .split(" ")
            .map((name) => name[0])
            .join("")}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{comment.username}</span>
          <span className="text-xs text-gray-500">{formattedDistance(comment.createdAt)}</span>
        </div>

        <p className="mt-1 text-sm text-foreground">{comment.content}</p>

        <div className="mt-2 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button variant="ghost" className="flex items-center gap-1 rounded-full px-3 py-2 h-auto">
              <ThumbsUp className="size-3" />
              <span className="text-xs">{comment.likesCount}</span>
            </Button>
            <Button variant="ghost" className="flex items-center gap-1 rounded-full px-3 py-2 h-auto">
              <ThumbsDown className="size-3" />
              <span className="text-xs">{comment.dislikesCount}</span>
            </Button>
          </div>
          <Button variant="ghost" className="rounded-full px-3 py-2 text-xs h-auto">
            Reply
          </Button>
        </div>
      </div>
    </div>
  );
});

CommentItem.displayName = "CommentItem";

interface CommentProps {
  comment: CommentResponse;
}

const Comment = memo<CommentProps>(({ comment }) => {
  const [showReplies, setShowReplies] = useState(false);

  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <div className="space-y-1">
      <CommentItem comment={comment} />
      {hasReplies && (
        <>
          <Button
            variant="link"
            className="ml-10 flex items-center gap-1 px-3 py-2 h-auto text-sm font-medium text-blue-600"
            onClick={() => setShowReplies(!showReplies)}
          >
            {showReplies ?
              <ChevronUp className="size-4" />
            : <ChevronDown className="size-4" />}
            {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
          </Button>

          {showReplies && (
            <div className="mt-2 space-y-2">
              {comment.replies.map((reply) => (
                <CommentItem key={reply.id} comment={{ ...reply, replies: [] }} isReply />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
});

Comment.displayName = "Comment";

interface NewCommentProps {
  videoId: number;
  className?: string;
}

export const NewComment = memo<NewCommentProps>(({ className, videoId }) => {
  const [focused, setFocused] = useState(false);

  const schema = z.object({
    content: z.string().min(1, { message: "Comment is required" }),
    username: z.string().min(1, { message: "Username is required" }),
  });

  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    mode: "all",
    resolver: zodResolver(schema),
    defaultValues: { content: "", username: "" },
  });

  const { mutateAsync: createComment, isPending } = api.comments.createComment.useMutation();

  const { isDirty, isValid } = form.formState;

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    await createComment({
      videoId,
      content: data.content,
      username: data.username,
    });

    form.resetField("content", { defaultValue: "" });
  };

  return (
    <Form {...form}>
      <form className={cn("flex flex-col items-end gap-3", className)} onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <Input placeholder="Type your name..." {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Add a comment..."
                  className="rounded-xl"
                  onFocus={() => setFocused(true)}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {focused && (
          <div className="flex items-center gap-2">
            <Button
              disabled={isPending}
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => setFocused(false)}
            >
              Cancel
            </Button>

            <Button
              disabled={!isDirty || !isValid || isPending}
              type="submit"
              size="sm"
              variant="default"
              className="rounded-full"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Add comment
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
});

NewComment.displayName = "NewComment";

interface CommentListProps {
  className?: string;
  comments: CommentListResponse;
}

const CommentList = memo<CommentListProps>(({ className, comments }) => {
  return (
    <div className={cn("space-y-4", className)}>
      {comments.map((comment) => (
        <Comment key={comment.id} comment={comment} />
      ))}
    </div>
  );
});

CommentList.displayName = "CommentList";

interface VideoCommentsProps {
  videoId: number;
  comments: CommentListResponse;
}

export const VideoComments = memo<VideoCommentsProps>(({ videoId, comments: initialComments }) => {
  const { comments } = useLiveComments({ videoId, initialData: initialComments });

  return (
    <>
      <h2 className="text-xl font-bold mb-6">{comments.length} comments</h2>
      <NewComment videoId={videoId} />
      <CommentList comments={comments} />
    </>
  );
});

VideoComments.displayName = "VideoComments";
