"use client";

import { Link } from "@/i18n/routing";
import { useDeleteVideoMutation } from "@/queries/react/use-delete-video.mutation";
import { MoreVertical, Pencil, Trash } from "lucide-react";
import { useTranslations } from "next-intl";
import { type FC, useState } from "react";

import { type VideoResponse } from "@/server/api/routers/video";

import { DeleteAlertDialog } from "@/components/delete-alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardRowActionsProps {
  video: VideoResponse;
}

export const DashboardRowActions: FC<DashboardRowActionsProps> = ({ video }) => {
  const t = useTranslations("dashboard.table");

  const [open, setOpen] = useState(false);

  const { mutate: deleteVideo } = useDeleteVideoMutation();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">{t("actions.open")}</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="space-y-2">
          <Link href={`/admin/video/${video.id}/edit`}>
            <DropdownMenuItem className="cursor-pointer">
              <Pencil className="size-4" />
              {t("actions.edit")}
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => setOpen(true)}>
            <Trash className="size-4" />
            {t("actions.delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteAlertDialog
        open={open}
        onOpenChange={setOpen}
        header={t("delete_dialog.title")}
        onDelete={() => deleteVideo({ id: video.id })}
      />
    </>
  );
};
