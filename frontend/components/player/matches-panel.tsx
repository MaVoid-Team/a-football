"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { usePlayerAccountAPI } from "@/hooks/api/use-player-account";
import { TournamentMatch } from "@/schemas/tournament.schema";
import { AccountShell } from "@/components/player/account-shell";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MatchesPanel() {
    const t = useTranslations("playerAccount.matchesPanel");
    const { fetchMatches } = usePlayerAccountAPI();
    const [matches, setMatches] = useState<TournamentMatch[]>([]);

    useEffect(() => {
        fetchMatches().then(setMatches).catch(() => undefined);
    }, []);

    const { upcoming, past } = useMemo(() => {
        const now = Date.now();
        const upcomingMatches = matches.filter((match) => !match.scheduled_time || new Date(match.scheduled_time).getTime() >= now || match.status !== "completed");
        const pastMatches = matches.filter((match) => match.status === "completed" || (match.scheduled_time && new Date(match.scheduled_time).getTime() < now));
        return { upcoming: upcomingMatches, past: pastMatches };
    }, [matches]);

    const renderMatches = (items: TournamentMatch[], emptyKey: string) => (
        items.length === 0 ? (
            <Card><CardContent className="py-10 text-center text-muted-foreground">{t(emptyKey as any)}</CardContent></Card>
        ) : (
            <div className="space-y-4">
                {items.map((match) => (
                    <Card key={match.id}>
                        <CardHeader className="flex flex-row items-center justify-between gap-3">
                            <div>
                                <CardTitle className="text-lg">{match.tournament_name || t("tournamentMatch")}</CardTitle>
                                <p className="text-sm text-muted-foreground">{match.team1_name || t("tbd")} {t("vs")} {match.team2_name || t("tbd")}</p>
                            </div>
                            <Badge variant="outline">{match.status}</Badge>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div>{t("court")}: {match.court_name || t("unassigned")}</div>
                            <div>{t("scheduledTime")}: {match.scheduled_time ? new Date(match.scheduled_time).toLocaleString() : t("notScheduled")}</div>
                            {match.score && Object.keys(match.score).length > 0 && (
                                <div>{t("score")}: {JSON.stringify(match.score)}</div>
                            )}
                            <Link href={`/tournament/${match.tournament_id}/live`} className="text-primary-text underline">
                                {t("openLiveBracket")}
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    );

    return (
        <AccountShell
            title={t("title")}
            description={t("description")}
            backHref="/account/tournaments"
            backLabel={t("backToTournaments")}
        >
            <div className="space-y-6">
                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">{t("upcoming")}</h2>
                    {renderMatches(upcoming, "noUpcoming")}
                </section>
                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">{t("past")}</h2>
                    {renderMatches(past, "noPast")}
                </section>
            </div>
        </AccountShell>
    );
}
