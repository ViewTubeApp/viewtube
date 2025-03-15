"use client";

import { api } from "@/trpc/react";
import { getRandomUsername } from "@excalidraw/random-username";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { memo, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { cn } from "@/lib/utils";

import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem } from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

interface NewCommentProps {
  videoId: number;
  parentId?: number;
  className?: string;
  onCancel?: () => void;
  onSubmit?: () => void;
}

export const NewComment = memo<NewCommentProps>(({ className, videoId, parentId, onCancel, onSubmit }) => {
  const t = useTranslations();

  const [focused, setFocused] = useState(false);

  const schema = z.object({
    content: z.string().min(1, { message: t("error_comment_required") }),
    username: z.string().min(1, { message: t("error_username_required") }),
  });

  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    mode: "all",
    resolver: zodResolver(schema),
    defaultValues: {
      content: "",
      username: getRandomUsername(),
    },
  });

  const { mutateAsync: createComment, isPending } = api.comments.createComment.useMutation({
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { isDirty, isValid } = form.formState;

  const saveComment: SubmitHandler<FormValues> = async (data) => {
    await createComment({
      videoId,
      parentId,
      content: data.content,
      username: data.username,
    });

    form.resetField("content", { defaultValue: "" });
    onSubmit?.();
  };

  const handleCancel = () => {
    form.reset({ content: "", username: "" });
    setFocused(false);
    onCancel?.();
  };

  return (
    <Form {...form}>
      <form
        className={cn("flex flex-col items-end gap-2", className)}
        onSubmit={form.handleSubmit(saveComment)}
        onFocus={() => setFocused(true)}
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <Input placeholder={t("username_placeholder")} {...field} />
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
                <Textarea {...field} placeholder={t("comment_placeholder")} className="rounded-xl" />
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
              onClick={handleCancel}
            >
              {t("cancel")}
            </Button>

            <Button
              disabled={!isDirty || !isValid || isPending}
              type="submit"
              size="sm"
              variant="outline"
              className="rounded-full"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {t("add_comment")}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
});

NewComment.displayName = "NewComment";
