"use client";

import {
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type RowData,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as motion from "motion/react-client";
import { useTranslations } from "next-intl";
import { type ComponentType, type Ref } from "react";

import { motions } from "@/constants/motion";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { DataTablePagination } from "./data-table-pagination";
import { Skeleton } from "./skeleton";

interface DataTableProps<TData extends RowData, TValue> {
  loading?: boolean;
  total: number;
  data: TData[];
  last?: Ref<HTMLDivElement>;
  pagination: PaginationState;
  columns: ColumnDef<TData, TValue>[];
  card?: ComponentType<{ item: TData }>;
  onPaginationChange?: OnChangeFn<PaginationState>;
}

export const DataTable = <TData extends RowData, TValue>({
  loading,
  data,
  total,
  columns,
  pagination,
  onPaginationChange,
}: DataTableProps<TData, TValue>) => {
  const t = useTranslations();

  const table = useReactTable({
    data,
    columns,
    state: { pagination },
    rowCount: total,
    onPaginationChange,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  });

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
            : loading ?
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: columns.length }).map((_, index) => (
                    <TableCell key={index} className="h-24">
                      <Skeleton className="size-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {t("no_results")}
                </TableCell>
              </TableRow>
            }
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </motion.div>
  );
};
