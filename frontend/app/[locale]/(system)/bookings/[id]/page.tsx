"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Loader2, Save, User, CalendarDays, MapPin, Wallet, FileText, BadgeDollarSign } from "lucide-react";

import { useBookingsAPI } from "@/hooks/api/use-bookings";
import { useBranchesAPI } from "@/hooks/api/use-branches";
import { useCourtsAPI } from "@/hooks/api/use-courts";
import { formatDate } from "@/lib/format-date";
import { formatTime } from "@/lib/format-time";
import { formatCurrency } from "@/lib/format-currency";
import { PaymentScreenshotViewer } from "@/components/bookings/payment-screenshot-viewer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function BookingDetailsPage() {
  const t = useTranslations("bookings");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const params = useParams<{ id: string }>();
  const bookingId = String(params?.id ?? "");

  const { booking, loading, fetchBooking, updateBooking, updatePaymentStatus } = useBookingsAPI();
  const { branches, fetchBranches } = useBranchesAPI();
  const { courts, fetchCourts } = useCourtsAPI();

  const [adminNotes, setAdminNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    fetchBranches();
    fetchCourts({ per_page: 500 });
  }, [fetchBranches, fetchCourts]);

  useEffect(() => {
    if (bookingId) fetchBooking(bookingId);
  }, [bookingId, fetchBooking]);

  useEffect(() => {
    setAdminNotes(booking?.admin_notes ?? "");
  }, [booking?.admin_notes]);

  const branchName = useMemo(() => {
    if (!booking) return t("table.unknown");
    return branches.find((b) => Number(b.id) === booking.branch_id)?.name ?? t("table.unknown");
  }, [booking, branches, t]);

  const courtName = useMemo(() => {
    if (!booking) return t("table.unknown");
    return courts.find((c) => Number(c.id) === booking.court_id)?.name ?? t("table.unknown");
  }, [booking, courts, t]);

  const handleSaveNotes = async () => {
    if (!booking) return;
    setSavingNotes(true);
    const result = await updateBooking(booking.id, { admin_notes: adminNotes });
    setSavingNotes(false);

    if (result.success) {
      toast.success(t("toasts.adminNotesSaved"));
      fetchBooking(booking.id);
    } else {
      toast.error(t("toasts.adminNotesSaveFailed"));
    }
  };

  const handlePaymentStatus = async (status: "pending" | "paid" | "refunded") => {
    if (!booking) return;
    const result = await updatePaymentStatus(booking.id, status);
    if (result.success) {
      toast.success(t("toasts.paymentStatusUpdated", { status: t(`status.${status}`) }));
      fetchBooking(booking.id);
    } else {
      toast.error(t("toasts.paymentStatusUpdateFailed"));
    }
  };

  if (loading && !booking) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link href="/bookings">
            <ArrowLeft className="h-4 w-4" />
            {t("detail.backToBookings")}
          </Link>
        </Button>
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            {t("detail.notFound")}
          </CardContent>
        </Card>
      </div>
    );
  }

  const originalAmount = Number(booking.original_price ?? booking.total_price ?? 0);
  const discountAmount = Number(booking.discount_amount ?? 0);
  const finalAmount = Number(booking.total_price ?? 0);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <div className={`flex items-center justify-between gap-3 flex-wrap ${isRtl ? "sm:flex-row-reverse" : ""}`}>
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link href="/bookings">
            <ArrowLeft className="h-4 w-4" />
            {t("detail.backToBookings")}
          </Link>
        </Button>
        <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
          <Badge variant={booking.status === "confirmed" ? "outline" : "destructive"}>
            {booking.status === "confirmed" ? t("status.confirmed") : t("status.cancelled")}
          </Badge>
          <Badge variant="secondary">#{booking.id}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse text-right" : ""}`}>
              <Wallet className="h-5 w-5" />
              {t("detail.financialTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label={t("detail.originalAmount")} value={formatCurrency(originalAmount)} />
            <Row label={t("detail.discountAmount")} value={`-${formatCurrency(discountAmount)}`} valueClassName="text-green-600 dark:text-green-400" />
            <Row label={t("detail.finalAmount")} value={formatCurrency(finalAmount)} valueClassName="font-semibold" />
            <Row label={t("detail.amountDueNow")} value={formatCurrency(booking.amount_due_now)} />
            <Row label={t("detail.amountRemaining")} value={formatCurrency(booking.amount_remaining)} />
            <Row label={t("detail.paymentOption")} value={booking.payment_option ? t(`detail.paymentOptionValues.${booking.payment_option}`) : "-"} />
            <Row label={t("detail.depositPercentage")} value={`${booking.deposit_percentage_snapshot ?? 0}%`} />
            <Row label={t("detail.promoCode")} value={booking.promo_code_code || "-"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse text-right" : ""}`}>
              <BadgeDollarSign className="h-5 w-5" />
              {t("detail.paymentStatusTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full" onClick={() => handlePaymentStatus("pending")} disabled={booking.payment_status === "pending"}>
              {t("status.pending")}
            </Button>
            <Button variant="outline" className="w-full" onClick={() => handlePaymentStatus("paid")} disabled={booking.payment_status === "paid"}>
              {t("status.paid")}
            </Button>
            <Button variant="outline" className="w-full" onClick={() => handlePaymentStatus("refunded")} disabled={booking.payment_status === "refunded"}>
              {t("status.refunded")}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse text-right" : ""}`}>
              <User className="h-5 w-5" />
              {t("detail.customerTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label={t("detail.customerName")} value={booking.user_name} />
            <Row label={t("detail.customerPhone")} value={booking.user_phone} />
            <Row label={t("detail.customerNotes")} value={booking.notes || "-"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse text-right" : ""}`}>
              <MapPin className="h-5 w-5" />
              {t("detail.bookingInfoTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label={t("detail.branch")} value={branchName} />
            <Row label={t("detail.court")} value={courtName} />
            <Row label={t("detail.date")} value={formatDate(booking.date, "PPPP")} />
            <Row label={t("detail.time")} value={`${formatTime(booking.start_time)} - ${formatTime(booking.end_time)}`} />
            <Row label={t("detail.hours")} value={`${booking.hours ?? 0}${t("detail.hoursSuffix")}`} />
            <Row label={t("detail.createdAt")} value={formatDate(booking.created_at, "PPpp")} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse text-right" : ""}`}>
              <CalendarDays className="h-5 w-5" />
              {t("detail.screenshotTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentScreenshotViewer screenshotUrl={booking.payment_screenshot_url} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse text-right" : ""}`}>
              <FileText className="h-5 w-5" />
              {t("detail.adminNotesTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label htmlFor="admin-notes">{t("detail.adminNotesLabel")}</Label>
            <Textarea
              id="admin-notes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={8}
              className="text-start"
              placeholder={t("detail.adminNotesPlaceholder")}
            />
            <Button onClick={handleSaveNotes} disabled={savingNotes} className="gap-2">
              {savingNotes ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {t("detail.saveAdminNotes")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 border-b border-border/50 pb-2">
      <span className="text-muted-foreground text-xs sm:text-sm text-start">{label}</span>
      <span className={`w-full sm:w-auto text-start sm:text-end break-words ${valueClassName ?? ""}`.trim()}>{value}</span>
    </div>
  );
}
