import React, { useState } from 'react';
import { 
  useReactTable, 
  getCoreRowModel, 
  flexRender, 
  getSortedRowModel,
  getFilteredRowModel
} from '@tanstack/react-table';
import type {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { Eye, Link2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@/components/ui/dropdown-menu';

interface BankTransaction {
  id: number;
  transactionDate: string;
  valueDate: string;
  utrNumber: string;
  referenceNumber: string;
  amount: number;
  transactionType: string;
  accountNumber: string;
  balance: number;
  description: string;
  month: string;
  year: string;
  sourceFile: string;
  importedAt: string;
  isMapped: boolean;
  mappedStudentId?: number;
  mappedPaymentId?: number;
  mappedBy?: string;
  mappedAt?: string;
}

interface BankTransactionGridProps {
  data: BankTransaction[];
  loading: boolean;
  onViewDetails: (transaction: BankTransaction) => void;
  onMapPayment: (transaction: BankTransaction) => void;
  onDelete: (id: number) => void;
  pagination: { pageIndex: number; pageSize: number };
  setPagination: (pagination: { pageIndex: number; pageSize: number }) => void;
  pageCount: number;
  globalFilter: string;
  setGlobalFilter: (filter: string) => void;
  sorting: SortingState;
  setSorting: (sorting: SortingState) => void;
}

export function BankTransactionGrid({
  data, loading, onViewDetails, onMapPayment, onDelete,
  pagination, setPagination, pageCount, globalFilter, setGlobalFilter,
  sorting, setSorting
}: BankTransactionGridProps) {

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    valueDate: false,
    referenceNumber: false,
    balance: false,
    month: false,
    year: false,
    sourceFile: false,
    importedAt: false,
    mappedBy: false
  });

  const columns: ColumnDef<BankTransaction>[] = [
    {
      accessorKey: 'transactionDate',
      header: 'Txn Date',
      cell: ({ row }) => format(new Date(row.original.transactionDate), 'MMM dd, yyyy')
    },
    {
      accessorKey: 'valueDate',
      header: 'Value Date',
      cell: ({ row }) => row.original.valueDate ? format(new Date(row.original.valueDate), 'MMM dd, yyyy') : 'N/A'
    },
    {
      accessorKey: 'utrNumber',
      header: 'UTR Number',
      cell: ({ row }) => <span className="font-medium">{row.original.utrNumber || 'N/A'}</span>
    },
    {
      accessorKey: 'referenceNumber',
      header: 'Ref Number',
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => <div className="max-w-[250px] truncate" title={row.original.description}>{row.original.description}</div>
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => <span className="font-bold">₹{row.original.amount.toLocaleString('en-IN')}</span>
    },
    {
      accessorKey: 'transactionType',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant={row.original.transactionType === 'CREDIT' ? 'default' : 'destructive'} 
               className={row.original.transactionType === 'CREDIT' ? 'bg-green-500 hover:bg-green-600' : ''}>
          {row.original.transactionType}
        </Badge>
      )
    },
    {
      accessorKey: 'accountNumber',
      header: 'Account',
    },
    {
      accessorKey: 'balance',
      header: 'Balance',
      cell: ({ row }) => row.original.balance ? `₹${row.original.balance.toLocaleString('en-IN')}` : 'N/A'
    },
    {
      accessorKey: 'month',
      header: 'Import Month',
    },
    {
      accessorKey: 'year',
      header: 'Import Year',
    },
    {
      accessorKey: 'sourceFile',
      header: 'File Name',
      cell: ({ row }) => <div className="max-w-[150px] truncate" title={row.original.sourceFile}>{row.original.sourceFile}</div>
    },
    {
      accessorKey: 'importedAt',
      header: 'Imported Date',
      cell: ({ row }) => row.original.importedAt ? format(new Date(row.original.importedAt), 'MMM dd, yyyy HH:mm') : 'N/A'
    },
    {
      accessorKey: 'isMapped',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant="outline" className={row.original.isMapped ? 'border-blue-500 text-blue-500' : 'border-orange-500 text-orange-500'}>
          {row.original.isMapped ? 'Mapped' : 'Unmapped'}
        </Badge>
      )
    },
    {
      accessorKey: 'mappedStudentId',
      header: 'Mapped To',
      cell: ({ row }) => row.original.isMapped ? `Student ${row.original.mappedStudentId}` : '-'
    },
    {
      accessorKey: 'mappedBy',
      header: 'Mapped By',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const txn = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onViewDetails(txn)}>
              <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </Button>
            {!txn.isMapped ? (
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onMapPayment(txn)}>
                <Link2 className="h-4 w-4 text-blue-500 hover:text-blue-600" />
              </Button>
            ) : (
              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-blue-500 hover:text-blue-600" onClick={() => onViewDetails(txn)}>
                View Mapping
              </Button>
            )}
            {!txn.isMapped && (
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onDelete(txn.id)}>
                <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/80" />
              </Button>
            )}
          </div>
        );
      }
    }
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    manualSorting: true,
    manualFiltering: true,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px] max-h-[300px] overflow-y-auto">
            {table.getAllLeafColumns().map((column) => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id.replace(/([A-Z])/g, ' $1').trim()}
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border bg-card overflow-x-auto relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        <Table>
          <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap font-semibold">
                    {header.isPlaceholder
                      ? null
                      : (
                        <div
                          className={`flex items-center gap-1 ${header.column.getCanSort() ? 'cursor-pointer select-none' : ''}`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: <ChevronUp className="h-3 w-3" />,
                            desc: <ChevronDown className="h-3 w-3" />,
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="whitespace-nowrap py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {loading ? 'Loading transactions...' : 'No transactions found.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          Showing page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
        </div>
        <div className="flex items-center space-x-2">
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
          <select
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={table.getState().pagination.pageSize}
            onChange={e => {
              table.setPageSize(Number(e.target.value))
            }}
          >
            {[10, 20, 30, 40, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
