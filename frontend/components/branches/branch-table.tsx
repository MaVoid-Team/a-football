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
import { useTranslations } from "next-intl";
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
    const t = useTranslations("branches.table");
    const { admin } = useAuthContext();
    const isSuperAdmin = admin?.role === "super_admin";

    const columns = [
        {
            header: t("nameHeader"),
            accessorKey: "name" as keyof Branch,
            className: "font-medium",
        },
        {
            header: t("addressHeader"),
            accessorKey: "address" as keyof Branch,
        },
        {
            header: t("timezoneHeader"),
            accessorKey: "timezone" as keyof Branch,
        },
        {
            header: t("statusHeader"),
            cell: (b: Branch) => (
                <Badge variant={b.active ? "default" : "secondary"}>
                    {b.active ? t("active") : t("inactive")}
                </Badge>
            ),
        },
        {
            header: t("createdAtHeader"),
            cell: (b: Branch) => formatDate(b.created_at),
        },
        {
            header: t("actionsHeader"),
            className: "text-right",
            cell: (b: Branch) => (
                <div className="flex justify-end gap-2">
                    <BranchFormDialog branch={b} onSubmit={(data) => onUpdate(b.id, data)} />
                    {isSuperAdmin ? (
                        <ConfirmDialog
                            title={t("deleteTitle")}
                            description={t("deleteDescription", { name: b.name })}
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
                                    <p>{t("onlySuperAdminsDelete")}</p>
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
            emptyStateTitle={t("emptyTitle")}
            emptyStateDescription={t("emptyDescription")}
        />
    );
}
