"use client";

import { useFileUpload } from "@/hooks/use-file-upload";
import * as m from "@/paraglide/messages";
import { useCategoryByIdQuery } from "@/queries/react/use-category-by-id.query";
import { useUpdateCategoryMutation } from "@/queries/react/use-update-category.mutation";
import { api } from "@/trpc/react";
import { log } from "@/utils/react/logger";
import { parseAsBoolean, parseAsString, useQueryStates } from "nuqs";
import { type FC, type PropsWithChildren } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

import { CreateCategoryForm, type CreateCategoryFormValues } from "./form";

export const CreateCategoryDialog: FC<PropsWithChildren> = ({ children }) => {
  const utils = api.useUtils();

  const uploadClient = useFileUpload({ endpoint: "/api/trpc/categories.createCategory" });

  const [state, setState] = useQueryStates({
    id: parseAsString,
    edit: parseAsBoolean.withDefault(false),
    create: parseAsBoolean.withDefault(false),
  });

  const { data: category, isLoading, isFetched } = useCategoryByIdQuery(state.id ? { id: state.id } : undefined);
  const { mutateAsync: updateCategory } = useUpdateCategoryMutation();

  const onSubmit = async (values: CreateCategoryFormValues) => {
    try {
      log.debug("Creating category", values);

      if (state.edit && state.id) {
        return updateCategory({ id: state.id, ...values }).then(() => setState({ edit: false }));
      }

      // Get files from Uppy
      const files = uploadClient.getFiles();
      if (files.length === 0) {
        return;
      }

      await new Promise<void>((resolve, reject) => {
        // Set metadata
        uploadClient.setMeta({ slug: values.slug });

        // Start upload
        uploadClient
          .upload()
          .then((result) => {
            if (!result?.successful?.[0]?.response?.body) {
              log.error(result, { event: "UploadCategory", hint: "upload result" });
              reject(new Error(m.error_upload_failed()));
              return;
            }
            resolve();
          })
          .catch(reject)
          .finally(() => void setState({ create: false }));
      });

      // Invalidate categories query
      await utils.categories.invalidate();

      toast.success(m.category_created());
    } catch (error) {
      if (error instanceof Error) {
        log.error(error);
        toast.error(error.message);
      } else {
        log.error(error);
        toast.error(m.error_unknown());
      }
    }
  };

  return (
    <Dialog
      open={state.create || state.edit}
      onOpenChange={(open) => setState({ id: null, edit: false, create: open })}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{m.create_category()}</DialogTitle>
          <DialogDescription>{m.create_category_description()}</DialogDescription>
        </DialogHeader>
        {state.edit && isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-10" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-32" />
            <Skeleton className="h-10 ml-auto w-24" />
          </div>
        )}
        {(state.create || isFetched) && (
          <CreateCategoryForm defaultValues={category} onSubmit={onSubmit} uploadClient={uploadClient} />
        )}
      </DialogContent>
    </Dialog>
  );
};
