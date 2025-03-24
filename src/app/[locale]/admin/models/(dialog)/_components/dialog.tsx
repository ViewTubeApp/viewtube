"use client";

import { useFileUpload } from "@/hooks/use-file-upload";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/trpc/react";
import { logger } from "@/utils/react/logger";
import { skipToken } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { type FC } from "react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

import { CreateModelForm, type CreateModelFormValues } from "./form";

interface CreateModelDialogProps {
  modelId?: number;
}

export const CreateModelDialog: FC<CreateModelDialogProps> = ({ modelId }) => {
  const utils = api.useUtils();
  const router = useRouter();
  const t = useTranslations();

  const uploadClient = useFileUpload({ endpoint: "/api/trpc/models.createModel" });

  const { data: model, isLoading, isFetched } = api.models.getModelById.useQuery(modelId ? { id: modelId } : skipToken);

  const { mutateAsync: updateModel } = api.models.updateModel.useMutation({
    onSuccess: () => {
      void utils.invalidate();
      toast.success(t("model_updated"));
    },
    onError: (error) => {
      toast.error(t(error.message));
    },
  });

  const onSubmit = async (values: CreateModelFormValues) => {
    try {
      if (modelId) {
        await updateModel({ id: modelId, ...values });
        return router.back();
      }

      // Get files from Uppy
      const files = uploadClient.getFiles();
      if (files.length === 0) {
        return;
      }

      await new Promise<void>((resolve, reject) => {
        // Set metadata
        uploadClient.setMeta({ name: values.name });

        // Start upload
        uploadClient
          .upload()
          .then((result) => {
            if (!result?.successful?.[0]?.response?.body) {
              logger.error(result, { event: "UploadModel", hint: "upload result" });
              toast.error(t("error_upload_failed"));
              reject();
              return;
            } else {
              resolve();
            }
          })
          .catch(reject);
      });

      // Invalidate models query
      await utils.invalidate();
      toast.success(t("model_created"));
      router.back();
    } catch {
      // Do nothing
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
        {(!modelId || isFetched) && (
          <CreateModelForm defaultValues={model} onSubmit={onSubmit} uploadClient={uploadClient} />
        )}
      </DialogContent>
    </Dialog>
  );
};
