"use client";

import { useTranslations } from "next-intl";
import { Court } from "@/schemas/court.schema";
import { Branch } from "@/schemas/branch.schema";
import { DataTable } from "@/components/shared/data-table";
import { CourtFormDialog } from "./court-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format-currency";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Star, Eye } from "lucide-react";

interface CourtTableProps {
    courts: Court[];
    branches: Branch[];
    isLoading: boolean;
    onUpdate: (id: string, data: any) => Promise<{ success: boolean; error?: any }>;
    onDelete: (id: string) => Promise<void>;
}

export function CourtTable({ courts, branches, isLoading, onUpdate, onDelete }: CourtTableProps) {
    const t = useTranslations("courts");
    
    const getBranchName = (branchId: number) => {
        const branch = branches.find(b => Number(b.id) === branchId);
        return branch ? branch.name : t("table.unknownBranch");
    };

    const columns = [
        {
            header: t("table.branchHeader"),
            cell: (c: Court) => getBranchName(c.branch_id),
            className: "font-medium text-muted-foreground",
        },
        {
            header: t("table.nameHeader"),
            cell: (c: Court) => (
                <Link
                    href={`/courts/${c.id}`}
                    className="font-medium hover:text-primary-text transition-colors"
                >
                    {c.name}
                </Link>
            ),
            className: "font-medium",
        },
        {
            header: t("table.priceHeader"),
            cell: (c: Court) => formatCurrency(c.price_per_hour),
        },
        {
            header: t("table.statusHeader"),
            cell: (c: Court) => (
                <Badge variant={c.active ? "default" : "secondary"}>
                    {c.active ? t("table.active") : t("table.inactive")}
                </Badge>
            ),
        },
        {
            header: t("table.perksHeader"),
            cell: (c: Court) => {
                const activePerks = c.perks?.filter(p => p.active) || [];
                return (
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-primary/10 text-primary-text border-primary/20">
                            {t("table.perksCount", { count: activePerks.length })}
                        </Badge>
                        {activePerks.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                                {activePerks.slice(0, 2).map(p => p.name).join(", ")}
                                {activePerks.length > 2 && t("table.morePerks", { count: activePerks.length - 2 })}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            header: t("table.actionsHeader"),
            className: "text-right",
            cell: (c: Court) => (
                <div className="flex justify-end gap-2">
                    <Button
                        asChild
                        variant="outline"
                        size="sm"
                    >
                        <Link href={`/courts/${c.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            {t("table.viewDetails")}
                        </Link>
                    </Button>
                    <Button
                        asChild
                        variant="outline"
                        size="sm"
                    >
                        <Link href={`/courts/${c.id}#perks`}>
                            <Star className="mr-2 h-4 w-4" />
                            {t("table.managePerks")}
                        </Link>
                    </Button>
                    <CourtFormDialog
                        court={c}
                        branches={branches}
                        onSubmit={(data) => onUpdate(c.id, data)}
                    />
                    <ConfirmDialog
                        title={t("table.deleteTitle")}
                        description={t("table.deleteDescription", { name: c.name })}
                        onConfirm={() => onDelete(c.id)}
                        triggerButton={
                            <Button variant="destructive" size="sm">
                                {t("table.deleteButton")}
                            </Button>
                        }
                    />
                </div>
            ),
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={courts}
            isLoading={isLoading}
            emptyStateTitle={t("table.emptyTitle")}
            emptyStateDescription={t("table.emptyDescription")}
        />
    );
}
