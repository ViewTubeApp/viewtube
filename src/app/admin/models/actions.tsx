"use client";

import * as m from "@/paraglide/messages";
import { useDeleteModelMutation } from "@/queries/react/use-delete-model.mutation";
import { MoreVertical, Pencil, Trash } from "lucide-react";
import { type FC, useState } from "react";

import { type Model } from "@/server/db/schema";

import { Link } from "@/lib/i18n";

import { DeleteAlertDialog } from "@/components/delete-alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ModelRowActionsProps {
  model: Model;
}

export const ModelRowActions: FC<ModelRowActionsProps> = ({ model }) => {
  const [open, setOpen] = useState(false);

  const { mutate: deleteModel } = useDeleteModelMutation();

  return (
    <>
      <DropdownMenu>
        <div className="flex justify-end">
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 shrink-0">
              <span className="sr-only">{m.open_menu()}</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
        </div>
        <DropdownMenuContent align="end">
          <div className="space-y-2">
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href={`/admin/models/${model.id}`}>
                <Pencil className="size-4" />
                {m.edit()}
              </Link>
            </DropdownMenuItem>
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
        onDelete={() => deleteModel({ id: model.id })}
      />
    </>
  );
};
