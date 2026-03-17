"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useBranchesAPI } from "@/hooks/api/use-branches";
import { usePagination } from "@/hooks/code/use-pagination";
import { BranchTable } from "@/components/branches/branch-table";
import { BranchFormDialog } from "@/components/branches/branch-form-dialog";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { BranchFormData } from "@/schemas/branch.schema";

export default function BranchesPage() {
    const t = useTranslations("branches.page");
    const tToast = useTranslations("branches.toasts");
    const {
        branches,
        pagination: meta,
        loading,
        fetchBranches,
        createBranch,
        updateBranch,
        deleteBranch
    } = useBranchesAPI();

    const { page, perPage, goToPage, changePerPage } = usePagination(1, 25);

    const loadData = () => {
        fetchBranches({ page, per_page: perPage });
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, perPage]);

    const handleCreate = async (data: BranchFormData) => {
        const res = await createBranch(data);
        if (res.success) {
            toast.success(tToast("created"));
            loadData();
        }
        return res;
    };

    const handleUpdate = async (id: string, data: Partial<BranchFormData>) => {
        const res = await updateBranch(id, data);
        if (res.success) {
            toast.success(tToast("updated"));
            loadData();
        }
        return res;
    };

    const handleDelete = async (id: string) => {
        const res = await deleteBranch(id);
        if (res.success) {
            toast.success(tToast("deleted"));
            loadData();
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("title")}</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {t("subtitle")}
                    </p>
                </div>
                <BranchFormDialog onSubmit={handleCreate} />
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm p-4">
                <BranchTable
                    branches={branches}
                    isLoading={loading}
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
