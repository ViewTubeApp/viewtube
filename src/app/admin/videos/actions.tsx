"use client";

import * as m from "@/paraglide/messages";
import { api } from "@/trpc/react";
import { MoreVertical, Pencil, Trash } from "lucide-react";
import { type FC, useState } from "react";
import { toast } from "sonner";

import { type APIVideoType } from "@/server/api/routers/video";

import { Link } from "@/lib/i18n";

import { DeleteAlertDialog } from "@/components/delete-alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardRowActionsProps {
  video: APIVideoType;
}

export const DashboardRowActions: FC<DashboardRowActionsProps> = ({ video }) => {
  const [open, setOpen] = useState(false);

  const utils = api.useUtils();

  const { mutate: deleteVideo } = api.video.deleteVideo.useMutation({
    onSuccess: () => {
      void utils.invalidate();
      toast.success(m.video_deleted());
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 shrink-0">
            <span className="sr-only">{m.open_menu()}</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="space-y-2">
          <Link href={`/admin/videos/${video.id}`}>
            <DropdownMenuItem className="cursor-pointer">
              <Pencil className="size-4" />
              {m.edit()}
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => setOpen(true)}>
            <Trash className="size-4" />
            {m.delete_str()}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteAlertDialog
        open={open}
        onOpenChange={setOpen}
        header={m.delete_dialog_title()}
        onDelete={() => deleteVideo({ id: video.id })}
      />
    </>
  );
};
