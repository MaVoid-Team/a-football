"use client";

import { useTranslations } from "next-intl";
import { Event } from "@/schemas/event.schema";
import { Branch } from "@/schemas/branch.schema";
import { DataTable } from "@/components/shared/data-table";
import { EventFormDialog } from "./event-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatCurrency } from "@/lib/format-currency";
import { formatDate } from "@/lib/format-date";

interface EventTableProps {
    events: Event[];
    branches: Branch[];
    isLoading: boolean;
    onUpdate: (id: string, data: any) => Promise<{ success: boolean; error?: any }>;
    onDelete: (id: string) => Promise<void>;
}

export function EventTable({ events, branches, isLoading, onUpdate, onDelete }: EventTableProps) {
    const t = useTranslations("events.table");

    const getBranchName = (branchId: number) => {
        const branch = branches.find(b => Number(b.id) === branchId);
        return branch ? branch.name : t("unknownBranch");
    };

    const columns = [
        {
            header: t("titleHeader"),
            accessorKey: "title" as keyof Event,
            className: "font-medium",
        },
        {
            header: t("branchHeader"),
            cell: (e: Event) => getBranchName(e.branch_id),
            className: "text-muted-foreground",
        },
        {
            header: t("dateHeader"),
            cell: (e: Event) => formatDate(e.start_date, "PPP"),
        },
        {
            header: t("priceHeader"),
            cell: (e: Event) => formatCurrency(e.participation_price),
        },
        {
            header: t("limitHeader"),
            cell: (e: Event) => e.max_participants ? `${e.max_participants} ${t("quantitySuffix")}` : t("unlimited"),
        },
        {
            header: t("actionsHeader"),
            className: "text-right",
            cell: (e: Event) => (
                <div className="flex justify-end gap-2">
                    <EventFormDialog event={e} branches={branches} onSubmit={(data) => onUpdate(e.id, data)} />
                    <ConfirmDialog
                        title={t("deleteTitle")}
                        description={t("deleteDescription", { title: e.title })}
                        onConfirm={() => onDelete(e.id)}
                    />
                </div>
            ),
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={events}
            isLoading={isLoading}
            emptyStateTitle={t("emptyTitle")}
            emptyStateDescription={t("emptyDescription")}
        />
    );
}
