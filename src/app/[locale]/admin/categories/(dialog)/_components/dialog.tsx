"use client";

import { useFileUpload } from "@/hooks/use-file-upload";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/trpc/react";
import { log } from "@/utils/react/logger";
import { skipToken } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { type FC } from "react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

import { CreateCategoryForm, type CreateCategoryFormValues } from "./form";

interface CreateCategoryDialogProps {
  categoryId?: number;
}

export const CreateCategoryDialog: FC<CreateCategoryDialogProps> = ({ categoryId }) => {
  const router = useRouter();
  const t = useTranslations();
  const utils = api.useUtils();

  const uploadClient = useFileUpload({ endpoint: "/api/trpc/categories.createCategory" });

  const {
    data: category,
    isLoading,
    isFetched,
  } = api.categories.getCategoryById.useQuery(categoryId ? { id: categoryId } : skipToken);

  const { mutateAsync: updateCategory } = api.categories.updateCategory.useMutation({
    onSuccess: () => {
      void utils.invalidate();
      toast.success(t("category_updated"));
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = async (values: CreateCategoryFormValues) => {
    try {
      log.debug("Creating category", values);

      if (categoryId) {
        await updateCategory({ id: categoryId, ...values });
        return router.back();
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
              reject(new Error(t("error_upload_failed")));
              return;
            }
            resolve();
          })
          .catch(reject);
      });

      // Invalidate categories query
      await utils.invalidate();
      toast.success(t("category_created"));
      router.back();
    } catch (error) {
      if (error instanceof Error) {
        log.error(error);
        toast.error(error.message);
      } else {
        log.error(error);
        toast.error(t("error_unknown"));
      }
    }
  };

  return (
    <Dialog open onOpenChange={() => router.back()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{categoryId ? t("edit_category") : t("create_category")}</DialogTitle>
          <DialogDescription>
            {categoryId ? t("edit_category_description") : t("create_category_description")}
          </DialogDescription>
        </DialogHeader>
        {categoryId && isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-10" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-32" />
            <Skeleton className="h-10 ml-auto w-24" />
          </div>
        )}
        {(!categoryId || isFetched) && (
          <CreateCategoryForm defaultValues={category} onSubmit={onSubmit} uploadClient={uploadClient} />
        )}
      </DialogContent>
    </Dialog>
  );
};
