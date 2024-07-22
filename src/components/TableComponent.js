import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
} from '@mui/material';

const TableComponent = ({ data }) => {
  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
      },
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorKey: 'category',
        header: 'Category',
      },
      {
        accessorKey: 'subcategory',
        header: 'Sub Category',
      },
      {
        accessorKey: 'createdAt',
        header: 'Created At',
      },
      {
        accessorKey: 'updatedAt',
        header: 'Updated At',
      },
      {
        accessorKey: 'price',
        header: 'Price',
      },
      {
        accessorKey: 'sale_price',
        header: 'Sale Price',
      }
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(column => (
                <TableCell key={column.id}>
                  {flexRender(column.columnDef.header, column.getContext())}
                  <TableSortLabel
                    active={!!column.getIsSorted()}
                    direction={column.getIsSortedDesc() ? 'desc' : 'asc'}
                    onClick={column.getToggleSortingHandler()}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TableComponent;
