"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useTournamentsAPI } from "@/hooks/api/use-tournaments";
import { useBranchesAPI } from "@/hooks/api/use-branches";
import { useCourtsAPI } from "@/hooks/api/use-courts";
import type { TournamentMatch } from "@/schemas/tournament.schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format-date";

export default function AdminTournamentsPage() {
    const t = useTranslations("tournaments");
    const [branchId, setBranchId] = useState<string>("all");
    const [name, setName] = useState("");
    const [type, setType] = useState<"knockout" | "round_robin" | "group_knockout">("knockout");
    const [startDate, setStartDate] = useState("");
    const [deadline, setDeadline] = useState("");
    const [maxPlayers, setMaxPlayers] = useState("16");
    const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");
    const [autoStartTime, setAutoStartTime] = useState("");
    const [autoOverrideLocked, setAutoOverrideLocked] = useState(false);
    const [selectedCourtIds, setSelectedCourtIds] = useState<number[]>([]);
    const [matchStatusFilter, setMatchStatusFilter] = useState<string>("all");
    const [matchRoundFilter, setMatchRoundFilter] = useState<string>("all");
    const [bracket, setBracket] = useState<any>(null);
    const [teamDirectory, setTeamDirectory] = useState<Record<number, string>>({});

    const [rowCourtByMatch, setRowCourtByMatch] = useState<Record<string, string>>({});
    const [rowTimeByMatch, setRowTimeByMatch] = useState<Record<string, string>>({});
    const [rowOverrideByMatch, setRowOverrideByMatch] = useState<Record<string, boolean>>({});
    const [rowLockReasonByMatch, setRowLockReasonByMatch] = useState<Record<string, string>>({});

    const { branches, fetchBranches } = useBranchesAPI();
    const { courts, fetchCourts } = useCourtsAPI();
    const {
        tournaments,
        matches,
        loading,
        error,
        fetchAdminTournaments,
        createTournament,
        generateBracket,
        fetchBracket,
        fetchAdminMatches,
        autoScheduleTournament,
        scheduleMatch,
        lockMatch,
    } = useTournamentsAPI();

    useEffect(() => {
        fetchBranches();
    }, [fetchBranches]);

    useEffect(() => {
        const params: any = {};
        if (branchId !== "all") params.branch_id = Number(branchId);
        fetchAdminTournaments(params);
        if (branchId !== "all") {
            fetchCourts({ branch_id: Number(branchId) });
        }
    }, [branchId, fetchAdminTournaments, fetchCourts]);

    useEffect(() => {
        if (!selectedTournamentId) return;
        const params: { status?: string; round_number?: number } = {};
        if (matchStatusFilter !== "all") params.status = matchStatusFilter;
        if (matchRoundFilter !== "all") params.round_number = Number(matchRoundFilter);
        fetchAdminMatches(selectedTournamentId, params);
        fetchBracket(selectedTournamentId, true, { silent: true }).then((res) => {
            if (res.success) setBracket(res.data);
        });
    }, [selectedTournamentId, fetchAdminMatches, fetchBracket, matchStatusFilter, matchRoundFilter]);

    useEffect(() => {
        if (!selectedTournamentId) {
            setTeamDirectory({});
            return;
        }

        fetchAdminMatches(selectedTournamentId, undefined, { silent: true, setState: false }).then((res) => {
            if (!res.success) return;

            const allMatches: TournamentMatch[] = Array.isArray(res.data) ? res.data : [];
            const directory = allMatches.reduce((acc: Record<number, string>, match: TournamentMatch) => {
                if (match.team1_id && match.team1_name) acc[match.team1_id] = match.team1_name;
                if (match.team2_id && match.team2_name) acc[match.team2_id] = match.team2_name;
                if (match.winner_id && match.winner_name) acc[match.winner_id] = match.winner_name;
                return acc;
            }, {});

            setTeamDirectory(directory);
        });
    }, [selectedTournamentId, fetchAdminMatches]);

    const schedulingErrorMessage = (codes?: string[]) => {
        const code = codes?.[0];
        if (!code) return null;
        const keys: Record<string, string> = {
            invalid_time: "admin.scheduler.errors.invalid_time",
            invalid_court: "admin.scheduler.errors.invalid_court",
            blocked_slot: "admin.scheduler.errors.blocked_slot",
            court_conflict: "admin.scheduler.errors.court_conflict",
            team_back_to_back: "admin.scheduler.errors.team_back_to_back",
            locked_match: "admin.scheduler.errors.locked_match",
            unable_to_schedule: "admin.scheduler.errors.unable_to_schedule",
            missing_courts: "admin.scheduler.errors.missing_courts",
            invalid_start_time: "admin.scheduler.errors.invalid_start_time",
            override_not_allowed: "admin.scheduler.errors.override_not_allowed",
        };

        if (!keys[code]) return null;
        return t(keys[code]);
    };

    const onCreate = async () => {
        if (branchId === "all") {
            toast.error(t("admin.selectBranchFirst"));
            return;
        }

        const result = await createTournament({
            branch_id: Number(branchId),
            name,
            tournament_type: type,
            start_date: startDate,
            registration_deadline: deadline,
            max_players: Number(maxPlayers),
            match_duration_minutes: 60,
        });

        if (result.success) {
            toast.success(t("admin.created"));
            setName("");
            fetchAdminTournaments({ branch_id: Number(branchId) });
        } else {
            toast.error(result.errorMessage || t("admin.createFailed"));
        }
    };

    const onGenerateBracket = async (id: string) => {
        const result = await generateBracket(id);
        if (result.success) {
            toast.success(t("admin.bracketGenerated"));
            fetchAdminTournaments(branchId === "all" ? undefined : { branch_id: Number(branchId) });
            if (selectedTournamentId === id) {
                fetchBracket(id, true, { silent: true }).then((res) => {
                    if (res.success) setBracket(res.data);
                });
            }
        } else {
            toast.error(result.errorMessage || t("admin.bracketFailed"));
        }
    };

    const groups = (Array.isArray(bracket?.rounds)
        ? bracket.rounds.find((round: any) => round?.stage === "group")?.groups || []
        : []) as any[];

    const teamNameById = useMemo(() => {
        return matches.reduce<Record<number, string>>((acc, match) => {
            if (match.team1_id && match.team1_name) acc[match.team1_id] = match.team1_name;
            if (match.team2_id && match.team2_name) acc[match.team2_id] = match.team2_name;
            if (match.winner_id && match.winner_name) acc[match.winner_id] = match.winner_name;
            return acc;
        }, { ...teamDirectory });
    }, [matches, teamDirectory]);

    const resolveTeamLabel = (teamId: number) => {
        const name = teamNameById[teamId];
        return name ? `${name} (#${teamId})` : `#${teamId}`;
    };

    const resolveOptionalTeamLabel = (teamId?: number | null) => {
        if (!teamId) return t("admin.scheduler.tbd");
        return resolveTeamLabel(teamId);
    };

    const resolveOptionalWinnerLabel = (winnerId?: number | null) => {
        if (!winnerId) return t("admin.scheduler.notSet");
        return resolveTeamLabel(winnerId);
    };

    const formatMatchScore = (score?: Record<string, unknown>) => {
        if (!score || typeof score !== "object") return t("admin.scheduler.noScore");

        const entries = Object.entries(score)
            .filter(([, value]) => value != null && String(value).trim() !== "")
            .sort(([a], [b]) => a.localeCompare(b));

        if (entries.length === 0) return t("admin.scheduler.noScore");
        return entries.map(([set, value]) => `${set}: ${String(value)}`).join(" | ");
    };

    const toggleCourtSelection = (courtId: number) => {
        setSelectedCourtIds((prev) =>
            prev.includes(courtId) ? prev.filter((id) => id !== courtId) : [...prev, courtId]
        );
    };

    const onAutoSchedule = async () => {
        if (!selectedTournamentId) {
            toast.error(t("admin.scheduler.selectTournament"));
            return;
        }

        if (!autoStartTime || selectedCourtIds.length === 0) {
            toast.error(t("admin.scheduler.missingAutoInputs"));
            return;
        }

        const result = await autoScheduleTournament(selectedTournamentId, {
            start_time: autoStartTime,
            court_ids: selectedCourtIds,
            override_locked: autoOverrideLocked,
        });

        if (result.success) {
            toast.success(t("admin.scheduler.autoScheduled"));
            fetchAdminMatches(selectedTournamentId);
        } else {
            toast.error(schedulingErrorMessage(result.errorCodes) || result.errorMessage || t("admin.scheduler.genericError"));
        }
    };

    const onManualSchedule = async (matchId: string) => {
        const courtId = Number(rowCourtByMatch[matchId]);
        const scheduledTime = rowTimeByMatch[matchId];

        if (!courtId || !scheduledTime) {
            toast.error(t("admin.scheduler.missingManualInputs"));
            return;
        }

        const result = await scheduleMatch(matchId, {
            court_id: courtId,
            scheduled_time: scheduledTime,
            override: !!rowOverrideByMatch[matchId],
        });

        if (result.success) {
            toast.success(t("admin.scheduler.manualScheduled"));
            fetchAdminMatches(selectedTournamentId);
        } else {
            toast.error(schedulingErrorMessage(result.errorCodes) || result.errorMessage || t("admin.scheduler.genericError"));
        }
    };

    const onLockToggle = async (matchId: string, currentlyLocked: boolean) => {
        const reason = rowLockReasonByMatch[matchId] || "";
        if (!currentlyLocked && !reason.trim()) {
            toast.error(t("admin.scheduler.lockReasonRequired"));
            return;
        }

        const result = await lockMatch(matchId, {
            locked: !currentlyLocked,
            reason: currentlyLocked ? undefined : reason.trim(),
        });

        if (result.success) {
            toast.success(currentlyLocked ? t("admin.scheduler.unlocked") : t("admin.scheduler.locked"));
            fetchAdminMatches(selectedTournamentId);
        } else {
            toast.error(result.errorMessage || t("admin.scheduler.lockFailed"));
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{t("admin.title")}</h1>
                <p className="text-sm text-muted-foreground mt-1">{t("admin.subtitle")}</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t("admin.createTitle")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <Label>{t("admin.branch")}</Label>
                            <Select value={branchId} onValueChange={setBranchId}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t("admin.allBranches")}</SelectItem>
                                    {branches.map((b) => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>{t("admin.name")}</Label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label>{t("admin.type")}</Label>
                            <Select value={type} onValueChange={(v: any) => setType(v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="knockout">{t("type.knockout")}</SelectItem>
                                    <SelectItem value="round_robin">{t("type.round_robin")}</SelectItem>
                                    <SelectItem value="group_knockout">{t("type.group_knockout")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>{t("admin.startDate")}</Label>
                            <Input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label>{t("admin.deadline")}</Label>
                            <Input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label>{t("admin.maxPlayers")}</Label>
                            <Input type="number" value={maxPlayers} onChange={(e) => setMaxPlayers(e.target.value)} />
                        </div>
                    </div>
                    <Button onClick={onCreate}>{t("admin.createButton")}</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t("admin.listTitle")}</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading && tournaments.length === 0 ? (
                        <p className="text-muted-foreground">{t("loading")}</p>
                    ) : tournaments.length === 0 ? (
                        <p className="text-muted-foreground">{t("empty")}</p>
                    ) : (
                        <div className="space-y-3">
                            {tournaments.map((tour) => (
                                <div key={tour.id} className="rounded-md border border-border p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                    <div>
                                        <div className="font-semibold">{tour.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {t("typeLabel")}: {t(`type.${tour.tournament_type}`)} | {t("startDate")}: {formatDate(tour.start_date)}
                                        </div>
                                        <div className="mt-1">
                                            <Badge variant="outline">{t(`status.${tour.status}`)}</Badge>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" onClick={() => onGenerateBracket(tour.id)}>{t("admin.generateBracket")}</Button>
                                        <Button variant={selectedTournamentId === tour.id ? "default" : "secondary"} onClick={() => setSelectedTournamentId(tour.id)}>
                                            {t("admin.scheduler.manageSchedule")}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t("admin.scheduler.title")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <Label>{t("admin.scheduler.selectedTournament")}</Label>
                            <Select value={selectedTournamentId} onValueChange={setSelectedTournamentId}>
                                <SelectTrigger><SelectValue placeholder={t("admin.scheduler.selectTournament")} /></SelectTrigger>
                                <SelectContent>
                                    {tournaments.map((tour) => <SelectItem key={tour.id} value={tour.id}>{tour.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>{t("admin.scheduler.autoStart")}</Label>
                            <Input type="datetime-local" value={autoStartTime} onChange={(e) => setAutoStartTime(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label>{t("admin.scheduler.overrideLocked")}</Label>
                            <Button
                                type="button"
                                variant={autoOverrideLocked ? "default" : "outline"}
                                onClick={() => setAutoOverrideLocked((v) => !v)}
                                className="w-full"
                            >
                                {autoOverrideLocked ? t("admin.scheduler.enabled") : t("admin.scheduler.disabled")}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>{t("admin.scheduler.selectCourts")}</Label>
                        <div className="flex flex-wrap gap-2">
                            {courts.map((court) => {
                                const active = selectedCourtIds.includes(Number(court.id));
                                return (
                                    <Button
                                        key={court.id}
                                        type="button"
                                        variant={active ? "default" : "outline"}
                                        onClick={() => toggleCourtSelection(Number(court.id))}
                                    >
                                        {court.name}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>

                    <Button onClick={onAutoSchedule} disabled={!selectedTournamentId}>
                        {t("admin.scheduler.runAuto")}
                    </Button>

                    <div className="space-y-3 pt-4 border-t border-border">
                        <h3 className="text-sm font-semibold">{t("admin.scheduler.groupStandingsTitle")}</h3>
                        {groups.length === 0 ? (
                            <p className="text-sm text-muted-foreground">{t("admin.scheduler.noGroupStandings")}</p>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                {groups.map((group, idx) => {
                                    const standings = Array.isArray(group?.standings) ? group.standings : [];
                                    const qualified = Array.isArray(group?.qualified_team_ids) ? group.qualified_team_ids : [];
                                    const tiebreakOrder = Array.isArray(group?.tiebreak_order) ? group.tiebreak_order.join(" > ") : "-";

                                    return (
                                        <div key={`${group?.name || "group"}-${idx}`} className="rounded-md border border-border p-3 space-y-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="text-sm font-semibold">
                                                    {t("admin.scheduler.groupLabel", { group: group?.name || "-" })}
                                                </div>
                                                <Badge variant={qualified.length > 0 ? "default" : "outline"}>
                                                    {qualified.length > 0 ? t("admin.scheduler.complete") : t("admin.scheduler.pending")}
                                                </Badge>
                                            </div>

                                            <div className="text-xs text-muted-foreground">
                                                {t("admin.scheduler.tiebreakOrder")}: {tiebreakOrder}
                                            </div>

                                            {standings.length === 0 ? (
                                                <p className="text-xs text-muted-foreground">{t("admin.scheduler.noGroupStandings")}</p>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-xs">
                                                        <thead>
                                                            <tr className="text-left text-muted-foreground">
                                                                <th className="py-1 pe-2">{t("admin.scheduler.rank")}</th>
                                                                <th className="py-1 pe-2">{t("admin.scheduler.team")}</th>
                                                                <th className="py-1 pe-2">{t("admin.scheduler.played")}</th>
                                                                <th className="py-1 pe-2">{t("admin.scheduler.wins")}</th>
                                                                <th className="py-1 pe-2">{t("admin.scheduler.losses")}</th>
                                                                <th className="py-1 pe-2">{t("admin.scheduler.points")}</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {standings.map((row: any) => {
                                                                const isQualified = qualified.includes(row.team_id);
                                                                return (
                                                                    <tr key={`${group?.name}-${row.team_id}`} className="border-t border-border/50">
                                                                        <td className="py-1 pe-2">{row.rank}</td>
                                                                        <td className="py-1 pe-2">
                                                                            <span>{resolveTeamLabel(row.team_id)}</span>
                                                                            {isQualified && (
                                                                                <Badge variant="secondary" className="ms-2">
                                                                                    {t("admin.scheduler.qualifierLabel")}
                                                                                </Badge>
                                                                            )}
                                                                        </td>
                                                                        <td className="py-1 pe-2">{row.played}</td>
                                                                        <td className="py-1 pe-2">{row.wins}</td>
                                                                        <td className="py-1 pe-2">{row.losses}</td>
                                                                        <td className="py-1 pe-2">{row.points}</td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="space-y-3 pt-4 border-t border-border">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label>{t("admin.scheduler.statusFilter")}</Label>
                                <Select value={matchStatusFilter} onValueChange={setMatchStatusFilter}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t("admin.scheduler.allStatuses")}</SelectItem>
                                        <SelectItem value="pending">pending</SelectItem>
                                        <SelectItem value="scheduled">scheduled</SelectItem>
                                        <SelectItem value="ongoing">ongoing</SelectItem>
                                        <SelectItem value="completed">completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label>{t("admin.scheduler.roundFilter")}</Label>
                                <Select value={matchRoundFilter} onValueChange={setMatchRoundFilter}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t("admin.scheduler.allRounds")}</SelectItem>
                                        {Array.from(new Set(matches.map((m) => m.round_number))).sort((a, b) => a - b).map((round) => (
                                            <SelectItem key={`round-${round}`} value={String(round)}>{round}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {matches.length === 0 ? (
                            <p className="text-sm text-muted-foreground">{t("admin.scheduler.noMatches")}</p>
                        ) : (
                            matches.map((match) => (
                                <div key={match.id} className="rounded-md border border-border p-3 space-y-3">
                                    <div className="flex flex-wrap items-center gap-2 justify-between">
                                        <div className="text-sm font-medium">
                                            {t("admin.scheduler.matchLabel", { round: match.round_number, match: match.match_number })}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">{match.status}</Badge>
                                            {match.schedule_locked && <Badge variant="destructive">{t("admin.scheduler.lockedBadge")}</Badge>}
                                        </div>
                                    </div>

                                    <div className="text-sm text-muted-foreground">
                                        {t("admin.scheduler.teamsLine", {
                                            team1: resolveOptionalTeamLabel(match.team1_id),
                                            team2: resolveOptionalTeamLabel(match.team2_id),
                                        })}
                                    </div>

                                    {match.status === "completed" && (
                                        <>
                                            <div className="text-sm text-muted-foreground">
                                                {t("admin.scheduler.winnerLine", {
                                                    winner: resolveOptionalWinnerLabel(match.winner_id),
                                                })}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {t("admin.scheduler.scoreLine", {
                                                    score: formatMatchScore(match.score),
                                                })}
                                            </div>
                                        </>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                        <Select
                                            value={rowCourtByMatch[match.id] || (match.court_id ? String(match.court_id) : "")}
                                            onValueChange={(v) => setRowCourtByMatch((prev) => ({ ...prev, [match.id]: v }))}
                                        >
                                            <SelectTrigger><SelectValue placeholder={t("admin.scheduler.court")} /></SelectTrigger>
                                            <SelectContent>
                                                {courts.map((court) => <SelectItem key={court.id} value={String(court.id)}>{court.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>

                                        <Input
                                            type="datetime-local"
                                            value={rowTimeByMatch[match.id] || (match.scheduled_time ? match.scheduled_time.slice(0, 16) : "")}
                                            onChange={(e) => setRowTimeByMatch((prev) => ({ ...prev, [match.id]: e.target.value }))}
                                        />

                                        <Button
                                            type="button"
                                            variant={rowOverrideByMatch[match.id] ? "default" : "outline"}
                                            onClick={() => setRowOverrideByMatch((prev) => ({ ...prev, [match.id]: !prev[match.id] }))}
                                        >
                                            {t("admin.scheduler.override")}
                                        </Button>

                                        <Button type="button" onClick={() => onManualSchedule(match.id)}>
                                            {t("admin.scheduler.scheduleMatch")}
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                        <Input
                                            placeholder={t("admin.scheduler.lockReason")}
                                            value={rowLockReasonByMatch[match.id] || match.schedule_lock_reason || ""}
                                            onChange={(e) => setRowLockReasonByMatch((prev) => ({ ...prev, [match.id]: e.target.value }))}
                                        />
                                        <Button
                                            type="button"
                                            variant={match.schedule_locked ? "secondary" : "destructive"}
                                            onClick={() => onLockToggle(match.id, !!match.schedule_locked)}
                                        >
                                            {match.schedule_locked ? t("admin.scheduler.unlock") : t("admin.scheduler.lock")}
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
