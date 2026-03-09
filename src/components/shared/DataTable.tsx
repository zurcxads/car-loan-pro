"use client";

import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';

interface DataTableProps<T> {
  data: T[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<T, any>[];
  pageSize?: number;
  onRowClick?: (row: T) => void;
  globalFilter?: string;
  enableSelection?: boolean;
  selectedRows?: Set<string>;
  onSelectionChange?: (selected: Set<string>) => void;
  getRowId?: (row: T) => string;
}

export default function DataTable<T>({
  data,
  columns,
  pageSize = 10,
  onRowClick,
  globalFilter = '',
  enableSelection = false,
  selectedRows = new Set(),
  onSelectionChange,
  getRowId,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize } },
  });

  const toggleRow = (id: string) => {
    const next = new Set(selectedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange?.(next);
  };

  const toggleAll = () => {
    if (selectedRows.size === table.getRowModel().rows.length) {
      onSelectionChange?.(new Set());
    } else {
      const all = new Set(table.getRowModel().rows.map(r => {
        const original = r.original as Record<string, unknown>;
        return getRowId ? getRowId(r.original) : (original.id as string) || r.id;
      }));
      onSelectionChange?.(all);
    }
  };

  return (
    <div>
      <div className="rounded-2xl surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-white/10">
                  {enableSelection && (
                    <th className="py-4 px-5 w-10">
                      <input
                        type="checkbox"
                        checked={selectedRows.size === table.getRowModel().rows.length && selectedRows.size > 0}
                        onChange={toggleAll}
                        className="rounded border-zinc-600 bg-zinc-800 cursor-pointer"
                      />
                    </th>
                  )}
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                      className={`text-left py-4 px-5 text-[10px] text-zinc-500 uppercase tracking-widest font-medium ${
                        header.column.getCanSort() ? 'cursor-pointer select-none hover:text-zinc-300' : ''
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' && <span className="text-blue-400">↑</span>}
                        {header.column.getIsSorted() === 'desc' && <span className="text-blue-400">↓</span>}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => {
                const original = row.original as Record<string, unknown>;
                const rowId = getRowId ? getRowId(row.original) : (original.id as string) || row.id;
                return (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick?.(row.original)}
                    className={`border-b border-white/[0.04] transition-colors duration-150 ${
                      onRowClick ? 'hover:bg-zinc-800/30 cursor-pointer' : ''
                    } ${selectedRows.has(rowId) ? 'bg-blue-600/5' : ''}`}
                  >
                    {enableSelection && (
                      <td className="py-4 px-5" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedRows.has(rowId)}
                          onChange={() => toggleRow(rowId)}
                          className="rounded border-zinc-600 bg-zinc-800 cursor-pointer"
                        />
                      </td>
                    )}
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="py-4 px-5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-xs text-zinc-500">
        <span>
          Showing {table.getState().pagination.pageIndex * pageSize + 1}-
          {Math.min((table.getState().pagination.pageIndex + 1) * pageSize, table.getFilteredRowModel().rows.length)} of{' '}
          {table.getFilteredRowModel().rows.length}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
