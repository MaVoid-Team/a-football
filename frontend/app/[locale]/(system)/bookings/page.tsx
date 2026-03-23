"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useBookingsAPI } from "@/hooks/api/use-bookings";
import { useBranchesAPI } from "@/hooks/api/use-branches";
import { useCourtsAPI } from "@/hooks/api/use-courts";
import { usePagination } from "@/hooks/code/use-pagination";
import { BookingTable } from "@/components/bookings/booking-table";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { exportBookingsToExcel, exportBookingsToCSV } from "@/lib/export-bookings";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FilterX } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function BookingsPage() {
    const t = useTranslations("bookings");
    const [filterBranchId, setFilterBranchId] = useState<string>("all");
    const [filterCourtId, setFilterCourtId] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>("all");
    const [filterDate, setFilterDate] = useState<string>("");

    const {
        bookings,
        pagination: meta,
        loading: bookingsLoading,
        fetchBookings,
        updatePaymentStatus,
        cancelBooking,
        markNoShow,
    } = useBookingsAPI();

    const { branches, fetchBranches } = useBranchesAPI();
    const { courts, fetchCourts } = useCourtsAPI();
    const { page, perPage, goToPage, changePerPage } = usePagination(1, 25);

    const loadData = () => {
        const params: any = { page, per_page: perPage };
        if (filterBranchId !== "all") params.branch_id = Number(filterBranchId);
        if (filterCourtId !== "all") params.court_id = Number(filterCourtId);
        if (filterStatus !== "all") params.status = filterStatus;
        if (filterPaymentStatus !== "all") params.payment_status = filterPaymentStatus;
        if (filterDate) params.date = filterDate;
        fetchBookings(params);
    };

    useEffect(() => {
        fetchBranches();
        fetchCourts({ per_page: 500 });
    }, [fetchBranches, fetchCourts]);

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, perPage, filterBranchId, filterCourtId, filterStatus, filterPaymentStatus, filterDate]);

    const filteredCourts = filterBranchId === "all"
        ? courts
        : courts.filter((court) => Number(court.branch_id) === Number(filterBranchId));

    const clearFilters = () => {
        setFilterBranchId("all");
        setFilterCourtId("all");
        setFilterStatus("all");
        setFilterPaymentStatus("all");
        setFilterDate("");
        goToPage(1);
    };

    const handleUpdatePayment = async (id: string, status: "pending" | "paid" | "failed" | "refunded") => {
        const res = await updatePaymentStatus(id, status);
        if (res.success) {
            toast.success(t("toasts.paymentStatusUpdated", { status: t(`status.${status}`) }));
            loadData();
        }
        return res;
    };

    const handleCancel = async (id: string) => {
        const res = await cancelBooking(id);
        if (res.success) {
            toast.success(t("toasts.cancelled"));
            loadData();
        }
    };

    const handleMarkNoShow = async (id: string) => {
        const res = await markNoShow(id);
        if (res.success) {
            toast.success(t("toasts.markedNoShow"));
            loadData();
        } else {
            toast.error(t("toasts.markNoShowFailed"));
        }
    };

    const handleExportExcel = () => {
        try {
            exportBookingsToExcel({ bookings, branches, courts });
            toast.success(t("toasts.excelExported"));
        } catch (error) {
            toast.error(t("toasts.exportFailed", { format: "Excel" }));
            console.error("Export error:", error);
        }
    };

    const handleExportCSV = () => {
        try {
            exportBookingsToCSV({ bookings, branches, courts });
            toast.success(t("toasts.csvExported"));
        } catch (error) {
            toast.error(t("toasts.exportFailed", { format: "CSV" }));
            console.error("Export error:", error);
        }
    };

    const handleExportAll = async () => {
        try {
            // Fetch all bookings without pagination
            const params: any = { per_page: 10000 };
            if (filterBranchId !== "all") params.branch_id = Number(filterBranchId);
            if (filterCourtId !== "all") params.court_id = Number(filterCourtId);
            if (filterStatus !== "all") params.status = filterStatus;
            if (filterPaymentStatus !== "all") params.payment_status = filterPaymentStatus;
            if (filterDate) params.date = filterDate;
            
            const response = await fetchBookings(params, { skipStateUpdate: true });
            if (response?.success && response?.data) {
                exportBookingsToExcel({ bookings: response.data, branches, courts });
                toast.success(t("toasts.allExported"));
            }
        } catch (error) {
            toast.error(t("toasts.exportAllFailed"));
            console.error("Export error:", error);
        }
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 sm:gap-3 items-end">
                        <div className="w-full">
                            <Label className="text-sm text-muted-foreground mb-1 block">{t("page.statusFilter")}</Label>
                            <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); goToPage(1); }}>
                                <SelectTrigger className="w-full" data-testid="status-filter">
                                    <SelectValue placeholder={t("page.allStatuses")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t("page.allStatuses")}</SelectItem>
                                    <SelectItem value="confirmed">{t("status.confirmed")}</SelectItem>
                                    <SelectItem value="cancelled">{t("status.cancelled")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-full">
                            <Label className="text-sm text-muted-foreground mb-1 block">{t("page.branchFilter")}</Label>
                            <Select value={filterBranchId} onValueChange={(v) => {
                                setFilterBranchId(v);
                                setFilterCourtId("all");
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
                            <Label className="text-sm text-muted-foreground mb-1 block">{t("page.courtFilter")}</Label>
                            <Select value={filterCourtId} onValueChange={(v) => { setFilterCourtId(v); goToPage(1); }}>
                                <SelectTrigger className="w-full" data-testid="court-filter">
                                    <SelectValue placeholder={t("page.allCourts")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t("page.allCourts")}</SelectItem>
                                    {filteredCourts.map((court) => (
                                        <SelectItem key={court.id} value={court.id.toString()}>{court.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2 w-full xl:w-auto">
                                    <Download className="h-4 w-4" />
                                    {t("page.exportButton")}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleExportExcel}>
                                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                                    {t("export.currentPageExcel")}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleExportCSV}>
                                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                                    {t("export.currentPageCSV")}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleExportAll}>
                                    <Download className="mr-2 h-4 w-4" />
                                    {t("export.exportAllFiltered")}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 sm:gap-3 items-end">
                        <div className="w-full">
                            <Label className="text-sm text-muted-foreground mb-1 block">{t("page.paymentStatusFilter")}</Label>
                            <Select value={filterPaymentStatus} onValueChange={(v) => { setFilterPaymentStatus(v); goToPage(1); }}>
                                <SelectTrigger className="w-full" data-testid="payment-status-filter">
                                    <SelectValue placeholder={t("page.allPaymentStatuses")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t("page.allPaymentStatuses")}</SelectItem>
                                    <SelectItem value="pending">{t("status.pending")}</SelectItem>
                                    <SelectItem value="paid">{t("status.paid")}</SelectItem>
                                    <SelectItem value="failed">{t("status.failed")}</SelectItem>
                                    <SelectItem value="refunded">{t("status.refunded")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-full">
                            <Label htmlFor="date-filter" className="text-sm text-muted-foreground mb-1 block">{t("page.dateFilter")}</Label>
                            <Input
                                id="date-filter"
                                type="date"
                                className="w-full"
                                value={filterDate}
                                onChange={(e) => {
                                    setFilterDate(e.target.value);
                                    goToPage(1);
                                }}
                                data-testid="date-filter"
                            />
                        </div>

                        <Button type="button" variant="ghost" className="w-full xl:w-auto" onClick={clearFilters}>
                            <FilterX className="h-4 w-4 mr-2" />
                            {t("page.clearFilters")}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm p-4">
                <BookingTable
                    bookings={bookings}
                    branches={branches}
                    courts={courts}
                    isLoading={bookingsLoading}
                    onUpdatePayment={handleUpdatePayment}
                    onCancel={handleCancel}
                    onMarkNoShow={handleMarkNoShow}
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
