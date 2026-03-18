"use client";

import { useEffect } from "react";
import { useEventsAPI } from "@/hooks/api/use-events";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format-currency";
import { formatDate } from "@/lib/format-date";
import { formatTime } from "@/lib/format-time";
import { ArrowLeft, ArrowRight, CalendarIcon, ClockIcon, MapPinIcon, UsersIcon, ShieldIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";

export function EventDetail({ id }: { id: string }) {
    const t = useTranslations("eventDetail");
    const { event, loading, error, fetchEvent } = useEventsAPI();

    useEffect(() => {
        if (id) {
            // pass isAdmin = false
            fetchEvent(id, false);
        }
    }, [fetchEvent, id]);

    if (error) {
        return (
            <div className="w-full text-center py-20">
                <p className="text-destructive mb-4">{t("errorLoading")}</p>
                <p className="text-muted-foreground">{error}</p>
                <Button asChild variant="outline" className="mt-4">
                    <Link href="/event">{t("backToEvents")}</Link>
                </Button>
            </div>
        );
    }

    if (loading || !event) {
        return (
            <div className="w-full max-w-4xl mx-auto space-y-8">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-3/4" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                    <div className="md:col-span-2 space-y-6">
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-48 w-full rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    const eventDate = new Date(event.start_date);
    const isUpcoming = eventDate > new Date();

    return (
        <div className="w-full max-w-5xl mx-auto">
            <Button asChild variant="link" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 p-0 h-auto gap-2 group">
                <Link href="/event">
                    <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
                    {t("backToAll")}
                </Link>
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <Badge variant="outline" className="px-3 py-1 font-semibold border-border/60">
                                {isUpcoming ? t("status.upcoming") : t("status.past")}
                            </Badge>
                            {!event.participation_price && (
                                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0 px-3 py-1">
                                    {t("status.freeEntry")}
                                </Badge>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                            {event.title}
                        </h1>
                    </div>

                    <div className="prose prose-lg dark:prose-invert max-w-none">
                        <p className="text-muted-foreground leading-relaxed text-lg">
                            {event.description || t("noDescription")}
                        </p>
                    </div>

                    <div className="space-y-4 pt-8 border-t border-border/50">
                        <h3 className="text-2xl font-bold">{t("guidelinesTitle")}</h3>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                t("guidelines.arriveEarly"),
                                t("guidelines.bringGear"),
                                t("guidelines.followReferee"),
                                t("guidelines.sportsmanship"),
                            ].map((rule, idx) => (
                                <li key={idx} className="flex items-start text-muted-foreground">
                                    <ShieldIcon className="w-5 h-5 text-primary-text mr-3 shrink-0 mt-0.5" />
                                    <span>{rule}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div>
                    <Card className="sticky top-32 overflow-hidden border-border/50">
                        <CardContent className="p-8">
                            <div className="space-y-6">
                                <div className="flex items-center">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary-text shrink-0 mr-4">
                                        <CalendarIcon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-0.5">{t("labels.date")}</p>
                                        <p className="text-base font-semibold">{formatDate(event.start_date)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary-text shrink-0 mr-4">
                                        <ClockIcon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-0.5">{t("labels.time")}</p>
                                        <p className="text-base font-semibold">{formatTime(event.start_date)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary-text shrink-0 mr-4">
                                        <UsersIcon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-0.5">{t("labels.capacity")}</p>
                                        <p className="text-base font-semibold">
                                            {event.max_participants ? t("capacityMax", { count: event.max_participants }) : t("unlimitedSpots")}
                                        </p>
                                        {event.remaining_spots !== undefined && event.max_participants !== null && (
                                            <p className="text-sm font-medium text-muted-foreground mt-0.5">
                                                {t("spotsRemaining", { count: Number(event.remaining_spots ?? 0) })}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-6 mt-6 border-t border-border/50">
                                    <div className="flex flex-col gap-1 mb-6">
                                        <span className="text-sm font-medium text-muted-foreground">{t("labels.participationPrice")}</span>
                                        <span className="text-4xl font-black tracking-tight">
                                            {event.participation_price ? formatCurrency(Number(event.participation_price)) : t("free")}
                                        </span>
                                    </div>

                                    {isUpcoming ? (
                                        event.max_participants && event.remaining_spots === 0 ? (
                                            <Button disabled size="lg" className="w-full text-base font-semibold">
                                                {t("actions.soldOut")}
                                            </Button>
                                        ) : event.whatsapp_redirect_link ? (
                                            <Button asChild size="lg" className="w-full text-base font-semibold transition-all group">
                                                <a href={event.whatsapp_redirect_link} target="_blank" rel="noopener noreferrer">
                                                    {t("actions.signUpWhatsapp")}
                                                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                                                </a>
                                            </Button>
                                        ) : (
                                            <Button asChild size="lg" className="w-full text-base font-semibold transition-all group">
                                                <Link href={`/book?event_id=${event.id}`}>
                                                    {t("actions.signUpNow")}
                                                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                                                </Link>
                                            </Button>
                                        )
                                    ) : (
                                        <Button disabled size="lg" className="w-full text-base font-semibold">
                                            {t("actions.eventEnded")}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
