import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns/format";

import { type Category } from "@/server/db/schema";

import { CategoryRowActions } from "./actions";

export const columns: ColumnDef<Category>[] = [
  {
    accessorKey: "name",
    header: "Name",
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
