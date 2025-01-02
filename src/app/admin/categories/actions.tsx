"use client";

import * as m from "@/paraglide/messages";
import { useDeleteCategoryMutation } from "@/queries/react/use-delete-category.mutation";
import { MoreVertical, Pencil, Trash } from "lucide-react";
import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";
import { type FC, useState } from "react";

import { type Category } from "@/server/db/schema";

import { DeleteAlertDialog } from "@/components/delete-alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { type CreateCategoryFormMode } from "./form";

interface CategoryRowActionsProps {
  category: Category;
}

export const CategoryRowActions: FC<CategoryRowActionsProps> = ({ category }) => {
  const [open, setOpen] = useState(false);

  const [, setEdit] = useQueryStates({
    id: parseAsString,
    mode: parseAsStringEnum<CreateCategoryFormMode>(["create", "edit"]),
  });

  const { mutate: deleteCategory } = useDeleteCategoryMutation();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex justify-end">
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">{m.open_menu()}</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <div className="space-y-2">
            <DropdownMenuItem className="cursor-pointer" onClick={() => setEdit({ mode: "edit", id: category.id })}>
              <Pencil className="size-4" />
              {m.edit()}
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
        onDelete={() => deleteCategory({ id: category.id })}
      />
    </>
  );
};
