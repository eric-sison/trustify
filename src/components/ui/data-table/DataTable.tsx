"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../Table";
import { DataTablePagination } from "./DataTablePagination";
import { Input } from "../Input";
import { DataTableToolbar } from "./DataTableToolbar";
import { createContext, useState } from "react";
import { LoadingSpinner } from "../LoadingSpinner";

type DataTableProps<T> = {
  columns: Array<ColumnDef<T, unknown>>;
  data: T[];
  enableColumnVisibilityToggle?: boolean;
  enableGlobalFilter?: boolean;
  enablePagination?: boolean;
  loading?: boolean;
};

type ColumnVisibilityToggleContextState = {
  enableColumnVisibilityToggle?: boolean;
};

export const ColumnVisibilityToggleContext = createContext<ColumnVisibilityToggleContextState>({
  enableColumnVisibilityToggle: undefined,
});

export function DataTable<T>({
  columns,
  data,
  enableColumnVisibilityToggle = true,
  enableGlobalFilter = true,
  enablePagination = true,
  loading = false,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    state: {
      sorting,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
    },
  });

  return (
    <div className="space-y-4">
      <ColumnVisibilityToggleContext.Provider value={{ enableColumnVisibilityToggle }}>
        <div className="flex items-center gap-2">
          {enableGlobalFilter && (
            <div className="relative flex w-96 items-center">
              <Input
                placeholder="Search from table..."
                value={globalFilter ?? ""}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="min-w-96"
              />
            </div>
          )}

          <DataTableToolbar table={table} />
        </div>
      </ColumnVisibilityToggleContext.Provider>

      <div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {!loading ? (
                table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="max-w-[30rem] truncate">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="flex h-24 w-full items-center justify-center gap-2"
                  >
                    <LoadingSpinner /> <span>Loading data...</span>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {enablePagination && (
          <div className="pb-10 pt-4">
            <DataTablePagination table={table} />
          </div>
        )}
      </div>
    </div>
  );
}
