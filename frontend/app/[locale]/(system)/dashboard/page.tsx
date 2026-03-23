"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAuthContext } from "@/contexts/auth-context";
import { useStatisticsAPI } from "@/hooks/api/use-statistics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Banknote, CalendarCheck, TrendingUp, HandCoins } from "lucide-react";
import { formatCurrency } from "@/lib/format-currency";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
    const t = useTranslations("dashboard");
    const { admin } = useAuthContext();
    const { statistics, loading, fetchStatistics } = useStatisticsAPI();

    useEffect(() => {
        fetchStatistics({ days: 30 }); // Default to last 30 days
    }, [fetchStatistics]);

    const adminName = admin?.email?.split("@")[0] || t("defaultAdminName");
    const scope = admin?.role === "super_admin" ? t("scopeAllBranches") : t("scopeYourBranch");

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {t("welcomeBack", { name: adminName })}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    {t("happeningRecently", { scope })}
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t("cards.collectedNow30d")}</CardTitle>
                        <Banknote className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-[100px]" /> : (
                            <>
                                <div className="text-2xl font-bold">{formatCurrency(statistics?.collected_due_now || "0")}</div>
                                <p className="text-xs text-muted-foreground pt-1">{t("cards.amountDueAtBooking")}</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t("cards.confirmedBookings30d")}</CardTitle>
                        <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-[60px]" /> : (
                            <>
                                <div className="text-2xl font-bold">{statistics?.total_confirmed_bookings || 0}</div>
                                <p className="text-xs text-muted-foreground pt-1">{t("cards.bookingsDeltaVsLastMonth")}</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t("cards.globalOccupancy")}</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-[60px]" /> : (
                            <>
                                <div className="text-2xl font-bold">{statistics?.occupancy_rate_percent.toFixed(1) || 0}%</div>
                                <p className="text-xs text-muted-foreground pt-1">{t("cards.capacityFilled")}</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t("cards.averageOrderValue")}</CardTitle>
                        <HandCoins className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-[80px]" /> : (
                            <>
                                <div className="text-2xl font-bold">
                                    {formatCurrency(
                                        statistics?.total_confirmed_bookings
                                            ? Number(statistics.collected_due_now) / statistics.total_confirmed_bookings
                                            : 0
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground pt-1">{t("cards.perBookingCollected")}</p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">{t("cards.totalRevenue30d")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-[100px]" /> : (
                            <div className="text-2xl font-bold">{formatCurrency(statistics?.total_revenue || "0")}</div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">{t("cards.outstandingBalance")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-[100px]" /> : (
                            <div className="text-2xl font-bold">{formatCurrency(statistics?.outstanding_balance || "0")}</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>{t("utilization.title")}</CardTitle>
                        <CardDescription>{t("utilization.description")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-[200px] w-full" /> : (
                            <div className="space-y-4">
                                {statistics?.bookings_per_court?.map(bc => (
                                    <div key={bc.court_id} className="flex items-center">
                                        <div className="w-[120px] text-sm font-medium">{bc.court_name}</div>
                                        <div className="flex-1 flex items-center pr-4">
                                            <div className="bg-primary/20 h-2 rounded-full overflow-hidden w-full relative">
                                                <div
                                                    className="bg-primary h-full absolute left-0 top-0"
                                                    style={{
                                                        width: `${statistics.total_confirmed_bookings ? (bc.bookings_count / statistics.total_confirmed_bookings) * 100 : 0}%`
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="w-[80px] text-right font-medium text-sm">
                                            {bc.bookings_count} {t("utilization.bookingUnit")}
                                        </div>
                                    </div>
                                ))}

                                {(!statistics?.bookings_per_court || statistics.bookings_per_court.length === 0) && (
                                    <div className="text-center text-muted-foreground py-8">{t("utilization.emptyState")}</div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>{t("recentActivity.title")}</CardTitle>
                        <CardDescription>{t("recentActivity.description")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Placeholder for future activity stream */}
                        <div className="space-y-4 border-l-2 border-primary/20 pl-4 py-2">
                            <div className="relative">
                                <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-primary" />
                                <p className="text-sm font-medium">{t("recentActivity.highDemandOnCourt", { court: t("recentActivity.sampleCourtName") })}</p>
                                <p className="text-xs text-muted-foreground">{t("recentActivity.createPremiumPackage")}</p>
                            </div>
                            <div className="relative">
                                <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-muted-foreground" />
                                <p className="text-sm font-medium">{t("recentActivity.newAdminOnboarded")}</p>
                                <p className="text-xs text-muted-foreground">{t("recentActivity.userJoinedAgo", { email: "john@courts.com", time: t("recentActivity.sampleTimeAgo") })}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
