"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { usePackageRequestsAPI } from "@/hooks/api/use-package-requests";
import { useBranchesAPI } from "@/hooks/api/use-branches";
import { useCourtsAPI } from "@/hooks/api/use-courts";
import { usePagination } from "@/hooks/code/use-pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FilterX } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format-date";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, CheckCircle2, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PackageRequestsPage() {
    const t = useTranslations("packageRequests");
    const [filterBranchId, setFilterBranchId] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("all");

    const {
        requests,
        loading: requestsLoading,
        fetchAdminRequests,
        updateRequestStatus,
    } = usePackageRequestsAPI();

    const { branches, fetchBranches } = useBranchesAPI();
    const { page, perPage, goToPage, changePerPage } = usePagination(1, 25);

    const loadData = () => {
        const params: any = {};
        if (filterBranchId !== "all") params.branch_id = Number(filterBranchId);
        if (filterStatus !== "all") params.status = filterStatus;
        fetchAdminRequests(params);
    };

    useEffect(() => {
        fetchBranches();
    }, [fetchBranches]);

    useEffect(() => {
        loadData();
    }, [filterBranchId, filterStatus]);

    const clearFilters = () => {
        setFilterBranchId("all");
        setFilterStatus("all");
        goToPage(1);
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        const result = await updateRequestStatus(id, status);
        if (result.success) {
            toast.success(t("statusUpdated"));
            loadData();
        } else {
            toast.error(t("updateFailed"));
        }
    };

    const statusMap = {
        pending: { label: t("status.pending"), variant: "secondary" as const },
        reviewed: { label: t("status.reviewed"), variant: "outline" as const },
        contacted: { label: t("status.contacted"), variant: "default" as const },
        completed: { label: t("status.completed"), variant: "default" as const },
        archived: { label: t("status.archived"), variant: "destructive" as const },
    };

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="space-y-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("page.title")}</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {t("page.subtitle")}
                    </p>
                </div>

                <div className="bg-card border border-border rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 sm:gap-3 items-end">
                        <div className="w-full">
                            <Label className="text-sm text-muted-foreground mb-1 block">{t("page.branchFilter")}</Label>
                            <Select value={filterBranchId} onValueChange={(v) => {
                                setFilterBranchId(v);
                                goToPage(1);
                            }}>
                                <SelectTrigger className="w-full" data-testid="branch-filter">
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

                        <div className="w-full">
                            <Label className="text-sm text-muted-foreground mb-1 block">{t("page.statusFilter")}</Label>
                            <Select value={filterStatus} onValueChange={(v) => {
                                setFilterStatus(v);
                                goToPage(1);
                            }}>
                                <SelectTrigger className="w-full" data-testid="status-filter">
                                    <SelectValue placeholder={t("page.allStatuses")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t("page.allStatuses")}</SelectItem>
                                    <SelectItem value="pending">{t("status.pending")}</SelectItem>
                                    <SelectItem value="reviewed">{t("status.reviewed")}</SelectItem>
                                    <SelectItem value="contacted">{t("status.contacted")}</SelectItem>
                                    <SelectItem value="completed">{t("status.completed")}</SelectItem>
                                    <SelectItem value="archived">{t("status.archived")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button type="button" variant="ghost" className="w-full xl:w-auto" onClick={clearFilters}>
                            <FilterX className="h-4 w-4 mr-2" />
                            {t("page.clearFilters")}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm p-4">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("table.customer")}</TableHead>
                                <TableHead>{t("table.contact")}</TableHead>
                                <TableHead>{t("table.request")}</TableHead>
                                <TableHead>{t("table.status")}</TableHead>
                                <TableHead className="text-right">{t("table.actions")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requestsLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : requests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        {t("emptyMessage")}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                requests.map((request) => (
                                    <TableRow key={request.id}>
                                        <TableCell className="font-medium">{request.customer_name}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-sm">
                                                <span>{request.customer_email}</span>
                                                <span className="text-xs text-muted-foreground">{request.customer_phone}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm max-w-xs truncate" title={request.special_needs}>
                                                {request.special_needs}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {formatDate(request.created_at, "PPP")}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={statusMap[request.status as keyof typeof statusMap]?.variant || "secondary"}>
                                                {statusMap[request.status as keyof typeof statusMap]?.label || request.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">{t("table.openMenu")}</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(request.id, "reviewed")} disabled={request.status === "reviewed" || request.status === "contacted"}>
                                                        <Clock className="mr-2 h-4 w-4" /> {t("markReviewed")}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(request.id, "contacted")} disabled={request.status === "contacted" || request.status === "completed"}>
                                                        <CheckCircle2 className="mr-2 h-4 w-4" /> {t("markContacted")}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(request.id, "archived")}>
                                                        {t("markArchived")}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
