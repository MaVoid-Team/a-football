"use client";

import { useEffect, useState } from "react";
import { useEventsAPI } from "@/hooks/api/use-events";
import { useBranchesAPI } from "@/hooks/api/use-branches";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/format-currency";
import { formatDate } from "@/lib/format-date";
import { CalendarIcon, UsersIcon, ArrowRight, MapPinIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";

export function EventsView() {
    const t = useTranslations("publicEvents");
    const { events, loading, error, fetchPublicEvents } = useEventsAPI();
    const { branches, fetchPublicBranches } = useBranchesAPI();
    const [selectedBranch, setSelectedBranch] = useState<string>("all");

    useEffect(() => {
        fetchPublicBranches();
    }, [fetchPublicBranches]);

    useEffect(() => {
        if (selectedBranch === "all") {
            fetchPublicEvents();
        } else {
            fetchPublicEvents({ branch_id: Number(selectedBranch) });
        }
    }, [fetchPublicEvents, selectedBranch]);

    if (error) {
        return (
            <div className="w-full text-center py-20">
                <p className="text-destructive mb-4">{t("errorLoading")}</p>
                <p className="text-muted-foreground">{error}</p>
                <Button variant="outline" className="mt-4" onClick={() => {
                    if (selectedBranch === "all") {
                        fetchPublicEvents();
                    } else {
                        fetchPublicEvents({ branch_id: Number(selectedBranch) });
                    }
                }}>
                    {t("tryAgain")}
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto">
            <div className="flex flex-col items-center text-center space-y-4 mb-12">
                <Badge variant="secondary" className="px-3 py-1 font-medium bg-primary/10 text-primary-text border-primary/20">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {t("badge")}
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{t("title")}</h1>
                <p className="text-muted-foreground max-w-[600px] text-lg">
                    {t("subtitle")}
                </p>
            </div>

            {branches.length > 1 && (
                <div className="flex items-center justify-center gap-3 mb-10">
                    <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{t("filterByBranch")}</span>
                    <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder={t("allBranches")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("allBranches")}</SelectItem>
                            {branches.filter(b => b.active).map((branch) => (
                                <SelectItem key={branch.id} value={branch.id}>
                                    {branch.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {loading && events.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="flex flex-col h-full bg-card/60">
                            <CardHeader>
                                <Skeleton className="h-8 w-2/3 mb-2" />
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-4/5" />
                            </CardContent>
                            <CardFooter>
                                <Skeleton className="h-10 w-full" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : events.length === 0 ? (
                <Card className="text-center py-24 bg-card/50 shadow-none border-dashed border-border/60">
                    <CardContent>
                        <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-xl font-bold mb-2">{t("emptyTitle")}</h3>
                        <p className="text-muted-foreground">{t("emptyDescription")}</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map((event) => {
                        const isUpcoming = new Date(event.start_date) > new Date();
                        return (
                            <Card key={event.id} className="group relative flex flex-col h-full bg-card/60 backdrop-blur-sm overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                                <CardHeader>
                                    <div className="flex justify-between items-start gap-4 mb-2">
                                        <Badge variant="secondary" className="font-semibold px-3 py-1">
                                            {formatDate(event.start_date)}
                                        </Badge>
                                        {isUpcoming && (
                                            <Badge className="bg-primary/20 text-primary-text border-0">
                                                {t("upcoming")}
                                            </Badge>
                                        )}
                                    </div>
                                    <CardTitle className="text-2xl mt-4 line-clamp-2 leading-tight">
                                        {event.title}
                                    </CardTitle>
                                    {event.description && (
                                        <CardDescription className="text-base mt-2 line-clamp-3">
                                            {event.description}
                                        </CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-end gap-3 mt-4">
                                    <div className="flex items-center text-sm font-medium text-muted-foreground">
                                        <UsersIcon className="w-5 h-5 mr-3 opacity-70" />
                                        {event.max_participants ? (
                                            t("spots", {
                                                current: Number(event.remaining_spots ?? event.max_participants),
                                                max: Number(event.max_participants),
                                            })
                                        ) : t("unlimitedSpots")}
                                    </div>
                                    <div className="flex items-center text-sm font-medium text-foreground">
                                        <div className="flex -space-x-1 mr-3 h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary-text p-1 font-bold text-[10px] leading-none">
                                            $
                                        </div>
                                        <span className="text-lg font-bold">
                                            {event.participation_price ? formatCurrency(Number(event.participation_price)) : t("free")}
                                        </span>
                                    </div>
                                </CardContent>
                                <CardFooter className="gap-3 z-10">
                                    <Button asChild variant="outline" size="lg" className="w-[45%]">
                                        <Link href={`/event/${event.id}`}>
                                            {t("details")}
                                        </Link>
                                    </Button>
                                    {event.max_participants && event.remaining_spots === 0 ? (
                                        <Button disabled size="lg" className="flex-1">
                                            {t("soldOut")}
                                        </Button>
                                    ) : event.whatsapp_redirect_link ? (
                                        <Button asChild size="lg" className="flex-1 group">
                                            <a href={event.whatsapp_redirect_link} target="_blank" rel="noopener noreferrer">
                                                {t("signUp")}
                                                <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
                                            </a>
                                        </Button>
                                    ) : (
                                        <Button asChild size="lg" className="flex-1 group">
                                            <Link href={`/book?event_id=${event.id}`}>
                                                {t("signUp")}
                                                <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
                                            </Link>
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
