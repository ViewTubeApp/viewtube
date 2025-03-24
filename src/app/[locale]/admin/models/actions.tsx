"use client";

import { Link } from "@/i18n/navigation";
import { api } from "@/trpc/react";
import { MoreVertical, Pencil, Trash } from "lucide-react";
import { useTranslations } from "next-intl";
import { type FC, useState } from "react";
import { toast } from "sonner";

import { type ModelSelectSchema } from "@/server/db/schema";

import { DeleteAlertDialog } from "@/components/delete-alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ModelRowActionsProps {
  model: ModelSelectSchema;
}

export const ModelRowActions: FC<ModelRowActionsProps> = ({ model }) => {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  const utils = api.useUtils();

  const { mutate: deleteModel } = api.models.deleteModel.useMutation({
    onSuccess: () => {
      void utils.invalidate();
      toast.success(t("model_deleted"));
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
              <Link href={`/admin/models/${model.id}`}>
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
        onDelete={() => deleteModel({ id: model.id })}
      />
    </>
  );
};
