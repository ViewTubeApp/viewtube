import * as m from "@/paraglide/messages";
import { api } from "@/trpc/react";
import { toast } from "sonner";

export function useDeleteVideoMutation() {
  const utils = api.useUtils();

  return api.video.deleteVideo.useMutation({
    onSuccess: () => {
      void utils.invalidate();
      toast.success(m.video_deleted());
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
