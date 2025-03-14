"use client";

import { useIsMobile } from "@/hooks/use-mobile";
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

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { DataTablePagination } from "./data-table-pagination";
import { Skeleton } from "./skeleton";
import { VisuallyHidden } from "./visually-hidden";

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
  last,
  total,
  columns,
  pagination,
  card: TableCard,
  onPaginationChange,
}: DataTableProps<TData, TValue>) => {
  const t = useTranslations();

  const isMobile = useIsMobile();

  const table = useReactTable({
    data,
    columns,
    state: { pagination },
    rowCount: total,
    onPaginationChange,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isMobile && TableCard) {
    return (
      <motion.div {...motions.fade.in} className="space-y-2">
        {table.getRowModel().rows.length ?
          table.getRowModel().rows.map((row) => (
            <motion.div key={row.id} {...motions.slide.y.in} ref={last}>
              <TableCard item={row.original} />
            </motion.div>
          ))
        : loading ?
          Array.from({ length: 4 }).map((_, index) => (
            <motion.div
              key={index}
              {...motions.slide.y.in}
              className="space-y-4 rounded-lg border bg-card text-card-foreground shadow-xs"
            >
              <Skeleton className="h-52" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-12" />
                <Skeleton className="h-5" />
                <Skeleton className="h-5" />
                <Skeleton className="h-11" />
              </div>
            </motion.div>
          ))
        : <Card>
            <VisuallyHidden>
              <CardHeader>
                <CardTitle>{t("no_results")}</CardTitle>
              </CardHeader>
            </VisuallyHidden>
            <CardContent>
              <CardDescription className="text-center text-foreground">{t("no_results")}</CardDescription>
            </CardContent>
          </Card>
        }
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
