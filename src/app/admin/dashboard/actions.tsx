"use client";

import { useDeleteVideoMutation } from "@/queries/react/use-delete-video-mutation";
import { MoreVertical, Pencil, Trash } from "lucide-react";
import { type FC, useState } from "react";

import { type VideoExtended } from "@/server/db/schema";

import { DeleteAlertDialog } from "@/components/delete-alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardRowActionsProps {
  video: VideoExtended;
}

export const DashboardRowActions: FC<DashboardRowActionsProps> = ({ video }) => {
  const [open, setOpen] = useState(false);

  const { mutate: deleteVideo } = useDeleteVideoMutation();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="cursor-pointer">
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => setOpen(true)}>
            <Trash className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteAlertDialog
        open={open}
        onOpenChange={setOpen}
        header="Are you sure you want to delete this video?"
        onDelete={() => deleteVideo({ id: video.id })}
      />
    </>
  );
};
