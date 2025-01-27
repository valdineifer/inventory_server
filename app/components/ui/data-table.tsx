import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  OnChangeFn,
  PaginationState,
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table"
import { useState } from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { Input } from "./input"
import { Button } from "./button"
import { Search } from "lucide-react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onPaginationChange?: OnChangeFn<PaginationState>
  pagination?: PaginationState
  rowCount?: number
  rowSelection?: RowSelectionState
  setRowSelection?: OnChangeFn<RowSelectionState>
  searchFn?: (str: string) => any
  defaultQuery?: string | null
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onPaginationChange,
  pagination,
  rowSelection,
  setRowSelection,
  rowCount,
  searchFn,
  defaultQuery,
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState(defaultQuery ?? '');

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    onPaginationChange,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    rowCount: rowCount,
    state: {
      globalFilter,
      pagination,
      rowSelection,
    },
  });

  return (
    <>
      {
        !!searchFn && (
          <div className="flex w-full max-w-sm items-center py-4 space-x-2">
            <Input
              placeholder="Busca global"
              value={globalFilter}
              onChange={ev => setGlobalFilter(ev.target.value)}
              className="max-w-sm"
            />
            <Button variant="outline" size="icon" onClick={_ => searchFn && searchFn(globalFilter)}>
              <Search size={5}/>
            </Button>
          </div>
        )
      }
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
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={rowSelection && row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
            )}
          </TableBody>
          {
            rowSelection &&
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    <div className="flex-1 text-sm text-muted-foreground">
                      {table.getFilteredSelectedRowModel().rows.length} de{" "}
                      {table.getFilteredRowModel().rows.length} linha(s) selecionada(s).
                    </div>
                  </TableCell>
                </TableRow>
              </TableFooter>
          }
        </Table>
      </div>
      {
        !!pagination && (
            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          )
      }
    </>
  )
}
