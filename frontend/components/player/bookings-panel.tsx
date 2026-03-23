"use client";

import { useEffect, useState } from "react";
import { usePlayerAccountAPI } from "@/hooks/api/use-player-account";
import { Booking } from "@/schemas/booking.schema";
import { AccountShell } from "@/components/player/account-shell";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format-currency";

export function BookingsPanel() {
    const { fetchBookings, error } = usePlayerAccountAPI();
    const [bookings, setBookings] = useState<Booking[]>([]);

    useEffect(() => {
        fetchBookings().then(setBookings).catch(() => undefined);
    }, []);

    return (
        <AccountShell
            title="My Bookings"
            description="Your confirmed and cancelled court reservations live here."
            backHref="/book"
            backLabel="Back to Booking"
        >
            <div className="space-y-4">
                {error && (
                    <Card><CardContent className="py-6 text-center text-destructive">{error}</CardContent></Card>
                )}
                {!error && bookings.length === 0 ? (
                    <Card><CardContent className="py-12 text-center text-muted-foreground">No bookings yet.</CardContent></Card>
                ) : bookings.map((booking) => (
                    <Card key={booking.id}>
                        <CardHeader className="flex flex-row items-center justify-between gap-3">
                            <div>
                                <CardTitle className="text-lg">{booking.branch_name || "Branch"}</CardTitle>
                                <p className="text-sm text-muted-foreground">{booking.court_name || "Court"} · {booking.date}</p>
                            </div>
                            <div className="flex gap-2">
                                <Badge variant="outline">{booking.status}</Badge>
                                {booking.payment_status && <Badge>{booking.payment_status}</Badge>}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div>Time: {booking.start_time} - {booking.end_time}</div>
                            <div>Total: {booking.total_price ? formatCurrency(Number(booking.total_price)) : "-"}</div>
                            <Link href="/book" className="text-primary-text underline">
                                Book Another Court
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </AccountShell>
    );
}
