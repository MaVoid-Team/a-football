"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useTournamentsAPI } from "@/hooks/api/use-tournaments";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { formatDate } from "@/lib/format-date";

export function TournamentDetail({ id }: { id: string }) {
    const t = useTranslations("publicTournaments");
    const { tournament, matches, loading, error, fetchTournament, registerTournament, fetchBracket, fetchPublicMatches } = useTournamentsAPI();
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [skillLevel, setSkillLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
    const [bracket, setBracket] = useState<any>(null);
    const [liveMode, setLiveMode] = useState(false);
    const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
    const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(20);

    const refreshLiveData = (silent = true) => {
        fetchTournament(id, false, { silent });
        fetchBracket(id, false, { silent }).then((res) => {
            if (res.success) setBracket(res.data);
        });
        fetchPublicMatches(id, { silent });
        setLastUpdatedAt(new Date());
    };

    useEffect(() => {
        if (!id) return;
        fetchTournament(id, false);
        fetchBracket(id, false).then((res) => {
            if (res.success) setBracket(res.data);
        });
        fetchPublicMatches(id);
        setLastUpdatedAt(new Date());
    }, [id, fetchTournament, fetchBracket, fetchPublicMatches]);

    useEffect(() => {
        if (!id || !liveMode) return;

        const interval = setInterval(() => {
            refreshLiveData(true);
            setSecondsUntilRefresh(20);
        }, 20000);

        const countdown = setInterval(() => {
            setSecondsUntilRefresh((prev) => (prev <= 1 ? 20 : prev - 1));
        }, 1000);

        return () => {
            clearInterval(interval);
            clearInterval(countdown);
        };
    }, [id, liveMode]);

    const onRegister = async () => {
        if (!name.trim() || !phone.trim()) {
            toast.error(t("registration.required"));
            return;
        }

        const result = await registerTournament(id, {
            name: name.trim(),
            phone: phone.trim(),
            skill_level: skillLevel,
        });

        if (result.success) {
            toast.success(t("registration.success"));
            setName("");
            setPhone("");
            fetchTournament(id, false);
        } else {
            toast.error(result.errorMessage || t("registration.failed"));
        }
    };

    if (loading && !tournament) {
        return <div className="py-16 text-center text-muted-foreground">{t("loading")}</div>;
    }

    if (!tournament) {
        return (
            <div className="py-16 text-center space-y-4">
                <p className="text-muted-foreground">{error || t("notFound")}</p>
                <Button asChild variant="outline">
                    <Link href="/tournament">{t("backToList")}</Link>
                </Button>
            </div>
        );
    }

    const rounds = Array.isArray(bracket?.rounds) ? bracket.rounds : [];
    const registrationOpen = !!tournament.registration_open;

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
        <div className="w-full max-w-5xl mx-auto space-y-6">
            <Button asChild variant="ghost" className="px-0">
                <Link href="/tournament">{t("backToList")}</Link>
            </Button>

            <div className="rounded-md border border-border/70 bg-muted/30 px-4 py-3 space-y-2">
                <p className="text-sm font-semibold">{t("logic.title")}</p>
                <ul className="list-disc ps-5 text-xs text-muted-foreground space-y-1">
                    <li>{t("logic.step1")}</li>
                    <li>{t("logic.step2")}</li>
                    <li>{t("logic.step3")}</li>
                </ul>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3">
                <div className="text-sm text-muted-foreground">
                    {t("live.lastUpdated")}: {lastUpdatedAt ? lastUpdatedAt.toLocaleTimeString() : t("live.never")}
                    {liveMode && <span className="ms-2">({t("live.nextRefresh", { seconds: secondsUntilRefresh })})</span>}
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={liveMode ? "default" : "secondary"}>
                        {liveMode ? t("live.modeOn") : t("live.modeOff")}
                    </Badge>
                    <Button variant="outline" onClick={() => refreshLiveData(false)}>
                        {t("live.refreshNow")}
                    </Button>
                    <Button variant={liveMode ? "default" : "outline"} onClick={() => setLiveMode((v) => !v)}>
                        {liveMode ? t("live.stop") : t("live.start")}
                    </Button>
                    <Button asChild variant="outline">
                        <Link href={`/tournament/${id}/live`}>{t("live.tvMode")}</Link>
                    </Button>
                </div>
            </div>

            {error && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl">{tournament.name}</CardTitle>
                    <p className="text-muted-foreground">{tournament.description || t("noDescription")}</p>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>{t("typeLabel")}: {t(`type.${tournament.tournament_type}`)}</div>
                    <div>{t("statusLabel")}: {t(`status.${tournament.status}`)}</div>
                    <div>{t("startDate")}: {formatDate(tournament.start_date)}</div>
                    <div>{t("deadline")}: {formatDate(tournament.registration_deadline)}</div>
                    <div>{t("participants")}: {tournament.approved_registrations_count ?? 0}/{tournament.max_players ?? "-"}</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t("registration.title")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                        {registrationOpen ? t("registration.openHint") : t("registration.closedHint")}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label>{t("registration.name")}</Label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label>{t("registration.phone")}</Label>
                            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label>{t("registration.skill")}</Label>
                        <Select value={skillLevel} onValueChange={(v: any) => setSkillLevel(v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="beginner">{t("skill.beginner")}</SelectItem>
                                <SelectItem value="intermediate">{t("skill.intermediate")}</SelectItem>
                                <SelectItem value="advanced">{t("skill.advanced")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={onRegister} disabled={!tournament.registration_open}>
                        {tournament.registration_open ? t("registration.submit") : t("registration.closed")}
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t("bracketTitle")}</CardTitle>
                </CardHeader>
                <CardContent>
                    {rounds.length === 0 ? (
                        <p className="text-muted-foreground">{t("bracketEmpty")}</p>
                    ) : (
                        <div className="space-y-4">
                            {rounds.map((round: any) => (
                                <div key={`round-${round.round_number}`} className="space-y-2">
                                    <h4 className="font-semibold">{t("roundLabel", { round: round.round_number })}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {(round.matches || []).map((match: any) => (
                                            <div key={`match-${round.round_number}-${match.match_number}`} className="rounded-md border border-border p-3 text-sm">
                                                <div>{t("matchLabel", { match: match.match_number })}</div>
                                                <div className="text-muted-foreground">{t("statusLabel")}: {matchStatusLabel(match.status)}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t("live.matchesTitle")}</CardTitle>
                </CardHeader>
                <CardContent>
                    {matches.length === 0 ? (
                        <p className="text-muted-foreground">{t("live.noMatches")}</p>
                    ) : (
                        <div className="space-y-2">
                            {matches.map((match) => (
                                <div key={match.id} className="rounded-md border border-border p-3 text-sm flex items-center justify-between gap-3">
                                    <div>{t("live.matchLine", { round: match.round_number, match: match.match_number })}</div>
                                    <Badge variant="outline">{matchStatusLabel(match.status)}</Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
