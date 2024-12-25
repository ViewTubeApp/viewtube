import { type ColumnDef } from "@tanstack/react-table";

import { type Category } from "@/server/db/schema";

export const columns: ColumnDef<Category>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "createdAt",
    header: "Date created",
  },
];
