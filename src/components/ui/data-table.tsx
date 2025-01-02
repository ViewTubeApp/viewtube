"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import * as m from "@/paraglide/messages";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { motion } from "motion/react";
import { useState } from "react";

import { motions } from "@/constants/motion";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { DataTablePagination } from "./data-table-pagination";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  renderCard?: (item: TData) => React.ReactNode;
}

export function DataTable<TData, TValue>({ columns, data, renderCard }: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const isMobile = useIsMobile();

  const table = useReactTable({
    data,
    columns,

    state: {
      sorting,
      rowSelection,
      columnFilters,
    },

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),

    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
  });

  if (isMobile && renderCard) {
    return (
      <motion.div {...motions.fade.in} className="space-y-2">
        {table.getRowModel().rows.map((row) => (
          <motion.div key={row.id} {...motions.slide.y.in}>
            {renderCard(row.original)}
          </motion.div>
        ))}
        <DataTablePagination table={table} />
      </motion.div>
    );
  }

  return (
    <motion.div {...motions.fade.in} className="space-y-2">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} style={{ width: header.getSize() }}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ?
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {m.no_results()}
                </TableCell>
              </TableRow>
            }
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </motion.div>
  );
}
