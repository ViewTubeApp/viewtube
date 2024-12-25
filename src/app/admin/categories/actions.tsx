"use client";

import { useDeleteCategoryMutation } from "@/queries/react/use-delete-category-mutation";
import { MoreVertical, Pencil, Trash } from "lucide-react";
import { type FC, useState } from "react";

import { type Category } from "@/server/db/schema";

import { DeleteAlertDialog } from "@/components/delete-alert-dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface CategoryRowActionsProps {
  category: Category;
}

export const CategoryRowActions: FC<CategoryRowActionsProps> = ({ category }) => {
  const [open, setOpen] = useState(false);

  const { mutate: deleteCategory } = useDeleteCategoryMutation();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex justify-end">
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <div className="space-y-2">
            <DropdownMenuItem className="cursor-pointer">
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => setOpen(true)}>
              <Trash className="size-4" />
              Delete
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteAlertDialog
        open={open}
        onOpenChange={setOpen}
        header="Are you sure you want to delete this category?"
        onDelete={() => deleteCategory({ id: category.id })}
      />
    </>
  );
};
