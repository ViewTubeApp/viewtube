import * as m from "@/paraglide/messages";
import { getPublicURL } from "@/utils/react/video";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns/format";
import { useMemo } from "react";

import { type CategoryResponse } from "@/server/api/routers/categories";

import { NiceImage } from "@/components/nice-image";

import { CategoryRowActions } from "./actions";

export function useCategoryColumns() {
  return useMemo<ColumnDef<CategoryResponse>[]>(
    () => [
      {
        accessorKey: "thumbnail",
        header: m.thumbnail(),
        cell: ({ row }) => {
          const category = row.original;
          return (
            <div className="relative aspect-video w-36 overflow-hidden rounded">
              <NiceImage
                src={getPublicURL(category.imageUrl).forType("file")}
                alt={category.slug}
                fill
                className="object-cover"
              />
            </div>
          );
        },
      },
      {
        accessorKey: "slug",
        header: m.name(),
      },
      {
        accessorKey: "assignedVideosCount",
        header: m.assigned_videos(),
      },
      {
        accessorKey: "createdAt",
        header: m.date_created(),
        cell: ({ row }) => format(row.original.createdAt, "dd/MM/yyyy HH:mm"),
      },
      {
        size: 64,
        id: "actions",
        cell: ({ row }) => <CategoryRowActions category={row.original} />,
      },
    ],
    [],
  );
}
