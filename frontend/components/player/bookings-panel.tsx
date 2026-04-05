"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { usePlayerAccountAPI } from "@/hooks/api/use-player-account";
import { Booking } from "@/schemas/booking.schema";
import { AccountShell } from "@/components/player/account-shell";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format-currency";

export function BookingsPanel() {
    const t = useTranslations("playerAccount.bookingsPanel");
    const { fetchBookings, error } = usePlayerAccountAPI();
    const [bookings, setBookings] = useState<Booking[]>([]);

    useEffect(() => {
        fetchBookings().then(setBookings).catch(() => undefined);
    }, []);

    return (
        <AccountShell
            title={t("title")}
            description={t("description")}
            backHref="/book"
            backLabel={t("backToBooking")}
        >
            <div className="space-y-4">
                {error && (
                    <Card><CardContent className="py-6 text-center text-destructive">{error}</CardContent></Card>
                )}
                {!error && bookings.length === 0 ? (
                    <Card><CardContent className="py-12 text-center text-muted-foreground">{t("noBookings")}</CardContent></Card>
                ) : bookings.map((booking) => (
                    <Card key={booking.id}>
                        <CardHeader className="flex flex-row items-center justify-between gap-3">
                            <div>
                                <CardTitle className="text-lg">{booking.branch_name || t("branch")}</CardTitle>
                                <p className="text-sm text-muted-foreground">{booking.court_name || t("court")} · {booking.date}</p>
                            </div>
                            <div className="flex gap-2">
                                <Badge variant="outline">{booking.status}</Badge>
                                {booking.payment_status && <Badge>{booking.payment_status}</Badge>}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div>{t("time")}: {booking.start_time} - {booking.end_time}</div>
                            <div>{t("total")}: {booking.total_price ? formatCurrency(Number(booking.total_price)) : "-"}</div>
                            <Link href="/book" className="text-primary-text underline">
                                {t("bookAnother")}
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </AccountShell>
    );
}
