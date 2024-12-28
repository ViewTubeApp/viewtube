import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns/format";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { type CategoryResponse } from "@/server/api/routers/categories";

import { Badge } from "@/components/ui/badge";

import { CategoryRowActions } from "./actions";

export function useCategoryColumns() {
  const t = useTranslations("categories.table.columns");

  return useMemo<ColumnDef<CategoryResponse>[]>(
    () => [
      {
        accessorKey: "slug",
        header: t("slug"),
        cell: ({ row }) => <Badge className="text-xs">{row.original.slug}</Badge>,
      },
      {
        accessorKey: "assignedVideosCount",
        header: t("assignedVideosCount"),
      },
      {
        accessorKey: "createdAt",
        header: t("createdAt"),
        cell: ({ row }) => format(row.original.createdAt, "dd/MM/yyyy HH:mm"),
      },
      {
        size: 0,
        id: "actions",
        cell: ({ row }) => <CategoryRowActions category={row.original} />,
      },
    ],
    [t],
  );
}
