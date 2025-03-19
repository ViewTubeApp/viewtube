import { zodResolver } from "@hookform/resolvers/zod";
import { type Body, type Meta, type Uppy, type UppyFile } from "@uppy/core";
import { type Restrictions } from "@uppy/core/lib/Restricter";
import { Loader2, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { type FC } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { FileUpload } from "@/components/ui/file-upload";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const restrictions: Partial<Restrictions> = {
  maxNumberOfFiles: 1,
  allowedFileTypes: ["image/*"],
};

export interface CreateCategoryFormValues {
  slug: string;
  file?: Pick<UppyFile<Meta, Body>, "name" | "id" | "data">;
}

interface CreateCategoryFormProps {
  uploadClient: Uppy<Meta, Body>;
  defaultValues?: CreateCategoryFormValues;
  onSubmit: (values: CreateCategoryFormValues) => void;
}

export const CreateCategoryForm: FC<CreateCategoryFormProps> = ({ uploadClient, defaultValues, onSubmit }) => {
  const t = useTranslations();

  const schema = z.object({
    slug: z.string().min(1, { message: t("error_slug_required") }),

    // Matches the type of the file object returned by Uppy
    file: z
      .object({
        id: z.string(),
        name: z.string().optional(),
        data: z.union([z.instanceof(File), z.instanceof(Blob)]),
      })
      .optional(),
  });

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
              <FormLabel>{t("slug")}</FormLabel>
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
            {t("save")}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
