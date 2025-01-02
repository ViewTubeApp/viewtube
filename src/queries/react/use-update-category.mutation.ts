import * as m from "@/paraglide/messages";
import { api } from "@/trpc/react";
import { toast } from "sonner";

export function useUpdateCategoryMutation() {
  const utils = api.useUtils();

  return api.categories.updateCategory.useMutation({
    onSuccess: () => {
      toast.success(m.category_updated());
      void utils.video.invalidate();
      void utils.categories.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
