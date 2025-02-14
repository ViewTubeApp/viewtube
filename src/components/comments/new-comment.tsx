import * as m from "@/paraglide/messages";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { type FC, useState } from "react";
import { Form, type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "@/lib/utils";

import { Button } from "../ui/button";
import { FormControl, FormField, FormItem } from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

interface NewCommentProps {
  videoId: number;
  className?: string;
}

export const NewComment: FC<NewCommentProps> = ({ className, videoId }) => {
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
        className={cn("flex flex-col items-end gap-2", className)}
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
