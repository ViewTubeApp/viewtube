import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns/format";

import { type CategoryResponse } from "@/server/api/routers/categories";

import { Badge } from "@/components/ui/badge";

import { CategoryRowActions } from "./actions";

export const columns: ColumnDef<CategoryResponse>[] = [
  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => <Badge className="text-xs">{row.original.slug}</Badge>,
  },
  {
    accessorKey: "assignedVideosCount",
    header: "Assigned videos",
  },
  {
    accessorKey: "createdAt",
    header: "Date created",
    cell: ({ row }) => format(row.original.createdAt, "dd/MM/yyyy HH:mm"),
  },
  {
    size: 0,
    id: "actions",
    cell: ({ row }) => <CategoryRowActions category={row.original} />,
  },
];
