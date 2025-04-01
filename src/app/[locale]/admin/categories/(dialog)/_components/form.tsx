import { getPublicURL } from "@/utils/react/video";
import { Loader2, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { type FC } from "react";
import { z } from "zod";

import { useAppForm } from "@/lib/form";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { NiceImage } from "@/components/ui/nice-image";
import { UploadDropzone } from "@/components/upload-dropzone";

export interface CreateCategoryFormValues {
  slug: string;
  file_key: string;
}

interface CreateCategoryFormProps {
  defaultValues?: CreateCategoryFormValues;
  onSubmit: (values: CreateCategoryFormValues) => void;
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

      <form.Subscribe selector={(state) => [state.values.file_key, state.values.slug]}>
        {([file_key, slug]) =>
          file_key && (
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <NiceImage fill src={getPublicURL(file_key)} alt={slug || ""} />
            </div>
          )
        }
      </form.Subscribe>

      <form.Subscribe selector={(state) => state.values.file_key}>
        {(file_key) =>
          !file_key && (
            <UploadDropzone
              endpoint="image_uploader"
              onChangeTitle={(title) => form.setFieldValue("slug", title)}
              onChangeFileKey={(key) => form.setFieldValue("file_key", key)}
            />
          )
        }
      </form.Subscribe>

      <DialogFooter>
        <form.Subscribe
          selector={(state) => [state.isValid && state.isDirty && !state.isSubmitting, state.isSubmitting]}
        >
          {([isValid, isSubmitting]) => (
            <Button type="submit" disabled={!isValid}>
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
