"use client";

import { useEffect, useMemo, useState } from "react";
import { usePlayerAccountAPI } from "@/hooks/api/use-player-account";
import { TournamentMatch } from "@/schemas/tournament.schema";
import { AccountShell } from "@/components/player/account-shell";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MatchesPanel() {
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

    const renderMatches = (items: TournamentMatch[], empty: string) => (
        items.length === 0 ? (
            <Card><CardContent className="py-10 text-center text-muted-foreground">{empty}</CardContent></Card>
        ) : (
            <div className="space-y-4">
                {items.map((match) => (
                    <Card key={match.id}>
                        <CardHeader className="flex flex-row items-center justify-between gap-3">
                            <div>
                                <CardTitle className="text-lg">{match.tournament_name || "Tournament Match"}</CardTitle>
                                <p className="text-sm text-muted-foreground">{match.team1_name || "TBD"} vs {match.team2_name || "TBD"}</p>
                            </div>
                            <Badge variant="outline">{match.status}</Badge>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div>Court: {match.court_name || "Unassigned"}</div>
                            <div>Time: {match.scheduled_time ? new Date(match.scheduled_time).toLocaleString() : "Not scheduled yet"}</div>
                            {match.score && Object.keys(match.score).length > 0 && (
                                <div>Score: {JSON.stringify(match.score)}</div>
                            )}
                            <Link href={`/tournament/${match.tournament_id}/live`} className="text-primary-text underline">
                                Open Live Bracket
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    );

    return (
        <AccountShell
            title="My Matches"
            description="See upcoming fixtures and revisit completed results."
            backHref="/account/tournaments"
            backLabel="Back to My Tournaments"
        >
            <div className="space-y-6">
                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">Upcoming</h2>
                    {renderMatches(upcoming, "No upcoming matches yet.")}
                </section>
                <section className="space-y-3">
                    <h2 className="text-xl font-semibold">Past</h2>
                    {renderMatches(past, "No completed matches yet.")}
                </section>
            </div>
        </AccountShell>
    );
}
