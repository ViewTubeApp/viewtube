"use client";

import { api } from "@/trpc/react";
import { getRandomUsername } from "@excalidraw/random-username";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { memo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { useAppForm } from "@/lib/form";
import { cn } from "@/lib/utils";

import { Button } from "../ui/button";
import { FormControl, FormItem } from "../ui/form";

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

  const form = useAppForm({
    validators: {
      onChange: schema,
    },
    defaultValues: {
      content: "",
      username: getRandomUsername(),
    },
    onSubmit: async ({ value, formApi }) => {
      await createComment({
        video_id: videoId,
        parent_id: parentId,
        content: value.content,
        username: value.username,
      });

      formApi.resetField("content");
      onSubmit?.();
    },
  });

  const { mutateAsync: createComment, isPending } = api.comments.createComment.useMutation({
    onError: (error) => {
      toast.error(t(error.message));
    },
  });

  const handleCancel = () => {
    form.reset({ content: "", username: "" });
    setFocused(false);
    onCancel?.();
  };

  return (
    <form
      className={cn("flex flex-col items-end gap-2", className)}
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
      onFocus={() => setFocused(true)}
    >
      <form.AppField name="username">
        {(field) => (
          <FormItem className="w-full">
            <FormControl>
              <field.Input
                placeholder={t("username_placeholder")}
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
              />
            </FormControl>
          </FormItem>
        )}
      </form.AppField>

      <form.AppField name="content">
        {(field) => (
          <FormItem className="w-full">
            <FormControl>
              <field.Textarea
                placeholder={t("comment_placeholder")}
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
              />
            </FormControl>
          </FormItem>
        )}
      </form.AppField>

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

          <form.Subscribe selector={(state) => [state.isDirty, state.isValid]}>
            {([isDirty, isValid]) => (
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
            )}
          </form.Subscribe>
        </div>
      )}
    </form>
  );
});

NewComment.displayName = "NewComment";
