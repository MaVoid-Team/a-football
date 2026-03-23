"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useTournamentsAPI } from "@/hooks/api/use-tournaments";
import { useBranchesAPI } from "@/hooks/api/use-branches";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format-date";

export function TournamentsView() {
    const t = useTranslations("publicTournaments");
    const { tournaments, loading, error, fetchPublicTournaments } = useTournamentsAPI();
    const { branches, fetchPublicBranches } = useBranchesAPI();
    const [selectedBranch, setSelectedBranch] = useState<string>("all");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");

    useEffect(() => {
        fetchPublicBranches();
    }, [fetchPublicBranches]);

    useEffect(() => {
        fetchPublicTournaments({
            ...(selectedBranch !== "all" ? { branch_id: Number(selectedBranch) } : {}),
            ...(selectedStatus !== "all" ? { status: selectedStatus } : {}),
        });
    }, [fetchPublicTournaments, selectedBranch, selectedStatus]);

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8">
            <div className="space-y-2 text-center">
                <h1 className="text-4xl font-bold tracking-tight">{t("title")}</h1>
                <p className="text-muted-foreground text-lg">{t("subtitle")}</p>
                <p className="text-sm text-muted-foreground">{t("listHint")}</p>
            </div>

            <div className="flex flex-col md:flex-row justify-center gap-3">
                {branches.length > 1 && (
                    <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                        <SelectTrigger className="w-[260px]">
                            <SelectValue placeholder={t("allBranches")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("allBranches")}</SelectItem>
                            {branches.filter((b) => b.active).map((branch) => (
                                <SelectItem key={branch.id} value={branch.id}>
                                    {branch.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder={t("statusLabel")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="open">{t("status.open")}</SelectItem>
                        <SelectItem value="ongoing">{t("status.ongoing")}</SelectItem>
                        <SelectItem value="completed">{t("status.completed")}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {error && (
                <Card className="border-destructive/30">
                    <CardContent className="pt-6 text-center text-destructive">{error}</CardContent>
                </Card>
            )}

            {loading && tournaments.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, idx) => (
                        <Card key={idx}>
                            <CardHeader>
                                <Skeleton className="h-6 w-2/3" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : tournaments.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">{t("empty")}</CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {tournaments.map((tour) => (
                        <Card key={tour.id} className="flex flex-col">
                            <CardHeader>
                                <div className="flex items-center justify-between gap-2">
                                    <CardTitle className="line-clamp-1">{tour.name}</CardTitle>
                                    <Badge variant="outline">{t(`status.${tour.status}`)}</Badge>
                                </div>
                                <CardDescription>{t(`type.${tour.tournament_type}`)}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 flex-1">
                                <p className="text-sm text-muted-foreground line-clamp-3">{tour.description || t("noDescription")}</p>
                                <div className="text-sm space-y-1">
                                    <div>{t("startDate")}: {formatDate(tour.start_date)}</div>
                                    <div>{t("deadline")}: {formatDate(tour.registration_deadline)}</div>
                                    <div>{t("participants")}: {tour.approved_registrations_count ?? 0}/{tour.capacity_total ?? tour.max_players ?? "-"}</div>
                                    {typeof tour.capacity_remaining === "number" && (
                                        <div>Available Slots: {tour.capacity_remaining}</div>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs">
                                    <Badge variant={tour.registration_open ? "default" : "secondary"}>
                                        {tour.registration_open ? t("registrationState.open") : t("registrationState.closed")}
                                    </Badge>
                                    <Badge variant="outline">{t(`status.${tour.status}`)}</Badge>
                                </div>
                                <Button asChild className="w-full mt-2">
                                    <Link href={`/tournament/${tour.id}`}>{t("viewDetails")}</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
