import { getPublicURL } from "@/utils/react/video";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns/format";
import { useTranslations } from "next-intl";

import { type CategoryListElement } from "@/server/api/routers/categories";

import { NiceImage } from "@/components/nice-image";

import { CategoryRowActions } from "./actions";

export function useCategoryColumns() {
  const t = useTranslations();

  return [
    {
      accessorKey: "thumbnail",
      header: t("thumbnail"),
      cell: ({ row }) => {
        const category = row.original;
        return (
          <div className="relative aspect-video rounded-lg overflow-hidden w-36">
            <NiceImage fill style={{ objectFit: "cover" }} src={getPublicURL(category.file_key)} alt={category.slug} />
          </div>
        );
      },
    },
    {
      accessorKey: "slug",
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
      cell: ({ row }) => <CategoryRowActions category={row.original} />,
    },
  ] satisfies ColumnDef<CategoryListElement>[];
}
