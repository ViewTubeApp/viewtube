import * as m from "@/paraglide/messages";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns/format";
import { useMemo } from "react";

import { type TagResponse } from "@/server/api/routers/tags";

import { TagRowActions } from "./actions";

export function useTagColumns() {
  return useMemo<ColumnDef<TagResponse>[]>(
    () => [
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
        header: m.date_created(),
        cell: ({ row }) => format(row.original.createdAt, "dd/MM/yyyy HH:mm"),
      },
      {
        size: 64,
        id: "actions",
        cell: ({ row }) => <TagRowActions tag={row.original} />,
      },
    ],
    [],
  );
}
