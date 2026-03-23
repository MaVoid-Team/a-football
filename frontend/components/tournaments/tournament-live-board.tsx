"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useTournamentsAPI } from "@/hooks/api/use-tournaments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function TournamentLiveBoard({ id }: { id: string }) {
    const t = useTranslations("publicTournaments");
    const { tournament, matches, error, fetchTournament, fetchPublicMatches } = useTournamentsAPI();
    const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
    const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(10);

    useEffect(() => {
        if (!id) return;

        const refresh = () => {
            fetchTournament(id, false, { silent: true });
            fetchPublicMatches(id, { silent: true });
            setLastUpdatedAt(new Date());
        };

        refresh();
        const interval = setInterval(refresh, 10000);
        const countdown = setInterval(() => {
            setSecondsUntilRefresh((prev) => (prev <= 1 ? 10 : prev - 1));
        }, 1000);

        return () => {
            clearInterval(interval);
            clearInterval(countdown);
        };
    }, [id, fetchTournament, fetchPublicMatches]);

    const groupedByRound = useMemo(() => {
        const groups: Record<number, typeof matches> = {};
        matches.forEach((m) => {
            const round = Number(m.round_number);
            if (!groups[round]) groups[round] = [];
            groups[round].push(m);
        });
        return Object.entries(groups)
            .map(([round, roundMatches]) => ({ round: Number(round), matches: roundMatches }))
            .sort((a, b) => a.round - b.round);
    }, [matches]);

    const matchStatusLabel = (status?: string) => {
        const keyByStatus: Record<string, string> = {
            pending: "live.status.pending",
            scheduled: "live.status.scheduled",
            ongoing: "live.status.ongoing",
            completed: "live.status.completed",
        };

        if (!status || !keyByStatus[status]) return status || t("live.status.pending");
        return t(keyByStatus[status]);
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{tournament?.name || t("title")}</h1>
                    <p className="text-sm text-muted-foreground mt-2">
                        {t("live.lastUpdated")}: {lastUpdatedAt ? lastUpdatedAt.toLocaleTimeString() : t("live.never")}
                        <span className="ms-2">({t("live.nextRefresh", { seconds: secondsUntilRefresh })})</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{t("live.boardHint")}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => {
                        fetchTournament(id, false, { silent: true });
                        fetchPublicMatches(id, { silent: true });
                        setLastUpdatedAt(new Date());
                        setSecondsUntilRefresh(10);
                    }}>
                        {t("live.refreshNow")}
                    </Button>
                    <Button asChild variant="outline">
                        <Link href={`/tournament/${id}`}>{t("backToList")}</Link>
                    </Button>
                </div>
            </div>

            {error && (
                <Card className="border-destructive/30">
                    <CardContent className="pt-6 text-center text-destructive">{error}</CardContent>
                </Card>
            )}

            {groupedByRound.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center text-muted-foreground">{t("live.noMatches")}</CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {groupedByRound.map((group) => (
                        <Card key={`tv-round-${group.round}`}>
                            <CardHeader>
                                <CardTitle className="text-2xl">{t("roundLabel", { round: group.round })}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                    {group.matches.map((match) => (
                                        <div key={match.id} className="rounded-md border border-border p-4 flex items-center justify-between">
                                            <div className="text-lg font-semibold">
                                                {t("live.matchLine", { round: match.round_number, match: match.match_number })}
                                            </div>
                                            <Badge variant="outline" className="text-base px-3 py-1">{matchStatusLabel(match.status)}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
