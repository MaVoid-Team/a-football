"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { usePackagesAPI } from "@/hooks/api/use-packages";
import { useBranchesAPI } from "@/hooks/api/use-branches";
import { usePagination } from "@/hooks/code/use-pagination";
import { PackageTable } from "@/components/packages/package-table";
import { PackageFormDialog } from "@/components/packages/package-form-dialog";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { PackageFormData } from "@/schemas/package.schema";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function PackagesPage() {
    const t = useTranslations("packages");
    const [filterBranchId, setFilterBranchId] = useState<string>("all");

    const {
        packages,
        pagination: meta,
        loading: packagesLoading,
        fetchAdminPackages,
        createPackage,
        updatePackage,
        deletePackage
    } = usePackagesAPI();

    const { branches, fetchBranches } = useBranchesAPI();
    const { page, perPage, goToPage, changePerPage } = usePagination(1, 25);

    const loadData = () => {
        const params: any = { page, per_page: perPage };
        if (filterBranchId !== "all") {
            params.branch_id = Number(filterBranchId);
        }
        fetchAdminPackages(params);
    };

    useEffect(() => {
        fetchBranches();
    }, [fetchBranches]);

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, perPage, filterBranchId]);

    const handleCreate = async (data: PackageFormData) => {
        const res = await createPackage(data);
        if (res.success) {
            toast.success(t("toasts.created"));
            loadData();
        }
        return res;
    };

    const handleUpdate = async (id: string, data: Partial<PackageFormData>) => {
        const res = await updatePackage(id, data);
        if (res.success) {
            toast.success(t("toasts.updated"));
            loadData();
        }
        return res;
    };

    const handleDelete = async (id: string) => {
        const res = await deletePackage(id);
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
                            {t("page.filterByScope")}
                        </Label>
                        <Select value={filterBranchId} onValueChange={(v) => { setFilterBranchId(v); goToPage(1); }}>
                            <SelectTrigger id="branch-filter" className="w-[180px]" data-testid="package-branch-filter">
                                <SelectValue placeholder={t("page.allScopesPlaceholder")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t("page.allScopes")}</SelectItem>
                                <SelectItem value="null">{t("page.globalOnly")}</SelectItem>
                                {branches.map(b => (
                                    <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <PackageFormDialog branches={branches} onSubmit={handleCreate} />
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm p-4">
                <PackageTable
                    packages={packages}
                    branches={branches}
                    isLoading={packagesLoading}
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
