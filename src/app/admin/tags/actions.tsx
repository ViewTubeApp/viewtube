"use client";

import * as m from "@/paraglide/messages";
import { useDeleteTagMutation } from "@/queries/react/use-delete-tag.mutation";
import { MoreVertical, Trash } from "lucide-react";
import { type FC, useState } from "react";

import { type Tag } from "@/server/db/schema";

import { DeleteAlertDialog } from "@/components/delete-alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TagRowActionsProps {
  tag: Tag;
}

export const TagRowActions: FC<TagRowActionsProps> = ({ tag }) => {
  const [open, setOpen] = useState(false);

  const { mutate: deleteTag } = useDeleteTagMutation();

  return (
    <>
      <DropdownMenu>
        <div className="flex justify-end">
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">{m.open_menu()}</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
        </div>
        <DropdownMenuContent align="end">
          <div className="space-y-2">
            <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => setOpen(true)}>
              <Trash className="size-4" />
              {m.delete_str()}
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteAlertDialog
        open={open}
        onOpenChange={setOpen}
        header={m.delete_dialog_title()}
        onDelete={() => deleteTag({ id: tag.id })}
      />
    </>
  );
};
