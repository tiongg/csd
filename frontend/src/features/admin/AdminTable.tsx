import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type AdminTableColumn = {
  label: string;
  className?: string;
};

type AdminTableProps = {
  columns: AdminTableColumn[];
  children: ReactNode;
};

export function AdminTable({ columns, children }: AdminTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white/70 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/80">
            {columns.map((column, index) => (
              <TableHead
                key={`${column.label}-${index}`}
                className={cn(
                  'px-4 py-3 text-xs font-semibold tracking-[0.08em] text-slate-500 uppercase',
                  column.className,
                )}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody className="[&_tr:last-child]:border-b-0">
          {children}
        </TableBody>
      </Table>
    </div>
  );
}

type AdminTableMessageRowProps = {
  colSpan: number;
  message: string;
};

export function AdminTableMessageRow({
  colSpan,
  message,
}: AdminTableMessageRowProps) {
  return (
    <TableRow className="bg-transparent">
      <TableCell colSpan={colSpan} className="py-10 text-center text-slate-500">
        {message}
      </TableCell>
    </TableRow>
  );
}
