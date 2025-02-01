"use client";

import { useFileUpload } from "@/hooks/use-file-upload";
import * as m from "@/paraglide/messages";
import { useModelByIdQuery } from "@/queries/react/use-model-by-id.query";
import { useUpdateModelMutation } from "@/queries/react/use-update-model.mutation";
import { api } from "@/trpc/react";
import { log } from "@/utils/react/logger";
import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";
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

import { CreateModelForm, type CreateModelFormMode, type CreateModelFormValues } from "./form";

export const CreateModelDialog: FC<PropsWithChildren> = ({ children }) => {
  const utils = api.useUtils();

  const uploadClient = useFileUpload({ endpoint: "/api/trpc/models.createModel" });

  const [state, setState] = useQueryStates({
    id: parseAsString,
    mode: parseAsStringEnum<CreateModelFormMode>(["create", "edit"]),
  });

  const { data: model, isLoading, isFetched } = useModelByIdQuery(state.id ? { id: state.id } : undefined);
  const { mutateAsync: updateModel } = useUpdateModelMutation();

  const onSubmit = async (values: CreateModelFormValues) => {
    try {
      log.debug("Creating model", values);

      if (state.mode === "edit" && state.id) {
        return updateModel({ id: state.id, ...values }).then(() => setState({ mode: "create" }));
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
              log.error(result, { event: "UploadModel", hint: "upload result" });
              reject(new Error(m.error_upload_failed()));
              return;
            }
            resolve();
          })
          .catch(reject)
          .finally(() => void setState({ mode: "create" }));
      });

      // Invalidate models query
      await utils.invalidate();

      toast.success(m.model_created());
      void setState({ id: null, mode: null });
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
      open={state.mode === "create" || state.mode === "edit"}
      onOpenChange={(open) => setState({ id: null, mode: open ? "create" : null })}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{m.create_model()}</DialogTitle>
          <DialogDescription>{m.create_model_description()}</DialogDescription>
        </DialogHeader>
        {state.mode === "edit" && isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-10" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-32" />
            <Skeleton className="h-10 ml-auto w-24" />
          </div>
        )}
        {(state.mode === "create" || isFetched) && (
          <CreateModelForm
            mode={state.mode ?? "create"}
            defaultValues={model}
            onSubmit={onSubmit}
            uploadClient={uploadClient}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
