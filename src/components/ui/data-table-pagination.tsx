import * as m from "@/paraglide/messages";
import { type Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="hidden flex-1 text-sm text-muted-foreground sm:block">
        {m.rows_selected({
          count: table.getFilteredSelectedRowModel().rows.length,
          total: table.getFilteredRowModel().rows.length,
        })}
      </div>
      <div className="flex items-center gap-4 justify-between sm:gap-6 lg:gap-8">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium hidden sm:block">{m.rows_per_page()}</p>
          <p className="text-sm font-medium sm:hidden">{m.per_page()}</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex min-w-[100px] items-center justify-center text-sm font-medium">
          {m.page_of({
            page: table.getState().pagination.pageIndex + 1,
            total: table.getPageCount(),
          })}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 sm:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">{m.go_to_first_page()}</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">{m.go_to_previous_page()}</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">{m.go_to_next_page()}</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 sm:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">{m.go_to_last_page()}</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
