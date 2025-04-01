"use client";

import { Link } from "@/i18n/navigation";
import { api } from "@/trpc/react";
import { MoreVertical, Pencil, Trash } from "lucide-react";
import { useTranslations } from "next-intl";
import { type FC, useState } from "react";
import { toast } from "sonner";

import { type VideoListElement } from "@/server/api/routers/video";

import { DeleteAlertDialog } from "@/components/delete-alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardRowActionsProps {
  video: VideoListElement;
}

export const DashboardRowActions: FC<DashboardRowActionsProps> = ({ video }) => {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  const utils = api.useUtils();

  const { mutate: deleteVideo } = api.video.deleteVideo.useMutation({
    onSuccess: () => {
      void utils.invalidate();
      toast.success(t("video_deleted"));
    },
    onError: (error) => {
      toast.error(t(error.message));
    },
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 shrink-0">
            <span className="sr-only">{t("open_menu")}</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="space-y-2">
          <Link href={`/admin/videos/${video.id}`} prefetch>
            <DropdownMenuItem className="cursor-pointer">
              <Pencil className="size-4" />
              {t("edit")}
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => setOpen(true)}>
            <Trash className="size-4 stroke-destructive" />
            {t("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteAlertDialog
        open={open}
        onOpenChange={setOpen}
        header={t("delete_dialog_title")}
        onDelete={() => deleteVideo({ id: video.id })}
      />
    </>
  );
};
