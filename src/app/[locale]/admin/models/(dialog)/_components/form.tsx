"use client";

import { getPublicURL } from "@/utils/react/video";
import { Loader2, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { type FC } from "react";
import { z } from "zod";

import { useAppForm } from "@/lib/form";

import { DialogFooter } from "@/components/ui/dialog";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Image } from "@/components/ui/image";
import { UploadDropzone } from "@/components/upload-dropzone";

export interface CreateModelFormValues {
  name: string;
  file_key: string;
}

interface CreateModelFormProps {
  defaultValues?: CreateModelFormValues;
  onSubmit: (values: CreateModelFormValues) => Promise<void>;
}

export const CreateModelForm: FC<CreateModelFormProps> = ({ defaultValues, onSubmit }) => {
  const t = useTranslations();

  const schema = z.object({
    name: z.string().min(1, { message: t("error_name_required") }),
    file_key: z.string().min(1, { message: t("error_file_required") }),
  });

  const form = useAppForm({
    validators: {
      onChange: schema,
    },
    defaultValues: {
      name: defaultValues?.name ?? "",
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
      <form.AppField name="name">
        {(field) => (
          <FormItem>
            <FormLabel>{t("name")}</FormLabel>
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

      <form.Subscribe selector={(state) => [state.values.file_key, state.values.name]}>
        {([file_key, name]) => {
          return (
            file_key && (
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <Image fill src={getPublicURL(file_key)} alt={name || ""} />
              </div>
            )
          );
        }}
      </form.Subscribe>

      <form.Subscribe selector={(state) => state.values.file_key}>
        {(file_key) =>
          !file_key && (
            <form.AppField name="file_key" validators={{ onChangeListenTo: ["name"] }}>
              {(field) => (
                <UploadDropzone
                  endpoint="image_uploader"
                  onChangeTitle={(title) => {
                    if (form.getFieldValue("name")) {
                      return;
                    }

                    form.setFieldValue("name", title);
                    form.validateField("name", "change");
                  }}
                  onChangeFileKey={field.handleChange}
                />
              )}
            </form.AppField>
          )
        }
      </form.Subscribe>

      <DialogFooter>
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <form.Button type="submit" disabled={!canSubmit}>
              {isSubmitting ?
                <Loader2 className="size-4 animate-spin" />
              : <Save className="size-4" />}{" "}
              {t("save")}
            </form.Button>
          )}
        </form.Subscribe>
      </DialogFooter>
    </form>
  );
};
