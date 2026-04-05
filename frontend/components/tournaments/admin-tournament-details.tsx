"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Clock3, Loader2, Trash2 } from "lucide-react";
import { useTournamentsAPI } from "@/hooks/api/use-tournaments";
import { useCourtsAPI } from "@/hooks/api/use-courts";
import type { AdminTournamentRegistration, Tournament, TournamentMatch } from "@/schemas/tournament.schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/format-date";

type TournamentTab = "overview" | "participants" | "bracket" | "scheduling";

const VALID_TABS: TournamentTab[] = ["overview", "participants", "bracket", "scheduling"];

export function AdminTournamentDetails({ id }: { id: string }) {
    const t = useTranslations("tournaments");
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [registrationItems, setRegistrationItems] = useState<AdminTournamentRegistration[]>([]);
    const [matchItems, setMatchItems] = useState<TournamentMatch[]>([]);
    const [bracket, setBracket] = useState<any>(null);
    const [pageReady, setPageReady] = useState(false);
    const [checklistHidden, setChecklistHidden] = useState(false);
    const [participantFilter, setParticipantFilter] = useState<"all" | "pending" | "approved" | "rejected" | "cancelled">("pending");
    const [registrationActionById, setRegistrationActionById] = useState<Record<string, string>>({});
    const [autoStartTime, setAutoStartTime] = useState("");
    const [autoOverrideLocked, setAutoOverrideLocked] = useState(false);
    const [selectedCourtIds, setSelectedCourtIds] = useState<number[]>([]);
    const [matchStatusFilter, setMatchStatusFilter] = useState<string>("all");
    const [matchRoundFilter, setMatchRoundFilter] = useState<string>("all");
    const [rowCourtByMatch, setRowCourtByMatch] = useState<Record<string, string>>({});
    const [rowTimeByMatch, setRowTimeByMatch] = useState<Record<string, string>>({});
    const [rowOverrideByMatch, setRowOverrideByMatch] = useState<Record<string, boolean>>({});
    const [rowLockReasonByMatch, setRowLockReasonByMatch] = useState<Record<string, string>>({});

    const {
        loading,
        error,
        fetchTournament,
        updateTournament,
        generateBracket,
        fetchBracket,
        fetchAdminMatches,
        fetchAdminRegistrations,
        updateRegistration,
        autoScheduleTournament,
        scheduleMatch,
        lockMatch,
        deleteTournament,
    } = useTournamentsAPI();
    const { courts, fetchCourts } = useCourtsAPI();

    const activeTab = useMemo<TournamentTab>(() => {
        const value = searchParams.get("tab") as TournamentTab | null;
        return value && VALID_TABS.includes(value) ? value : "overview";
    }, [searchParams]);

    const checklistStorageKey = `${pathname}:tournament:${id}:checklist-hidden`;

    useEffect(() => {
        if (typeof window === "undefined") return;
        setChecklistHidden(window.sessionStorage.getItem(checklistStorageKey) === "true");
    }, [checklistStorageKey]);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            const tournamentResult = await fetchTournament(id, true);
            if (!mounted || !tournamentResult.success || !tournamentResult.data) {
                setPageReady(true);
                return;
            }

            setTournament(tournamentResult.data);
            if (tournamentResult.data.branch_id) {
                fetchCourts({ branch_id: tournamentResult.data.branch_id, per_page: 100 });
            }

            const [registrationResult, matchResult, bracketResult] = await Promise.all([
                fetchAdminRegistrations(id, { per_page: 100 }, { silent: true, setState: false }),
                fetchAdminMatches(id, { per_page: 100 }, { silent: true, setState: false }),
                fetchBracket(id, true, { silent: true }),
            ]);

            if (!mounted) return;

            setRegistrationItems(registrationResult.success ? registrationResult.data : []);
            setMatchItems(matchResult.success ? matchResult.data : []);
            setBracket(bracketResult.success ? bracketResult.data : null);
            setPageReady(true);
        };

        load();

        return () => {
            mounted = false;
        };
    }, [fetchAdminMatches, fetchAdminRegistrations, fetchBracket, fetchCourts, fetchTournament, id]);

    const setTab = (tab: TournamentTab) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", tab);
        router.replace(`${pathname}?${params.toString()}`);
    };

    const rounds = Array.isArray(bracket?.rounds)
        ? bracket.rounds
        : (Array.isArray(tournament?.bracket_data?.rounds) ? tournament.bracket_data?.rounds : []);
    const bracketReady = rounds.length > 0;
    const approvedCount = registrationItems.filter((registration) => registration.status === "approved").length;
    const hasScheduledMatches = matchItems.some((match) => ["scheduled", "ongoing", "completed"].includes(match.status));
    const minimumRequired = tournament?.tournament_type === "group_knockout" ? 4 : 2;
    const canGenerateBracket = approvedCount >= minimumRequired && !bracketReady;
    const hasBracketActivity = matchItems.some((match) => {
        const hasScore = Boolean(match.score && Object.keys(match.score).length > 0);
        const completedRealMatch = match.status === "completed" && Boolean(match.team1_id && match.team2_id);
        return Boolean(match.scheduled_time) || match.status === "ongoing" || completedRealMatch || hasScore;
    });
    const canRegenerateBracket = approvedCount >= minimumRequired && bracketReady && !hasBracketActivity;
    const readyMatches = matchItems.filter((match) => Boolean(match.team1_id && match.team2_id));
    const schedulableMatches = readyMatches.filter((match) => match.status === "pending");
    const hasSchedulableMatches = schedulableMatches.length > 0;
    const filteredRegistrations = registrationItems.filter((registration) => participantFilter === "all" || registration.status === participantFilter);
    const filteredMatches = matchItems.filter((match) => {
        if (matchStatusFilter !== "all" && match.status !== matchStatusFilter) return false;
        if (matchRoundFilter !== "all" && String(match.round_number) !== matchRoundFilter) return false;
        return true;
    });
    const availableRounds = Array.from(new Set(matchItems.map((match) => match.round_number))).sort((a, b) => a - b);
    const groupRound = rounds.find((round: any) => round?.stage === "group");
    const groups = Array.isArray(groupRound?.groups) ? groupRound.groups : [];

    const lifecycleSteps = [
        { key: "visibility", label: t("admin.details.lifecycle.visibility"), done: tournament ? tournament.status !== "draft" : false },
        { key: "participants", label: t("admin.details.lifecycle.participants"), done: approvedCount >= minimumRequired },
        { key: "bracket", label: t("admin.details.lifecycle.bracket"), done: bracketReady },
        { key: "scheduling", label: t("admin.details.lifecycle.scheduling"), done: hasScheduledMatches },
    ];
    const nextStep = lifecycleSteps.find((step) => !step.done);

    const checklistItems = tournament ? [
        { key: "public", label: t("admin.scheduler.checklistStepPublic"), done: tournament.status !== "draft", hint: t("admin.scheduler.checklistStepPublicHint") },
        { key: "players", label: t("admin.scheduler.checklistStepPlayers", { min: minimumRequired }), done: approvedCount >= minimumRequired, hint: t("admin.scheduler.checklistStepPlayersHint", { current: approvedCount, min: minimumRequired }) },
        { key: "bracket", label: t("admin.scheduler.checklistStepBracket"), done: bracketReady, hint: bracketReady ? t("admin.scheduler.checklistReady") : t("admin.scheduler.checklistStepBracketHint") },
        { key: "schedule", label: t("admin.scheduler.checklistStepSchedule"), done: hasScheduledMatches, hint: hasScheduledMatches ? t("admin.scheduler.checklistReady") : t("admin.scheduler.checklistStepScheduleHint") },
    ] : [];

    const updateChecklistHidden = (hidden: boolean) => {
        setChecklistHidden(hidden);
        if (typeof window !== "undefined") {
            window.sessionStorage.setItem(checklistStorageKey, hidden ? "true" : "false");
        }
    };

    const refreshTournamentSnapshot = async () => {
        const [tournamentResult, registrationResult, matchResult, bracketResult] = await Promise.all([
            fetchTournament(id, true, { silent: true }),
            fetchAdminRegistrations(id, { per_page: 100 }, { silent: true, setState: false }),
            fetchAdminMatches(id, { per_page: 100 }, { silent: true, setState: false }),
            fetchBracket(id, true, { silent: true }),
        ]);

        if (tournamentResult.success && tournamentResult.data) setTournament(tournamentResult.data);
        if (registrationResult.success) setRegistrationItems(registrationResult.data);
        if (matchResult.success) setMatchItems(matchResult.data);
        setBracket(bracketResult.success ? bracketResult.data : null);
    };

    const handleOpenRegistration = async () => {
        if (!tournament) return;
        const result = await updateTournament(tournament.id, { status: "open" });
        if (result.success && result.data) {
            setTournament(result.data);
            toast.success(t("admin.openedForRegistration"));
        } else {
            toast.error(result.errorMessage || t("admin.openRegistrationFailed"));
        }
    };

    const handleRegistrationAction = async (registrationId: string, status: "approved" | "rejected") => {
        setRegistrationActionById((prev) => ({ ...prev, [registrationId]: status }));
        const result = await updateRegistration(registrationId, { status });
        setRegistrationActionById((prev) => {
            const next = { ...prev };
            delete next[registrationId];
            return next;
        });

        if (result.success) {
            toast.success(status === "approved" ? t("admin.details.participants.approvedToast") : t("admin.details.participants.rejectedToast"));
            await refreshTournamentSnapshot();
        } else {
            toast.error(result.errorMessage || t("admin.details.participants.actionFailed"));
        }
    };

    const handleGenerateBracket = async (force = false) => {
        if (!tournament) return;
        if (!force && !canGenerateBracket) return;
        if (force && !canRegenerateBracket) return;

        const result = await generateBracket(tournament.id, force ? { force: true } : undefined);
        if (result.success && result.data) {
            setTournament(result.data);
            toast.success(force ? t("admin.details.bracket.regeneratedToast") : t("admin.bracketGenerated"));
            await refreshTournamentSnapshot();
        } else {
            toast.error(result.errorMessage || t("admin.bracketFailed"));
        }
    };

    const toggleCourtSelection = (courtId: number) => {
        setSelectedCourtIds((prev) => (prev.includes(courtId) ? prev.filter((idToRemove) => idToRemove !== courtId) : [...prev, courtId]));
    };

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
            no_schedulable_matches: "admin.scheduler.errors.no_schedulable_matches",
            match_not_ready: "admin.scheduler.errors.match_not_ready",
            match_completed: "admin.scheduler.errors.match_completed",
            missing_courts: "admin.scheduler.errors.missing_courts",
            invalid_start_time: "admin.scheduler.errors.invalid_start_time",
            override_not_allowed: "admin.scheduler.errors.override_not_allowed",
            bracket_locked: "admin.details.bracket.regenerateBlocked",
        };
        return keys[code] ? t(keys[code]) : null;
    };

    const handleAutoSchedule = async () => {
        if (!tournament) return;
        if (!autoStartTime || selectedCourtIds.length === 0) {
            toast.error(t("admin.scheduler.missingAutoInputs"));
            return;
        }

        const result = await autoScheduleTournament(tournament.id, {
            start_time: autoStartTime,
            court_ids: selectedCourtIds,
            override_locked: autoOverrideLocked,
        });

        if (result.success) {
            toast.success(t("admin.scheduler.autoScheduled"));
            await refreshTournamentSnapshot();
        } else {
            toast.error(schedulingErrorMessage(result.errorCodes) || result.errorMessage || t("admin.scheduler.genericError"));
        }
    };

    const handleManualSchedule = async (match: TournamentMatch) => {
        const courtId = Number(rowCourtByMatch[match.id] || (match.court_id ? String(match.court_id) : ""));
        const scheduledTime = rowTimeByMatch[match.id] || (match.scheduled_time ? match.scheduled_time.slice(0, 16) : "");
        if (!courtId || !scheduledTime) {
            toast.error(t("admin.scheduler.missingManualInputs"));
            return;
        }

        const result = await scheduleMatch(match.id, {
            court_id: courtId,
            scheduled_time: scheduledTime,
            override: !!rowOverrideByMatch[match.id],
        });

        if (result.success) {
            toast.success(t("admin.scheduler.manualScheduled"));
            await refreshTournamentSnapshot();
        } else {
            toast.error(schedulingErrorMessage(result.errorCodes) || result.errorMessage || t("admin.scheduler.genericError"));
        }
    };

    const handleLockToggle = async (match: TournamentMatch) => {
        const reason = rowLockReasonByMatch[match.id] || match.schedule_lock_reason || "";
        if (!match.schedule_locked && !reason.trim()) {
            toast.error(t("admin.scheduler.lockReasonRequired"));
            return;
        }

        const result = await lockMatch(match.id, {
            locked: !match.schedule_locked,
            reason: match.schedule_locked ? undefined : reason.trim(),
        });

        if (result.success) {
            toast.success(match.schedule_locked ? t("admin.scheduler.unlocked") : t("admin.scheduler.locked"));
            await refreshTournamentSnapshot();
        } else {
            toast.error(result.errorMessage || t("admin.scheduler.lockFailed"));
        }
    };

    const handleDelete = async () => {
        if (!tournament) return;
        if (!window.confirm(t("admin.details.deleteConfirm"))) return;

        const result = await deleteTournament(tournament.id);
        if (result.success) {
            toast.success(t("admin.details.deleted"));
            router.push("/tournaments");
        } else {
            toast.error(result.errorMessage || t("admin.details.deleteFailed"));
        }
    };

    if (!pageReady && loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!tournament) {
        return (
            <div className="space-y-4">
                <Button asChild variant="ghost" size="sm" className="gap-2">
                    <Link href="/tournaments">
                        <ArrowLeft className="h-4 w-4" />
                        {t("admin.details.back")}
                    </Link>
                </Button>
                <Card>
                    <CardContent className="py-10 text-center text-muted-foreground">
                        {error || t("admin.details.notFound")}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-3">
                    <Button asChild variant="ghost" size="sm" className="gap-2">
                        <Link href="/tournaments">
                            <ArrowLeft className="h-4 w-4" />
                            {t("admin.details.back")}
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{tournament.name}</h1>
                        <p className="text-sm text-muted-foreground mt-1">{t("admin.details.subtitle")}</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={tournament.status === "draft" ? "secondary" : "outline"}>{t(`status.${tournament.status}`)}</Badge>
                    <Badge variant={tournament.registration_open ? "default" : "secondary"}>
                        {tournament.registration_open ? t("admin.registrationOpen") : t("admin.registrationClosed")}
                    </Badge>
                    {tournament.status === "draft" && (
                        <Button onClick={handleOpenRegistration}>{t("admin.openForRegistration")}</Button>
                    )}
                    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="pt-6 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <div className="text-sm font-medium">{t("admin.details.lifecycle.title")}</div>
                            <div className="text-xs text-muted-foreground">
                                {nextStep ? t("admin.details.lifecycle.nextAction", { action: nextStep.label }) : t("admin.details.lifecycle.complete")}
                            </div>
                        </div>
                        <Badge variant={nextStep ? "secondary" : "default"}>
                            {nextStep ? t("admin.details.lifecycle.inProgress") : t("admin.details.lifecycle.done")}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        {lifecycleSteps.map((step) => (
                            <div key={step.key} className="rounded-lg border border-border bg-background px-3 py-3">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-sm font-medium">{step.label}</span>
                                    {step.done ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Clock3 className="h-4 w-4 text-amber-500" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={(value) => setTab(value as TournamentTab)}>
                <TabsList className="flex-wrap h-auto">
                    <TabsTrigger value="overview">{t("admin.details.tabs.overview")}</TabsTrigger>
                    <TabsTrigger value="participants">{t("admin.details.tabs.participants")}</TabsTrigger>
                    <TabsTrigger value="bracket">{t("admin.details.tabs.bracket")}</TabsTrigger>
                    <TabsTrigger value="scheduling">{t("admin.details.tabs.scheduling")}</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <SummaryCard label={t("admin.details.summary.status")} value={t(`status.${tournament.status}`)} />
                        <SummaryCard label={t("admin.details.summary.registration")} value={tournament.registration_open ? t("admin.scheduler.registrationOpen") : t("admin.scheduler.registrationClosed")} />
                        <SummaryCard label={t("admin.details.summary.approvedPlayers")} value={t("admin.details.summary.approvedPlayersValue", { count: approvedCount, min: minimumRequired })} />
                        <SummaryCard label={t("admin.details.summary.bracket")} value={bracketReady ? t("admin.scheduler.bracketReady") : t("admin.scheduler.bracketMissing")} />
                    </div>

                    {!checklistHidden && (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between gap-3">
                                <div>
                                    <CardTitle>{t("admin.scheduler.setupChecklistTitle")}</CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {t("admin.scheduler.checklistProgress", {
                                            done: checklistItems.filter((item) => item.done).length,
                                            total: checklistItems.length,
                                        })}
                                    </p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => updateChecklistHidden(true)}>
                                    {t("admin.details.hideChecklist")}
                                </Button>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {checklistItems.map((item) => (
                                    <div key={item.key} className="rounded-md border border-border bg-background px-3 py-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="text-sm font-medium">{item.label}</div>
                                            <Badge variant={item.done ? "default" : "secondary"}>
                                                {item.done ? t("admin.scheduler.checklistDone") : t("admin.scheduler.checklistPending")}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">{item.hint}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {checklistHidden && (
                        <Button variant="outline" size="sm" onClick={() => updateChecklistHidden(false)}>
                            {t("admin.details.showChecklist")}
                        </Button>
                    )}
                </TabsContent>

                <TabsContent value="participants" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("admin.details.participants.title")}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-wrap items-center gap-2">
                                {(["all", "pending", "approved", "rejected", "cancelled"] as const).map((status) => (
                                    <Button
                                        key={status}
                                        type="button"
                                        variant={participantFilter === status ? "default" : "outline"}
                                        onClick={() => setParticipantFilter(status)}
                                    >
                                        {status === "all" ? t("admin.details.participants.all") : t(`admin.details.participants.status.${status}`)}
                                    </Button>
                                ))}
                            </div>

                            {filteredRegistrations.length === 0 ? (
                                <p className="text-sm text-muted-foreground">{t("admin.details.participants.empty")}</p>
                            ) : (
                                <div className="space-y-3">
                                    {filteredRegistrations.map((registration) => {
                                        const actionState = registrationActionById[registration.id];
                                        const actionLoading = Boolean(actionState);
                                        const actionable = registration.status === "pending";

                                        return (
                                            <div key={registration.id} className="rounded-md border border-border p-4 space-y-3">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <div>
                                                        <div className="font-medium">{registration.player_name || t("admin.details.participants.unknownPlayer")}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {t("admin.details.participants.createdAt", { value: formatDate(registration.created_at) })}
                                                        </div>
                                                    </div>
                                                    <Badge variant={registration.status === "approved" ? "default" : "secondary"}>
                                                        {t(`admin.details.participants.status.${registration.status}`)}
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                    <div>{t("admin.details.participants.phone")}: {registration.player_phone || "-"}</div>
                                                    <div>{t("admin.details.participants.email")}: {registration.player_email || "-"}</div>
                                                    <div>{t("admin.details.participants.skill")}: {registration.player_skill_level ? t(`admin.details.participants.skillValue.${registration.player_skill_level}`) : "-"}</div>
                                                    <div>{t("admin.details.participants.notes")}: {registration.notes || "-"}</div>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    <Button type="button" disabled={!actionable || actionLoading} onClick={() => handleRegistrationAction(registration.id, "approved")}>
                                                        {actionState === "approved" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                        {t("admin.details.participants.approve")}
                                                    </Button>
                                                    <Button type="button" variant="outline" disabled={!actionable || actionLoading} onClick={() => handleRegistrationAction(registration.id, "rejected")}>
                                                        {actionState === "rejected" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                        {t("admin.details.participants.reject")}
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="bracket" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("admin.details.bracket.title")}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
                                <div className="text-sm font-medium">{t("admin.details.bracket.prerequisitesTitle")}</div>
                                <div className="text-sm text-muted-foreground">
                                    {t("admin.details.bracket.prerequisitesBody", { approved: approvedCount, required: minimumRequired })}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {t("admin.details.bracket.matchesCreatedHint")}
                                </div>
                                {!canGenerateBracket && !bracketReady && (
                                    <div className="text-sm text-amber-600">{t("admin.details.bracket.blockedReason", { required: minimumRequired })}</div>
                                )}
                                {!bracketReady && (
                                    <div className="flex flex-wrap gap-2">
                                        <Button disabled={!canGenerateBracket} onClick={() => handleGenerateBracket()}>
                                            {t("admin.generateBracket")}
                                        </Button>
                                        <Button type="button" variant="outline" onClick={() => setTab("participants")}>
                                            {t("admin.details.bracket.goToParticipants")}
                                        </Button>
                                    </div>
                                )}
                                {bracketReady && (
                                    <div className="flex flex-wrap gap-2">
                                        <Button type="button" variant="outline" disabled={!canRegenerateBracket} onClick={() => handleGenerateBracket(true)}>
                                            {t("admin.details.bracket.regenerate")}
                                        </Button>
                                        {!canRegenerateBracket && (
                                            <div className="text-sm text-muted-foreground">
                                                {approvedCount < minimumRequired
                                                    ? t("admin.details.bracket.blockedReason", { required: minimumRequired })
                                                    : hasBracketActivity
                                                        ? t("admin.details.bracket.regenerateBlocked")
                                                        : t("admin.details.bracket.regenerateReady")}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {bracketReady ? (
                                <div className="space-y-4">
                                    {rounds.map((round: any, index: number) => (
                                        <div key={`round-${round?.round_number || index}`} className="rounded-md border border-border p-4 space-y-3">
                                            <div className="font-medium">
                                                {round?.stage === "group"
                                                    ? t("admin.details.bracket.groupStage")
                                                    : t("admin.details.bracket.roundLabel", { round: round?.round_number || index + 1 })}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {(round?.matches || []).map((match: any) => (
                                                    <div key={`${round?.round_number || index}-${match.match_number}`} className="rounded-md border border-border/70 p-3 text-sm">
                                                        <div className="font-medium">{t("admin.scheduler.matchLabel", { round: match.round_number, match: match.match_number })}</div>
                                                        <div className="text-muted-foreground mt-1">#{match.team1_id || "-"} vs #{match.team2_id || "-"}</div>
                                                        <div className="text-muted-foreground mt-1">{t("admin.details.bracket.matchStatus", { status: match.status })}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">{t("admin.details.bracket.empty")}</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="scheduling" className="space-y-4">
                    {!bracketReady ? (
                        <Card>
                            <CardContent className="pt-6 space-y-3">
                                <div className="font-medium">{t("admin.details.scheduling.blockedTitle")}</div>
                                <p className="text-sm text-muted-foreground">{t("admin.details.scheduling.blockedBody")}</p>
                                <Button type="button" onClick={() => setTab("bracket")}>
                                    {t("admin.details.scheduling.goToBracket")}
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t("admin.scheduler.title")}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div className="space-y-1">
                                            <Label>{t("admin.scheduler.autoStart")}</Label>
                                            <Input type="datetime-local" value={autoStartTime} onChange={(e) => setAutoStartTime(e.target.value)} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>{t("admin.scheduler.overrideLocked")}</Label>
                                            <Button type="button" variant={autoOverrideLocked ? "default" : "outline"} className="w-full" onClick={() => setAutoOverrideLocked((value) => !value)}>
                                                {autoOverrideLocked ? t("admin.scheduler.enabled") : t("admin.scheduler.disabled")}
                                            </Button>
                                        </div>
                                        <SummaryCard label={t("admin.details.summary.approvedPlayers")} value={t("admin.details.summary.approvedPlayersValue", { count: approvedCount, min: minimumRequired })} />
                                    </div>

                                    <div className="rounded-md border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                                        {t("admin.details.scheduling.createdFromBracket")}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>{t("admin.scheduler.selectCourts")}</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {courts.map((court) => {
                                                const active = selectedCourtIds.includes(Number(court.id));
                                                return (
                                                    <Button key={court.id} type="button" variant={active ? "default" : "outline"} onClick={() => toggleCourtSelection(Number(court.id))}>
                                                        {court.name}
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Button onClick={handleAutoSchedule} disabled={!hasSchedulableMatches}>
                                            {t("admin.scheduler.runAuto")}
                                        </Button>
                                        {!hasSchedulableMatches && (
                                            <p className="text-sm text-muted-foreground">{t("admin.scheduler.noSchedulableMatches")}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {groups.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t("admin.scheduler.groupStandingsTitle")}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                        {groups.map((group: any, index: number) => (
                                            <div key={`${group?.name || "group"}-${index}`} className="rounded-md border border-border p-3 space-y-2">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="font-medium">{group?.name || t("admin.details.scheduling.groupFallback")}</div>
                                                    <Badge variant={Array.isArray(group?.qualified_team_ids) && group.qualified_team_ids.length > 0 ? "default" : "secondary"}>
                                                        {Array.isArray(group?.qualified_team_ids) && group.qualified_team_ids.length > 0 ? t("admin.scheduler.complete") : t("admin.scheduler.pending")}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {t("admin.scheduler.tiebreakOrder")}: {Array.isArray(group?.tiebreak_order) ? group.tiebreak_order.join(" > ") : "-"}
                                                </p>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}

                            <Card>
                                <CardHeader>
                                    <CardTitle>{t("admin.details.scheduling.matchesTitle")}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
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
                                                    {availableRounds.map((round) => (
                                                        <SelectItem key={`round-${round}`} value={String(round)}>{round}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {filteredMatches.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">{t("admin.scheduler.noMatches")}</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {filteredMatches.map((match) => (
                                                <div key={match.id} className="rounded-md border border-border p-4 space-y-3">
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <div className="font-medium">{t("admin.scheduler.matchLabel", { round: match.round_number, match: match.match_number })}</div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline">{match.status}</Badge>
                                                            {match.schedule_locked && <Badge variant="destructive">{t("admin.scheduler.lockedBadge")}</Badge>}
                                                        </div>
                                                    </div>

                                                    <div className="text-sm text-muted-foreground">
                                                        {t("admin.scheduler.teamsLine", {
                                                            team1: match.team1_name || `#${match.team1_id || "-"}`,
                                                            team2: match.team2_name || `#${match.team2_id || "-"}`,
                                                        })}
                                                    </div>

                                                    {(!match.team1_id || !match.team2_id) && (
                                                        <div className="text-sm text-amber-600">{t("admin.scheduler.waitingForParticipants")}</div>
                                                    )}

                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                                        <Select
                                                            value={rowCourtByMatch[match.id] || (match.court_id ? String(match.court_id) : "")}
                                                            onValueChange={(value) => setRowCourtByMatch((prev) => ({ ...prev, [match.id]: value }))}
                                                        >
                                                            <SelectTrigger><SelectValue placeholder={t("admin.scheduler.court")} /></SelectTrigger>
                                                            <SelectContent>
                                                                {courts.map((court) => (
                                                                    <SelectItem key={court.id} value={String(court.id)}>{court.name}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>

                                                        <Input
                                                            type="datetime-local"
                                                            value={rowTimeByMatch[match.id] || (match.scheduled_time ? match.scheduled_time.slice(0, 16) : "")}
                                                            onChange={(e) => setRowTimeByMatch((prev) => ({ ...prev, [match.id]: e.target.value }))}
                                                            disabled={match.status === "completed"}
                                                        />

                                                        <Button type="button" variant={rowOverrideByMatch[match.id] ? "default" : "outline"} onClick={() => setRowOverrideByMatch((prev) => ({ ...prev, [match.id]: !prev[match.id] }))} disabled={match.status === "completed"}>
                                                            {t("admin.scheduler.override")}
                                                        </Button>

                                                        <Button
                                                            type="button"
                                                            onClick={() => handleManualSchedule(match)}
                                                            disabled={!match.team1_id || !match.team2_id || match.status === "completed"}
                                                        >
                                                            {match.status === "scheduled" ? t("admin.scheduler.rescheduleMatch") : t("admin.scheduler.scheduleMatch")}
                                                        </Button>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                        <Input
                                                            placeholder={t("admin.scheduler.lockReason")}
                                                            value={rowLockReasonByMatch[match.id] || match.schedule_lock_reason || ""}
                                                            onChange={(e) => setRowLockReasonByMatch((prev) => ({ ...prev, [match.id]: e.target.value }))}
                                                        />
                                                        <Button type="button" variant={match.schedule_locked ? "secondary" : "destructive"} onClick={() => handleLockToggle(match)}>
                                                            {match.schedule_locked ? t("admin.scheduler.unlock") : t("admin.scheduler.lock")}
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border border-border bg-background px-4 py-3">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-sm font-medium mt-1">{value}</div>
        </div>
    );
}
