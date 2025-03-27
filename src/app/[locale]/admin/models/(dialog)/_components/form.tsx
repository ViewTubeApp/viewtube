"use client";

import { logger } from "@/utils/react/logger";
import { UploadDropzone } from "@/utils/react/uploadthing";
import { getPublicURL } from "@/utils/react/video";
import { zodResolver } from "@hookform/resolvers/zod";
import invariant from "invariant";
import { Loader2, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { type FC } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { NiceImage } from "@/components/nice-image";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export interface CreateModelFormValues {
  name: string;
  file_key: string;
}

interface CreateModelFormProps {
  defaultValues?: CreateModelFormValues;
  onSubmit: (values: CreateModelFormValues) => void;
}

export const CreateModelForm: FC<CreateModelFormProps> = ({ defaultValues, onSubmit }) => {
  const log = logger.withTag("admin:models:form");
  const t = useTranslations();

  const schema = z.object({
    name: z.string().min(1, { message: t("error_name_required") }),
    file_key: z.string().min(1, { message: t("error_file_required") }),
  });

  const form = useForm<CreateModelFormValues>({
    mode: "all",
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {
      name: "",
      file_key: "",
    },
  });

  const name = form.watch("name");
  const fileKey = form.watch("file_key");

  const isDirty = Object.keys(form.formState.dirtyFields).length > 0;
  const isAllowedToSubmit = form.formState.isValid && isDirty && !form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("name")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {fileKey && (
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <NiceImage fill src={getPublicURL(fileKey)} alt={name} />
          </div>
        )}

        {!fileKey && (
          <UploadDropzone
            endpoint="image_uploader"
            config={{ mode: "auto" }}
            uploadProgressGranularity="fine"
            onBeforeUploadBegin={(files) => {
              const [file] = files;
              invariant(file, "file is required");

              const { name } = file;
              const [title] = name.split(".");

              if (title) {
                form.setValue("name", title, {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                });
              }

              return files;
            }}
            onClientUploadComplete={(res) => {
              log.debug("upload completed", res);

              const [file] = res;

              if (!file) {
                toast.error(t("error_upload_failed"));
                return;
              }

              const { key } = file;
              form.setValue("file_key", key, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              });
            }}
            onUploadError={(error: Error) => {
              log.error("upload error", error);
              toast.error(error.message);
            }}
          />
        )}

        <DialogFooter>
          <Button type="submit" disabled={!isAllowedToSubmit}>
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
