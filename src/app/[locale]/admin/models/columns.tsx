"use client";

import { getPublicURL } from "@/utils/react/video";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns/format";
import { useTranslations } from "next-intl";

import { type ModelListElement } from "@/server/api/routers/models";

import { NiceImage } from "@/components/nice-image";

import { ModelRowActions } from "./actions";

export function useModelColumns() {
  const t = useTranslations();

  const columns: ColumnDef<ModelListElement>[] = [
    {
      accessorKey: "thumbnail",
      header: t("thumbnail"),
      cell: ({ row }) => {
        const model = row.original;
        return (
          <div className="relative aspect-video rounded-lg overflow-hidden w-36">
            <NiceImage
              fill
              style={{ objectFit: "cover" }}
              src={getPublicURL(model.imageUrl).forType("file")}
              alt={model.name}
            />
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: t("name"),
    },
    {
      accessorKey: "assignedVideosCount",
      header: t("assigned_videos"),
    },
    {
      accessorKey: "createdAt",
      header: t("uploaded"),
      cell: ({ row }) => format(row.original.createdAt, "dd.MM.yyyy HH:mm"),
    },
    {
      id: "actions",
      cell: ({ row }) => <ModelRowActions model={row.original} />,
    },
  ];

  return columns;
}
