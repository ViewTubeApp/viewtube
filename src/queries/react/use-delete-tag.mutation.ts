import * as m from "@/paraglide/messages";
import { api } from "@/trpc/react";
import { toast } from "sonner";

export function useDeleteTagMutation() {
  const utils = api.useUtils();

  return api.tags.deleteTag.useMutation({
    onSuccess: () => {
      void utils.invalidate();
      toast.success(m.tag_deleted());
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
