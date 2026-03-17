"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useBlockedSlotsAPI } from "@/hooks/api/use-blocked-slots";
import { useBranchesAPI } from "@/hooks/api/use-branches";
import { useCourtsAPI } from "@/hooks/api/use-courts";
import { usePagination } from "@/hooks/code/use-pagination";
import { BlockedSlotTable } from "@/components/blocked-slots/blocked-slot-table";
import { BlockedSlotFormDialog } from "@/components/blocked-slots/blocked-slot-form-dialog";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { BlockedSlotFormData } from "@/schemas/blocked-slot.schema";

export default function BlockedSlotsPage() {
    const t = useTranslations("blockedSlots.page");
    const tToast = useTranslations("blockedSlots.toasts");
    const {
        blockedSlots,
        pagination: meta,
        loading: bsLoading,
        fetchBlockedSlots,
        createBlockedSlot,
        updateBlockedSlot,
        deleteBlockedSlot
    } = useBlockedSlotsAPI();

    const { branches, fetchBranches } = useBranchesAPI();
    const { courts, fetchCourts } = useCourtsAPI();
    const { page, perPage, goToPage, changePerPage } = usePagination(1, 25);

    const loadData = () => {
        fetchBlockedSlots({ page, per_page: perPage });
    };

    useEffect(() => {
        fetchBranches();
        // Fetch all courts for lookups
        fetchCourts({ per_page: 500 });
    }, [fetchBranches, fetchCourts]);

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, perPage]);

    const handleCreate = async (data: BlockedSlotFormData) => {
        const res = await createBlockedSlot(data);
        if (res.success) {
            toast.success(tToast("created"));
            loadData();
        }
        return res;
    };

    const handleUpdate = async (id: string, data: Partial<BlockedSlotFormData>) => {
        const res = await updateBlockedSlot(id, data);
        if (res.success) {
            toast.success(tToast("updated"));
            loadData();
        }
        return res;
    };

    const handleDelete = async (id: string) => {
        const res = await deleteBlockedSlot(id);
        if (res.success) {
            toast.success(tToast("deleted"));
            loadData();
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("title")}</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {t("subtitle")}
                    </p>
                </div>

                <BlockedSlotFormDialog branches={branches} courts={courts} onSubmit={handleCreate} />
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm p-4">
                <BlockedSlotTable
                    blockedSlots={blockedSlots}
                    branches={branches}
                    courts={courts}
                    isLoading={bsLoading}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                />

                {meta && (
                    <PaginationControls
                        pagination={meta}
                        onPageChange={goToPage}
                        onPerPageChange={changePerPage}
                    />
                )}
            </div>
        </div>
    );
}
