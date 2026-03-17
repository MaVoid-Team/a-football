"use client";

import { useTranslations } from "next-intl";
import { Package } from "@/schemas/package.schema";
import { Branch } from "@/schemas/branch.schema";
import { DataTable } from "@/components/shared/data-table";
import { PackageFormDialog } from "./package-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format-currency";

interface PackageTableProps {
    packages: Package[];
    branches: Branch[];
    isLoading: boolean;
    onUpdate: (id: string, data: any) => Promise<{ success: boolean; error?: any }>;
    onDelete: (id: string) => Promise<void>;
}

export function PackageTable({ packages, branches, isLoading, onUpdate, onDelete }: PackageTableProps) {
    const t = useTranslations("packages");
    
    const getBranchName = (branchId?: number | null) => {
        if (!branchId) return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">{t("table.global")}</Badge>;
        const branch = branches.find(b => Number(b.id) === branchId);
        return branch ? branch.name : t("table.unknown");
    };

    const columns = [
        {
            header: t("table.titleHeader"),
            accessorKey: "title" as keyof Package,
            className: "font-medium",
        },
        {
            header: t("table.scopeHeader"),
            cell: (p: Package) => getBranchName(p.branch_id),
        },
        {
            header: t("table.priceHeader"),
            cell: (p: Package) => formatCurrency(p.price),
        },
        {
            header: t("table.descriptionHeader"),
            cell: (p: Package) => (
                <span className="text-muted-foreground line-clamp-1 max-w-xs" title={p.description || ""}>
                    {p.description || "-"}
                </span>
            ),
        },
        {
            header: t("table.actionsHeader"),
            className: "text-right",
            cell: (p: Package) => (
                <div className="flex justify-end gap-2">
                    <PackageFormDialog packageItem={p} branches={branches} onSubmit={(data) => onUpdate(p.id, data)} />
                    <ConfirmDialog
                        title={t("table.deleteTitle")}
                        description={t("table.deleteDescription", { title: p.title })}
                        onConfirm={() => onDelete(p.id)}
                    />
                </div>
            ),
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={packages}
            isLoading={isLoading}
            emptyStateTitle={t("table.emptyTitle")}
            emptyStateDescription={t("table.emptyDescription")}
        />
    );
}
