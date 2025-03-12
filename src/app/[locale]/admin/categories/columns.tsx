import { useFormattedDistance } from "@/hooks/use-formatted-distance";
import { getPublicURL } from "@/utils/react/video";
import { type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";

import { type CategoryListElement } from "@/server/api/routers/categories";

import { NiceImage } from "@/components/nice-image";

import { CategoryRowActions } from "./actions";

export function useCategoryColumns() {
  const t = useTranslations();
  const formattedDistance = useFormattedDistance();

  return [
    {
      accessorKey: "thumbnail",
      header: t("thumbnail"),
      cell: ({ row }) => {
        const category = row.original;
        return (
          <div className="relative aspect-video w-36">
            <NiceImage
              fill
              style={{ objectFit: "cover" }}
              src={getPublicURL(category.imageUrl).forType("file")}
              alt={category.slug}
              className="rounded overflow-hidden"
            />
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
      accessorKey: "createdAt",
      header: t("date_created"),
      cell: ({ row }) => formattedDistance(row.original.createdAt),
    },
    {
      size: 64,
      id: "actions",
      cell: ({ row }) => <CategoryRowActions category={row.original} />,
    },
  ] satisfies ColumnDef<CategoryListElement>[];
}
