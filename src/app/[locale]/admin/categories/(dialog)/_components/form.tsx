"use client";

import { Loader2, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { type FC } from "react";
import { z } from "zod";

import { useAppForm } from "@/lib/form";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UploadDropzone } from "@/components/upload-dropzone";

export interface CreateCategoryFormValues {
  slug: string;
  file_key: string;
}

interface CreateCategoryFormProps {
  defaultValues?: CreateCategoryFormValues;
  onSubmit: (values: CreateCategoryFormValues) => Promise<void>;
}

export const CreateCategoryForm: FC<CreateCategoryFormProps> = ({ defaultValues, onSubmit }) => {
  const t = useTranslations();

  const schema = z.object({
    slug: z.string().min(1, { message: t("error_slug_required") }),
    file_key: z.string().min(1, { message: t("error_file_required") }),
  });

  const form = useAppForm({
    validators: {
      onChange: schema,
    },
    defaultValues: {
      slug: defaultValues?.slug ?? "",
      file_key: defaultValues?.file_key ?? "",
    },
    onSubmit: ({ value }) => onSubmit(value),
  });

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.AppField name="slug">
        {(field) => (
          <FormItem>
            <FormLabel>{t("slug")}</FormLabel>
            <FormControl>
              <field.Input
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      </form.AppField>

      <form.AppField name="file_key" validators={{ onChangeListenTo: ["slug"] }}>
        {(field) => (
          <UploadDropzone
            endpoint="image_uploader"
            onChangeTitle={async (title) => {
              if (form.getFieldValue("slug")) {
                return;
              }

              form.setFieldValue("slug", title);
              form.validateField("slug", "change");
            }}
            onChangeFileKey={field.handleChange}
          />
        )}
      </form.AppField>

      <DialogFooter>
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit}>
              {isSubmitting ?
                <Loader2 className="size-4 animate-spin" />
              : <Save className="size-4" />}{" "}
              {t("save")}
            </Button>
          )}
        </form.Subscribe>
      </DialogFooter>
    </form>
  );
};
