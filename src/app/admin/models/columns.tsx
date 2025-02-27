"use client";

import { useFormattedDistance } from "@/hooks/use-formatted-distance";
import * as m from "@/paraglide/messages";
import { getPublicURL } from "@/utils/react/video";
import { type ColumnDef } from "@tanstack/react-table";

import { type ModelListElement } from "@/server/api/routers/models";

import { NiceImage } from "@/components/nice-image";

import { ModelRowActions } from "./actions";

export function useModelColumns() {
  const formattedDistance = useFormattedDistance();

  const columns: ColumnDef<ModelListElement>[] = [
    {
      accessorKey: "thumbnail",
      header: m.thumbnail(),
      cell: ({ row }) => {
        const model = row.original;
        return (
          <div className="relative aspect-video w-36">
            <NiceImage
              fill
              style={{ objectFit: "cover" }}
              src={getPublicURL(model.imageUrl).forType("file")}
              alt={model.name}
              className="rounded overflow-hidden"
            />
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: m.name(),
    },
    {
      accessorKey: "assignedVideosCount",
      header: m.assigned_videos(),
    },
    {
      accessorKey: "createdAt",
      header: m.uploaded(),
      cell: ({ row }) => formattedDistance(row.original.createdAt),
    },
    {
      id: "actions",
      cell: ({ row }) => <ModelRowActions model={row.original} />,
    },
  ];

  return columns;
}
