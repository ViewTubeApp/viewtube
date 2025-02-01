import * as m from "@/paraglide/messages";
import { api } from "@/trpc/react";
import { toast } from "sonner";

export function useDeleteModelMutation() {
  const utils = api.useUtils();

  return api.models.deleteModel.useMutation({
    onSuccess: () => {
      void utils.invalidate();
      toast.success(m.model_deleted());
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
