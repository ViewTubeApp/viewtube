import { api } from "@/trpc/react";
import { toast } from "sonner";

export function useDeleteTagMutation() {
  const utils = api.useUtils();

  return api.tags.deleteTag.useMutation({
    onSuccess: () => {
      void utils.tags.invalidate();
      toast.success("Tag deleted");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
