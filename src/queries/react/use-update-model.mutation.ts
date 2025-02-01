import * as m from "@/paraglide/messages";
import { api } from "@/trpc/react";
import { toast } from "sonner";

export function useUpdateModelMutation() {
  const utils = api.useUtils();

  return api.models.updateModel.useMutation({
    onSuccess: () => {
      void utils.invalidate();
      toast.success(m.model_updated());
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
