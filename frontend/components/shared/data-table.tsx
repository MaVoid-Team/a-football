import React, { ReactNode } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingSpinner } from "./loading-spinner";
import { EmptyState } from "./empty-state";

interface ColumnDef<T> {
    header: string;
    accessorKey?: keyof T;
    cell?: (row: T) => ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: ColumnDef<T>[];
    isLoading?: boolean;
    emptyStateTitle?: string;
    emptyStateDescription?: string;
    selectable?: boolean;
    selectedIds?: string[];
    onSelectionChange?: (selectedIds: string[]) => void;
}

export function DataTable<T extends { id: string | number }>({
    data,
    columns,
    isLoading = false,
    emptyStateTitle = "No data found",
    emptyStateDescription = "Get started by creating a new record.",
    selectable = false,
    selectedIds = [],
    onSelectionChange,
}: DataTableProps<T>) {
    const handleSelectAll = () => {
        if (!onSelectionChange) return;
        if (selectedIds.length === data.length) {
            onSelectionChange([]);
        } else {
            onSelectionChange(data.map(row => String(row.id)));
        }
    };

    const handleSelectRow = (id: string | number) => {
        if (!onSelectionChange || !selectedIds) return;
        const idStr = String(id);
        if (selectedIds.includes(idStr)) {
            onSelectionChange(selectedIds.filter(sid => sid !== idStr));
        } else {
            onSelectionChange([...selectedIds, idStr]);
        }
    };

    const allSelected = data.length > 0 && selectedIds.length === data.length;
    const someSelected = selectedIds.length > 0 && selectedIds.length < data.length;

    if (isLoading) {
        return <LoadingSpinner className="py-20" />;
    }

    if (data.length === 0) {
        return <EmptyState title={emptyStateTitle} description={emptyStateDescription} />;
    }

    return (
        <div className="rounded-md border border-border overflow-x-auto" dir="ltr">
            <Table data-testid="data-table" className="min-w-[600px]">
                <TableHeader className="bg-muted">
                    <TableRow className="hover:bg-transparent">
                        {selectable && (
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={allSelected}
                                    data-state={someSelected ? "indeterminate" : allSelected ? "checked" : "unchecked"}
                                    onCheckedChange={handleSelectAll}
                                    aria-label="Select all"
                                />
                            </TableHead>
                        )}
                        {columns.map((col, index) => (
                            <TableHead key={index} className={col.className}>
                                {col.header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((row) => (
                        <TableRow key={row.id.toString()} data-testid={`table-row-${row.id}`}>
                            {selectable && (
                                <TableCell className="w-12">
                                    <Checkbox
                                        checked={selectedIds.includes(String(row.id))}
                                        onCheckedChange={() => handleSelectRow(row.id)}
                                        aria-label={`Select row ${row.id}`}
                                    />
                                </TableCell>
                            )}
                            {columns.map((col, colIndex) => {
                                const cellContent = col.cell ? col.cell(row) : (row[col.accessorKey as keyof T] as ReactNode);
                                return (
                                    <TableCell key={colIndex} className={col.className}>
                                        {cellContent}
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
