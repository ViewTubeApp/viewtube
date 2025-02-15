import * as m from "@/paraglide/messages";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Body, type Meta, type Uppy } from "@uppy/core";
import { type Restrictions } from "@uppy/core/lib/Restricter";
import { Loader2, Save } from "lucide-react";
import { type FC } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FileUpload } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const restrictions: Partial<Restrictions> = {
  maxNumberOfFiles: 1,
  allowedFileTypes: ["image/*"],
};

const schema = z.object({
  slug: z.string().min(1, { message: m.error_slug_required() }),

  // Matches the type of the file object returned by Uppy
  file: z
    .object({
      id: z.string(),
      name: z.string(),
      data: z.union([z.instanceof(File), z.instanceof(Blob)]),
    })
    .optional(),
});

export type CreateCategoryFormValues = z.infer<typeof schema>;

interface CreateCategoryFormProps {
  uploadClient: Uppy<Meta, Body>;
  defaultValues?: CreateCategoryFormValues;
  onSubmit: (values: CreateCategoryFormValues) => void;
}

export const CreateCategoryForm: FC<CreateCategoryFormProps> = ({ uploadClient, defaultValues, onSubmit }) => {
  const form = useForm<CreateCategoryFormValues>({
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

        <FileUpload restrictions={restrictions} uppy={uploadClient} height={128} />

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
