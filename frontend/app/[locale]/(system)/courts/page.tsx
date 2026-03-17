"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useCourtsAPI } from "@/hooks/api/use-courts";
import { useBranchesAPI } from "@/hooks/api/use-branches";
import { usePagination } from "@/hooks/code/use-pagination";
import { CourtTable } from "@/components/courts/court-table";
import { CourtFormDialog } from "@/components/courts/court-form-dialog";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { CourtFormData } from "@/schemas/court.schema";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function CourtsPage() {
    const t = useTranslations("courts");
    const [filterBranchId, setFilterBranchId] = useState<string>("all");

    const {
        courts,
        pagination: meta,
        loading: courtsLoading,
        fetchCourts,
        createCourt,
        updateCourt,
        deleteCourt
    } = useCourtsAPI();

    const { branches, fetchBranches } = useBranchesAPI();
    const { page, perPage, goToPage, changePerPage } = usePagination(1, 25);

    const loadData = () => {
        const params: any = { page, per_page: perPage };
        if (filterBranchId !== "all") {
            params.branch_id = Number(filterBranchId);
        }
        fetchCourts(params);
    };

    useEffect(() => {
        fetchBranches(); // Fetch all branches for dropdowns without pagination constraints
    }, [fetchBranches]);

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, perPage, filterBranchId]);

    const handleCreate = async (data: CourtFormData) => {
        const res = await createCourt(data);
        if (res.success) {
            toast.success(t("toasts.created"));
            loadData();
        }
        return res;
    };

    const handleUpdate = async (id: string, data: Partial<CourtFormData>) => {
        const res = await updateCourt(id, data);
        if (res.success) {
            toast.success(t("toasts.updated"));
            loadData();
        }
        return res;
    };

    const handleDelete = async (id: string) => {
        const res = await deleteCourt(id);
        if (res.success) {
            toast.success(t("toasts.deleted"));
            loadData();
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("page.title")}</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {t("page.subtitle")}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="branch-filter" className="text-sm text-muted-foreground whitespace-nowrap">
                            {t("page.filterByBranch")}
                        </Label>
                        <Select value={filterBranchId} onValueChange={(v) => { setFilterBranchId(v); goToPage(1); }}>
                            <SelectTrigger id="branch-filter" className="w-[180px]" data-testid="branch-filter-select">
                                <SelectValue placeholder={t("page.allBranches")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t("page.allBranches")}</SelectItem>
                                {branches.map(b => (
                                    <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <CourtFormDialog branches={branches} onSubmit={handleCreate} />
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm p-4">
                <CourtTable
                    courts={courts}
                    branches={branches}
                    isLoading={courtsLoading}
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
