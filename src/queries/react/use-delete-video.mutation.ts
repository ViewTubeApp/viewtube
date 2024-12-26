import { api } from "@/trpc/react";
import { toast } from "sonner";

export function useDeleteVideoMutation() {
  const utils = api.useUtils();

  return api.video.deleteVideo.useMutation({
    onSuccess: () => {
      void utils.video.invalidate();
      toast.success("Video deleted");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
