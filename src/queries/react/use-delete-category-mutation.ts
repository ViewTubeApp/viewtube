import { api } from "@/trpc/react";
import { toast } from "sonner";

export function useDeleteCategoryMutation() {
  const utils = api.useUtils();

  return api.categories.deleteCategory.useMutation({
    onSuccess: () => {
      void utils.categories.invalidate();
      toast.success("Category deleted");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
