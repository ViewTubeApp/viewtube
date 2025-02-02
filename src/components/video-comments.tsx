import { useFormattedDistance } from "@/hooks/use-formatted-distance";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronUp, ThumbsDown, ThumbsUp } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { memo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "@/lib/utils";

import { motions } from "@/constants/motion";

import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Form, FormControl, FormField, FormItem } from "./ui/form";
import { Textarea } from "./ui/textarea";

interface Comment {
  id: number;
  author: string;
  content: string;
  likes: number;
  dislikes: number;
  createdAt: Date;
  replies?: Comment[];
}

// Mock data
const data: Comment[] = [
  {
    id: 1,
    author: "John Doe",
    content: "This is an amazing video! Thanks for sharing.",
    likes: 124,
    dislikes: 2,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    replies: [
      {
        id: 3,
        author: "Jane Smith",
        content: "Totally agree with you!",
        likes: 15,
        dislikes: 0,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
      },
    ],
  },
  {
    id: 2,
    author: "Alice Johnson",
    content: "Great explanation, very helpful!",
    likes: 89,
    dislikes: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 48 hours ago
  },
];

const CommentItem = memo(({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
  const formattedDistance = useFormattedDistance();

  return (
    <div className={cn("flex gap-4", isReply && "ml-12")}>
      <Avatar>
        <AvatarFallback>
          {comment.author
            .split(" ")
            .map((name) => name[0])
            .join("")}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{comment.author}</span>
          <span className="text-xs text-gray-500">{formattedDistance(comment.createdAt)}</span>
        </div>

        <p className="mt-1 text-sm text-foreground">{comment.content}</p>

        <div className="mt-2 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button variant="ghost" className="flex items-center gap-1 rounded-full px-3 py-2 h-auto">
              <ThumbsUp className="size-3" />
              <span className="text-xs">{comment.likes}</span>
            </Button>
            <Button variant="ghost" className="flex items-center gap-1 rounded-full px-3 py-2 h-auto">
              <ThumbsDown className="size-3" />
              <span className="text-xs">{comment.dislikes}</span>
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

const Comment = memo(({ comment }: { comment: Comment }) => {
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
            {comment.replies!.length} {comment.replies!.length === 1 ? "reply" : "replies"}
          </Button>

          {showReplies && (
            <div className="mt-2 space-y-2">
              {comment.replies!.map((reply) => (
                <CommentItem key={reply.id} comment={reply} isReply />
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
  className?: string;
}

export const NewComment = memo<NewCommentProps>(({ className }) => {
  const [focused, setFocused] = useState(false);

  const schema = z.object({
    content: z.string().min(1, { message: "Comment i1s required" }),
  });

  const form = useForm({
    mode: "all",
    resolver: zodResolver(schema),
  });

  const { isDirty, isValid } = form.formState;

  return (
    <Form {...form}>
      <form className={cn("flex flex-col items-end gap-3", className)}>
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

        <AnimatePresence>
          {focused && (
            <motion.div {...motions.slide.y.in} className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => setFocused(false)}
              >
                Cancel
              </Button>

              <Button
                disabled={!isDirty || !isValid}
                type="submit"
                size="sm"
                variant="default"
                className="rounded-full"
              >
                Add comment
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </Form>
  );
});

NewComment.displayName = "NewComment";

interface CommentListProps {
  className?: string;
}

const CommentList = memo<CommentListProps>(({ className }) => {
  return (
    <div className={cn("space-y-4", className)}>
      {data.map((comment) => (
        <Comment key={comment.id} comment={comment} />
      ))}
    </div>
  );
});

CommentList.displayName = "CommentList";

export const VideoComments = memo(() => {
  return (
    <>
      <h2 className="text-xl font-bold mb-6">2 comments</h2>
      <NewComment />
      <CommentList />
    </>
  );
});

VideoComments.displayName = "VideoComments";
