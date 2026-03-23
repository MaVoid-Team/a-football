"use client";

import { useEffect, useState } from "react";
import { usePlayerAccountAPI } from "@/hooks/api/use-player-account";
import { PlayerParticipation } from "@/schemas/player.schema";
import { AccountShell } from "@/components/player/account-shell";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TournamentsPanel() {
    const { fetchTournaments } = usePlayerAccountAPI();
    const [items, setItems] = useState<PlayerParticipation[]>([]);

    useEffect(() => {
        fetchTournaments().then(setItems).catch(() => undefined);
    }, []);

    return (
        <AccountShell
            title="My Tournaments"
            description="Track every registration, approval, and tournament run from one place."
            backHref="/tournaments"
            backLabel="Back to Tournaments"
        >
            <div className="space-y-4">
                {items.length === 0 ? (
                    <Card><CardContent className="py-12 text-center text-muted-foreground">No tournament activity yet.</CardContent></Card>
                ) : items.map((item) => (
                    <Card key={`${item.registration_id}-${item.tournament_id}`}>
                        <CardHeader className="flex flex-row items-center justify-between gap-3">
                            <div>
                                <CardTitle className="text-xl">{item.tournament_name}</CardTitle>
                                <p className="text-sm text-muted-foreground">{item.branch_name || "Branch unavailable"}</p>
                            </div>
                            <Badge>{item.participation_status}</Badge>
                        </CardHeader>
                        <CardContent className="flex flex-wrap items-center justify-between gap-3 text-sm">
                            <div className="space-y-1">
                                <div>Type: {item.tournament_type}</div>
                                <div>Status: {item.tournament_status}</div>
                                {item.team_name && <div>Team: {item.team_name}</div>}
                            </div>
                            <Link href={`/tournament/${item.tournament_id}`} className="text-primary-text underline">
                                View Tournament
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </AccountShell>
    );
}
