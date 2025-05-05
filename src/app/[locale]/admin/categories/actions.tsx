"use client";

import { Link } from "@/i18n/navigation";
import { api } from "@/trpc/react";
import { MoreVertical, Pencil, Trash } from "lucide-react";
import { useTranslations } from "next-intl";
import { type FC, useState } from "react";
import { toast } from "sonner";

import { type CategoryListElement } from "@/server/api/routers/categories";

import { DeleteAlertDialog } from "@/components/delete-alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CategoryRowActionsProps {
  category: CategoryListElement;
}

export const CategoryRowActions: FC<CategoryRowActionsProps> = ({ category }) => {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  const utils = api.useUtils();

  const { mutate: deleteCategory } = api.categories.deleteCategory.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
      toast.success(t("category_deleted"));
    },
    onError: (error) => {
      toast.error(t(error.message));
    },
  });

  return (
    <>
      <DropdownMenu>
        <div className="flex justify-end">
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 shrink-0">
              <span className="sr-only">{t("open_menu")}</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
        </div>
        <DropdownMenuContent align="end">
          <div className="space-y-2">
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href={`/admin/categories/${category.id}`} prefetch>
                <Pencil className="size-4" />
                {t("edit")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => setOpen(true)}>
              <Trash className="size-4 stroke-destructive" />
              {t("delete")}
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteAlertDialog
        open={open}
        onOpenChange={setOpen}
        header={t("delete_dialog_title")}
        onDelete={() => deleteCategory({ id: category.id })}
      />
    </>
  );
};
