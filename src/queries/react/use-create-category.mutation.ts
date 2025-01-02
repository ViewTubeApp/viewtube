import * as m from "@/paraglide/messages";
import { api } from "@/trpc/react";
import { toast } from "sonner";

export function useCreateCategoryMutation() {
  const utils = api.useUtils();

  return api.categories.createCategory.useMutation({
    onSuccess: () => {
      toast.success(m.category_created());
      void utils.categories.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
