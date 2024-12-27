import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns/format";

import { type Category } from "@/server/db/schema";

import { Badge } from "@/components/ui/badge";

import { CategoryRowActions } from "./actions";

export const columns: ColumnDef<Category>[] = [
  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => <Badge className="text-xs">{row.original.slug}</Badge>,
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
