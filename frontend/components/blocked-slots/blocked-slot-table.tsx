"use client";

import { useTranslations } from "next-intl";
import { BlockedSlot } from "@/schemas/blocked-slot.schema";
import { Branch } from "@/schemas/branch.schema";
import { Court } from "@/schemas/court.schema";
import { DataTable } from "@/components/shared/data-table";
import { BlockedSlotFormDialog } from "./blocked-slot-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatDate } from "@/lib/format-date";
import { formatTime } from "@/lib/format-time";

interface BlockedSlotTableProps {
    blockedSlots: BlockedSlot[];
    branches: Branch[];
    courts: Court[];
    isLoading: boolean;
    onUpdate: (id: string, data: any) => Promise<{ success: boolean; error?: any }>;
    onDelete: (id: string) => Promise<void>;
}

export function BlockedSlotTable({ blockedSlots, branches, courts, isLoading, onUpdate, onDelete }: BlockedSlotTableProps) {
    const t = useTranslations("blockedSlots.table");
    const getBranchName = (branchId: number) => {
        const branch = branches.find(b => Number(b.id) === branchId);
        return branch ? branch.name : t("unknown");
    };

    const getCourtName = (courtId: number) => {
        const court = courts.find(c => Number(c.id) === courtId);
        return court ? court.name : t("unknown");
    };

    const columns = [
        {
            header: t("dateHeader"),
            cell: (bs: BlockedSlot) => formatDate(bs.date, "PP"),
            className: "font-medium whitespace-nowrap align-middle w-[140px]",
        },
        {
            header: t("locationHeader"),
            cell: (bs: BlockedSlot) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{getCourtName(bs.court_id)}</span>
                    <span className="text-xs text-muted-foreground">{getBranchName(bs.branch_id)}</span>
                </div>
            ),
            className: "align-middle min-w-[220px]",
        },
        {
            header: t("fromHeader"),
            cell: (bs: BlockedSlot) => formatTime(bs.start_time),
            className: "whitespace-nowrap align-middle w-[110px]",
        },
        {
            header: t("toHeader"),
            cell: (bs: BlockedSlot) => formatTime(bs.end_time),
            className: "whitespace-nowrap align-middle w-[110px]",
        },
        {
            header: t("reasonHeader"),
            cell: (bs: BlockedSlot) => (
                <span className="block truncate" title={bs.reason}>
                    {bs.reason}
                </span>
            ),
            className: "align-middle min-w-[180px] max-w-[280px]",
        },
        {
            header: t("actionsHeader"),
            className: "text-right align-middle whitespace-nowrap w-[120px]",
            cell: (bs: BlockedSlot) => (
                <div className="flex justify-end gap-2">
                    <BlockedSlotFormDialog
                        blockedSlot={bs}
                        branches={branches}
                        courts={courts}
                        onSubmit={(data) => onUpdate(bs.id, data)}
                    />
                    <ConfirmDialog
                        title={t("deleteTitle")}
                        description={t("deleteDescription")}
                        onConfirm={() => onDelete(bs.id)}
                    />
                </div>
            ),
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={blockedSlots}
            isLoading={isLoading}
            emptyStateTitle={t("emptyTitle")}
            emptyStateDescription={t("emptyDescription")}
        />
    );
}
