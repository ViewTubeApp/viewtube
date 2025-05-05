"use client";

import { useRouter } from "@/i18n/navigation";
import { api } from "@/trpc/react";
import { logger } from "@/utils/react/logger";
import { skipToken } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { type FC } from "react";
import { toast } from "sonner";
import { P, match } from "ts-pattern";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

import { CreateCategoryForm, type CreateCategoryFormValues } from "./form";

interface CreateCategoryDialogProps {
  categoryId?: number;
}

export const CreateCategoryDialog: FC<CreateCategoryDialogProps> = ({ categoryId }) => {
  const log = logger.withTag("admin:categories:dialog");

  const router = useRouter();
  const t = useTranslations();
  const utils = api.useUtils();

  const {
    data: category,
    isLoading,
    isFetched,
  } = api.categories.getCategoryById.useQuery(categoryId ? { id: categoryId } : skipToken);

  const mutation = match(categoryId)
    .with(P.number, () => api.categories.updateCategory)
    .with(P.nullish, () => api.categories.createCategory)
    .exhaustive();

  const { mutateAsync } = mutation.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
      toast.success(categoryId ? t("category_updated") : t("category_created"));
      router.back();
    },
    onError: (error) => {
      log.error("mutation error", error);
      toast.error(t(error.message));
    },
  });

  const onSubmit = async (values: CreateCategoryFormValues) => {
    if (categoryId) {
      const fn = mutateAsync as ReturnType<typeof api.categories.updateCategory.useMutation>["mutateAsync"];
      await fn({
        id: categoryId,
        slug: values.slug,
        file_key: values.file_key,
      });
    } else {
      const fn = mutateAsync as ReturnType<typeof api.categories.createCategory.useMutation>["mutateAsync"];
      await fn({
        slug: values.slug,
        file_key: values.file_key,
      });
    }
  };

  return (
    <Dialog open onOpenChange={() => router.back()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{categoryId ? t("edit_category") : t("create_category")}</DialogTitle>
          <DialogDescription className="sr-only">
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
        {(!categoryId || isFetched) && <CreateCategoryForm defaultValues={category} onSubmit={onSubmit} />}
      </DialogContent>
    </Dialog>
  );
};
