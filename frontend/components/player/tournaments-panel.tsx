"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { usePlayerAccountAPI } from "@/hooks/api/use-player-account";
import { PlayerParticipation } from "@/schemas/player.schema";
import { AccountShell } from "@/components/player/account-shell";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TournamentsPanel() {
    const t = useTranslations("playerAccount.tournamentsPanel");
    const { fetchTournaments } = usePlayerAccountAPI();
    const [items, setItems] = useState<PlayerParticipation[]>([]);

    useEffect(() => {
        fetchTournaments().then(setItems).catch(() => undefined);
    }, []);

    return (
        <AccountShell
            title={t("title")}
            description={t("description")}
            backHref="/tournaments"
            backLabel={t("backToTournaments")}
        >
            <div className="space-y-4">
                {items.length === 0 ? (
                    <Card><CardContent className="py-12 text-center text-muted-foreground">{t("noActivity")}</CardContent></Card>
                ) : items.map((item) => (
                    <Card key={`${item.registration_id}-${item.tournament_id}`}>
                        <CardHeader className="flex flex-row items-center justify-between gap-3">
                            <div>
                                <CardTitle className="text-xl">{item.tournament_name}</CardTitle>
                                <p className="text-sm text-muted-foreground">{item.branch_name || t("branchUnavailable")}</p>
                            </div>
                            <Badge>{item.participation_status}</Badge>
                        </CardHeader>
                        <CardContent className="flex flex-wrap items-center justify-between gap-3 text-sm">
                            <div className="space-y-1">
                                <div>{t("type")}: {item.tournament_type}</div>
                                <div>{t("status")}: {item.tournament_status}</div>
                                {item.team_name && <div>{t("team")}: {item.team_name}</div>}
                            </div>
                            <Link href={`/tournament/${item.tournament_id}`} className="text-primary-text underline">
                                {t("viewTournament")}
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </AccountShell>
    );
}
