import { useFormattedDistance } from "@/hooks/use-formatted-distance";
import { useLiveComments } from "@/hooks/use-live-comments";
import * as m from "@/paraglide/messages";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronUp, Loader2, ThumbsDown, ThumbsUp } from "lucide-react";
import { type FC, useState } from "react";
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

const CommentItem: FC<CommentItemProps> = ({ comment, isReply = false }) => {
  const formattedDistance = useFormattedDistance();

  return (
    <div className={cn("flex gap-4", isReply && "ml-12")}>
      <Avatar>
        <AvatarFallback>
          {comment.username
            .split(" ")
            .map((name) => name[0]?.toUpperCase() ?? "")
            .filter(Boolean)
            .slice(0, 2)
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
            {m.reply()}
          </Button>
        </div>
      </div>
    </div>
  );
};

interface CommentProps {
  comment: CommentResponse;
}

const Comment: FC<CommentProps> = ({ comment }) => {
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
            {comment.replies.length === 1 ?
              m.reply_count_one({ count: comment.replies.length })
            : m.reply_count_many({ count: comment.replies.length })}
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
};

interface NewCommentProps {
  videoId: number;
  className?: string;
}

const NewComment: FC<NewCommentProps> = ({ className, videoId }) => {
  const [focused, setFocused] = useState(false);

  const schema = z.object({
    content: z.string().min(1, { message: m.error_comment_required() }),
    username: z.string().min(1, { message: m.error_username_required() }),
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
      <form
        className={cn("flex flex-col items-end gap-3", className)}
        onSubmit={form.handleSubmit(onSubmit)}
        onFocus={() => setFocused(true)}
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <Input placeholder={m.username_placeholder()} {...field} />
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
                <Textarea {...field} placeholder={m.comment_placeholder()} className="rounded-xl" />
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
              {m.cancel()}
            </Button>

            <Button
              disabled={!isDirty || !isValid || isPending}
              type="submit"
              size="sm"
              variant="default"
              className="rounded-full"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {m.add_comment()}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};

interface CommentListProps {
  className?: string;
  comments: CommentListResponse;
}

const CommentList: FC<CommentListProps> = ({ className, comments }) => {
  return (
    <div className={cn("space-y-4", className)}>
      {comments.map((comment) => (
        <Comment key={comment.id} comment={comment} />
      ))}
    </div>
  );
};

interface VideoCommentsProps {
  videoId: number;
  comments: CommentListResponse;
}

export const VideoComments: FC<VideoCommentsProps> = ({ videoId, comments: initialComments }) => {
  const { comments } = useLiveComments({ videoId, initialData: initialComments });

  return (
    <>
      <h2 className="text-xl font-bold mb-6">
        {comments.length === 1 ?
          m.comments_count_one({ count: comments.length })
        : m.comments_count_many({ count: comments.length })}
      </h2>
      <NewComment videoId={videoId} />
      <CommentList comments={comments} />
    </>
  );
};
