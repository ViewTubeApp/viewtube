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

import { CreateModelForm, type CreateModelFormValues } from "./form";

interface CreateModelDialogProps {
  modelId?: number;
}

export const CreateModelDialog: FC<CreateModelDialogProps> = ({ modelId }) => {
  const log = logger.withTag("admin:models:dialog");

  const utils = api.useUtils();
  const router = useRouter();
  const t = useTranslations();

  const { data: model, isLoading, isFetched } = api.models.getModelById.useQuery(modelId ? { id: modelId } : skipToken);

  const mutation = match(modelId)
    .with(P.number, () => api.models.updateModel)
    .with(P.nullish, () => api.models.createModel)
    .exhaustive();

  const { mutate } = mutation.useMutation({
    onSuccess: () => {
      void utils.invalidate();
      toast.success(modelId ? t("model_updated") : t("model_created"));
      router.back();
    },
    onError: (error) => {
      log.error("mutation error", error);
      toast.error(t(error.message));
    },
  });

  const onSubmit = async (values: CreateModelFormValues) => {
    if (modelId) {
      const fn = mutate as ReturnType<typeof api.models.updateModel.useMutation>["mutate"];
      fn({
        id: modelId,
        name: values.name,
        file_key: values.file_key,
      });
    } else {
      const fn = mutate as ReturnType<typeof api.models.createModel.useMutation>["mutate"];
      fn({
        name: values.name,
        file_key: values.file_key,
      });
    }
  };

  return (
    <Dialog open onOpenChange={() => router.back()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{modelId ? t("edit_model") : t("create_model")}</DialogTitle>
          <DialogDescription>{modelId ? t("edit_model_description") : t("create_model_description")}</DialogDescription>
        </DialogHeader>
        {modelId && isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-10" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-32" />
            <Skeleton className="h-10 ml-auto w-24" />
          </div>
        )}
        {(!modelId || isFetched) && <CreateModelForm defaultValues={model} onSubmit={onSubmit} />}
      </DialogContent>
    </Dialog>
  );
};
