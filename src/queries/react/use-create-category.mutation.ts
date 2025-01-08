import * as m from "@/paraglide/messages";
import { api } from "@/trpc/react";
import { toast } from "sonner";

export function useCreateCategoryMutation() {
  const utils = api.useUtils();

  return api.categories.createCategory.useMutation({
    onSuccess: () => {
      void utils.invalidate();
      toast.success(m.category_created());
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
