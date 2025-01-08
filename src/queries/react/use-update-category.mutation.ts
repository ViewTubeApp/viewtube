import * as m from "@/paraglide/messages";
import { api } from "@/trpc/react";
import { toast } from "sonner";

export function useUpdateCategoryMutation() {
  const utils = api.useUtils();

  return api.categories.updateCategory.useMutation({
    onSuccess: () => {
      void utils.invalidate();
      toast.success(m.category_updated());
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
