import * as m from "@/paraglide/messages";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { type FC } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { type CreateCategorySchema } from "@/server/api/routers/categories";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const schema = z.object({
  slug: z
    .string()
    .min(1, { message: "Slug is required" })
    .regex(/^[a-z0-9_-]+$/, { message: "Slug must be lowercase" }),
}) satisfies z.ZodType<CreateCategorySchema>;

interface CreateCategoryFormProps {
  defaultValues?: CreateCategorySchema;
  onSubmit: (values: CreateCategorySchema) => void;
}

export const CreateCategoryForm: FC<CreateCategoryFormProps> = ({ defaultValues, onSubmit }) => {
  const form = useForm<CreateCategorySchema>({
    mode: "all",
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? { slug: "" },
  });

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{m.slug()}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button
            type="submit"
            disabled={!form.formState.isValid || !form.formState.isDirty || form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ?
              <Loader2 className="size-4 animate-spin" />
            : <Save className="size-4" />}{" "}
            {m.save()}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
