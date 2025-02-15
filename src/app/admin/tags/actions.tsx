"use client";

import * as m from "@/paraglide/messages";
import { api } from "@/trpc/react";
import { MoreVertical, Trash } from "lucide-react";
import { type FC, useState } from "react";
import { toast } from "sonner";

import { type APITagType } from "@/server/api/routers/tags";

import { DeleteAlertDialog } from "@/components/delete-alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TagRowActionsProps {
  tag: APITagType;
}

export const TagRowActions: FC<TagRowActionsProps> = ({ tag }) => {
  const [open, setOpen] = useState(false);

  const utils = api.useUtils();

  const { mutate: deleteTag } = api.tags.deleteTag.useMutation({
    onSuccess: () => {
      void utils.invalidate();
      toast.success(m.tag_deleted());
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

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
