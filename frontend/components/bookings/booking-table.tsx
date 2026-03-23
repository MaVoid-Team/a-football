"use client";

import { useTranslations } from "next-intl";
import { Booking } from "@/schemas/booking.schema";
import { Branch } from "@/schemas/branch.schema";
import { Court } from "@/schemas/court.schema";
import { DataTable } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Banknote, Ban, Eye, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/format-date";
import { formatTime } from "@/lib/format-time";
import { formatCurrency } from "@/lib/format-currency";
import { Link } from "@/i18n/navigation";

interface BookingTableProps {
    bookings: Booking[];
    branches: Branch[];
    courts: Court[];
    isLoading: boolean;
    onUpdatePayment: (id: string, status: "pending" | "paid" | "failed" | "refunded") => Promise<{ success: boolean; error?: any }>;
    onCancel: (id: string) => Promise<void>;
    onMarkNoShow: (id: string) => Promise<void>;
}

export function BookingTable({ bookings, branches, courts, isLoading, onUpdatePayment, onCancel, onMarkNoShow }: BookingTableProps) {
    const t = useTranslations("bookings");

    const getBranchName = (branchId: number) => {
        const branch = branches.find((b) => Number(b.id) === branchId);
        return branch ? branch.name : t("table.unknown");
    };

    const getCourtName = (courtId: number) => {
        const court = courts.find((c) => Number(c.id) === courtId);
        return court ? court.name : t("table.unknown");
    };

    const paymentStatusMap = {
        pending: { label: t("status.pending"), variant: "secondary" as const },
        paid: { label: t("status.paid"), variant: "default" as const },
        failed: { label: t("status.failed"), variant: "destructive" as const },
        refunded: { label: t("status.refunded"), variant: "destructive" as const },
    };

    const columns = [
        {
            header: t("table.userHeader"),
            cell: (b: Booking) => (
                <div className="flex flex-col max-w-[170px]">
                    <span className="font-medium text-sm truncate" title={b.user_name}>{b.user_name}</span>
                    <span className="text-xs text-muted-foreground truncate" title={b.user_phone}>{b.user_phone}</span>
                </div>
            ),
        },
        {
            header: t("table.locationHeader"),
            cell: (b: Booking) => (
                <div className="flex flex-col max-w-[180px]">
                    <span className="text-sm font-medium truncate" title={getCourtName(b.court_id)}>{getCourtName(b.court_id)}</span>
                    <span className="text-xs text-muted-foreground truncate" title={getBranchName(b.branch_id)}>{getBranchName(b.branch_id)}</span>
                </div>
            ),
        },
        {
            header: t("table.scheduleHeader"),
            cell: (b: Booking) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{formatDate(b.date, "PP")}</span>
                    <span className="text-xs text-muted-foreground">
                        {formatTime(b.start_time)} - {formatTime(b.end_time)} ({b.hours}{t("table.hoursSuffix")})
                    </span>
                </div>
            ),
        },
        {
            header: t("table.priceHeader"),
            cell: (b: Booking) => {
                const total = Number(b.total_price ?? 0);
                return (
                <div className="flex flex-col">
                    <span className="font-semibold">{formatCurrency(total)}</span>
                    {Number(b.discount_amount ?? 0) > 0 && (
                        <span className="text-xs text-green-600 dark:text-green-400">
                            -{formatCurrency(b.discount_amount)}
                        </span>
                    )}
                </div>
                );
            },
        },
        {
            header: t("table.paymentTypeHeader"),
            cell: (b: Booking) => (
                <Badge variant={b.payment_option === "deposit" ? "outline" : "secondary"} className="text-[10px]">
                    {b.payment_option === "deposit" ? t("table.paymentTypeDeposit") : t("table.paymentTypeFull")}
                </Badge>
            ),
        },
        {
            header: t("table.dueNowHeader"),
            cell: (b: Booking) => <span className="font-medium">{formatCurrency(b.amount_due_now || b.total_price || 0)}</span>,
        },
        {
            header: t("table.remainingHeader"),
            cell: (b: Booking) => {
                const remaining = Number(b.amount_remaining || 0);
                return <span className={remaining > 0 ? "text-amber-600 dark:text-amber-400" : ""}>{formatCurrency(remaining)}</span>;
            },
        },
        {
            header: t("table.statusHeader"),
            cell: (b: Booking) => (
                <div className="flex flex-col gap-1 items-start">
                    <Badge variant={b.status === "confirmed" ? "outline" : "destructive"}>
                        {b.status === "confirmed" ? t("status.confirmed") : t("status.cancelled")}
                    </Badge>
                    <Badge variant={b.payment_status ? paymentStatusMap[b.payment_status].variant : "secondary"} className="text-[10px]">
                        {b.payment_status ? paymentStatusMap[b.payment_status].label : t("status.pending")}
                    </Badge>
                </div>
            ),
        },
        {
            header: t("table.actionsHeader"),
            className: "text-right",
            cell: (b: Booking) => (
                <div className="flex justify-end pr-1 gap-1">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" data-testid={`booking-actions-${b.id}`}>
                                <span className="sr-only">{t("table.openMenu")}</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/bookings/${b.id}`}>
                                    <Eye className="mr-2 h-4 w-4" /> {t("table.viewDetails")}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onUpdatePayment(b.id, "paid")} disabled={b.payment_status === "paid"}>
                                <Banknote className="mr-2 h-4 w-4" /> {t("table.markAsPaid")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onUpdatePayment(b.id, "failed")} disabled={b.payment_status === "failed"}>
                                <AlertTriangle className="mr-2 h-4 w-4 text-destructive" /> {t("table.markAsFailed")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onUpdatePayment(b.id, "refunded")} disabled={b.payment_status === "refunded"}>
                                <Banknote className="mr-2 h-4 w-4 text-destructive" /> {t("table.markAsRefunded")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onMarkNoShow(b.id)}>
                                <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" /> {t("table.markAsNoShow")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <ConfirmDialog
                        title={t("table.cancelTitle")}
                        description={t("table.cancelDescription", { userName: b.user_name })}
                        onConfirm={() => onCancel(b.id)}
                        disabled={b.status === "cancelled"}
                        triggerButton={
                            <Button variant="ghost" size="icon" className="text-destructive" disabled={b.status === "cancelled"}>
                                <Ban className="h-4 w-4" />
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
            data={bookings}
            isLoading={isLoading}
            emptyStateTitle={t("table.emptyTitle")}
            emptyStateDescription={t("table.emptyDescription")}
        />
    );
}
