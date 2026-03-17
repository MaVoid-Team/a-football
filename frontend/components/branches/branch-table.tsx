"use client";

import { Branch } from "@/schemas/branch.schema";
import { DataTable } from "@/components/shared/data-table";
import { BranchFormDialog } from "./branch-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { formatDate } from "@/lib/format-date";
import { useAuthContext } from "@/contexts/auth-context";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface BranchTableProps {
    branches: Branch[];
    isLoading: boolean;
    onUpdate: (id: string, data: any) => Promise<{ success: boolean; error?: any }>;
    onDelete: (id: string) => Promise<void>;
}

export function BranchTable({ branches, isLoading, onUpdate, onDelete }: BranchTableProps) {
    const { admin } = useAuthContext();
    const isSuperAdmin = admin?.role === "super_admin";

    const columns = [
        {
            header: "Name",
            accessorKey: "name" as keyof Branch,
            className: "font-medium",
        },
        {
            header: "Address",
            accessorKey: "address" as keyof Branch,
        },
        {
            header: "Timezone",
            accessorKey: "timezone" as keyof Branch,
        },
        {
            header: "Status",
            cell: (b: Branch) => (
                <Badge variant={b.active ? "default" : "secondary"}>
                    {b.active ? "Active" : "Inactive"}
                </Badge>
            ),
        },
        {
            header: "Created At",
            cell: (b: Branch) => formatDate(b.created_at),
        },
        {
            header: "Actions",
            className: "text-right",
            cell: (b: Branch) => (
                <div className="flex justify-end gap-2">
                    <BranchFormDialog branch={b} onSubmit={(data) => onUpdate(b.id, data)} />
                    {isSuperAdmin ? (
                        <ConfirmDialog
                            title="Delete Branch"
                            description={`Are you sure you want to delete ${b.name}? This will affect all courts and bookings in this branch.`}
                            onConfirm={() => onDelete(b.id)}
                        />
                    ) : (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="destructive" size="icon" disabled>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Only super admins can delete branches</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            ),
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={branches}
            isLoading={isLoading}
            emptyStateTitle="No branches found"
            emptyStateDescription="Add a new branch using the button above."
        />
    );
}
