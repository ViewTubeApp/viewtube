import * as m from "@/paraglide/messages";
import { api } from "@/trpc/react";
import { toast } from "sonner";

export function useDeleteCategoryMutation() {
  const utils = api.useUtils();

  return api.categories.deleteCategory.useMutation({
    onSuccess: () => {
      void utils.invalidate();
      toast.success(m.category_deleted());
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
