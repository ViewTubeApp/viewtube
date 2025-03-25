import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns/format";
import { useTranslations } from "next-intl";

import { type TagListElement } from "@/server/api/routers/tags";

import { TagRowActions } from "./actions";

export function useTagColumns() {
  const t = useTranslations();

  return [
    {
      accessorKey: "name",
      header: t("name"),
    },
    {
      accessorKey: "assignedVideosCount",
      header: t("assigned_videos"),
    },
    {
      accessorKey: "created_at",
      header: t("date_created"),
      cell: ({ row }) => format(row.original.created_at, "dd.MM.yyyy HH:mm"),
    },
    {
      size: 64,
      id: "actions",
      cell: ({ row }) => <TagRowActions tag={row.original} />,
    },
  ] satisfies ColumnDef<TagListElement>[];
}
