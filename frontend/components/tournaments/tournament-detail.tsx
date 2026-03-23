"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useTournamentsAPI } from "@/hooks/api/use-tournaments";
import { usePlayerAuthContext } from "@/contexts/player-auth-context";
import { usePlayerAccountAPI } from "@/hooks/api/use-player-account";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { formatDate } from "@/lib/format-date";
import { PlayerTeam } from "@/schemas/player.schema";

export function TournamentDetail({ id }: { id: string }) {
    const t = useTranslations("publicTournaments");
    const { player, isAuthenticated } = usePlayerAuthContext();
    const { fetchTeams } = usePlayerAccountAPI();
    const {
        tournament,
        matches,
        participants,
        participation,
        loading,
        error,
        fetchTournament,
        registerTournament,
        registerTeamTournament,
        fetchBracket,
        fetchPublicMatches,
        fetchPublicParticipants,
        fetchMyParticipation,
    } = useTournamentsAPI();
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [skillLevel, setSkillLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
    const [savedTeams, setSavedTeams] = useState<PlayerTeam[]>([]);
    const [selectedTeamId, setSelectedTeamId] = useState<string>("new");
    const [teamForm, setTeamForm] = useState({
        team_name: "",
        teammate_name: "",
        teammate_phone: "",
        teammate_email: "",
        teammate_skill_level: "intermediate" as "beginner" | "intermediate" | "advanced",
        save_team: true,
    });
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
        fetchPublicParticipants(id, { silent });
        if (isAuthenticated) {
            fetchMyParticipation(id, { silent });
        }
        setLastUpdatedAt(new Date());
    };

    useEffect(() => {
        if (!id) return;
        fetchTournament(id, false);
        fetchBracket(id, false).then((res) => {
            if (res.success) setBracket(res.data);
        });
        fetchPublicMatches(id);
        fetchPublicParticipants(id);
        if (isAuthenticated) {
            fetchMyParticipation(id);
            fetchTeams().then(setSavedTeams).catch(() => undefined);
        }
        setLastUpdatedAt(new Date());
    }, [id, isAuthenticated, fetchTournament, fetchBracket, fetchPublicMatches, fetchPublicParticipants, fetchMyParticipation]);

    useEffect(() => {
        if (player) {
            setName(player.name);
            setPhone(player.phone);
            setEmail(player.email);
            setSkillLevel(player.skill_level);
        }
    }, [player]);

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
    }, [id, liveMode, isAuthenticated]);

    const onRegister = async () => {
        if (!name.trim() || !phone.trim()) {
            toast.error(t("registration.required"));
            return;
        }

        const result = await registerTournament(id, {
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim(),
            skill_level: skillLevel,
        });

        if (result.success) {
            toast.success(t("registration.success"));
            fetchTournament(id, false);
            fetchPublicParticipants(id, { silent: true });
            if (isAuthenticated) fetchMyParticipation(id, { silent: true });
        } else {
            toast.error(result.errorMessage || t("registration.failed"));
        }
    };

    const onRegisterTeam = async () => {
        const payload =
            selectedTeamId !== "new"
                ? { user_team_id: Number(selectedTeamId) }
                : teamForm;

        const result = await registerTeamTournament(id, payload);
        if (result.success) {
            toast.success("Team registration submitted");
            fetchTournament(id, false);
            fetchPublicParticipants(id, { silent: true });
            fetchMyParticipation(id, { silent: true });
        } else {
            toast.error(result.errorMessage || "Failed to register team");
        }
    };

    const selectedTeam = useMemo(
        () => savedTeams.find((team) => String(team.id) === selectedTeamId),
        [savedTeams, selectedTeamId]
    );

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
    const isTeamTournament = tournament.entry_mode === "team";

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
                    <Button variant={liveMode ? "default" : "outline"} onClick={() => setLiveMode((value) => !value)}>
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
                    <div>{t("participants")}: {tournament.approved_registrations_count ?? 0}/{tournament.capacity_total ?? tournament.max_players ?? "-"}</div>
                    {typeof tournament.capacity_remaining === "number" && <div>Available Slots: {tournament.capacity_remaining}</div>}
                </CardContent>
            </Card>

            {participation && (
                <Card>
                    <CardHeader>
                        <CardTitle>Your Participation</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap items-center justify-between gap-3 text-sm">
                        <div className="space-y-1">
                            <div>Status: <Badge>{participation.participation_status}</Badge></div>
                            <div>Registration: {participation.registration_status}</div>
                            {participation.team_name && <div>Team: {participation.team_name}</div>}
                        </div>
                        <Link href="/account/tournaments" className="text-primary-text underline">Open My Tournaments</Link>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>{t("registration.title")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-xs text-muted-foreground">
                        {registrationOpen ? t("registration.openHint") : t("registration.closedHint")}
                    </p>

                    {!registrationOpen && (
                        <Badge variant="secondary">{t("registration.closed")}</Badge>
                    )}

                    {isTeamTournament ? (
                        !isAuthenticated ? (
                            <div className="space-y-2 text-sm">
                                <p className="text-muted-foreground">Team tournaments require a player account so your team can be tracked.</p>
                                <Button asChild><Link href="/account/login">Login to Join as Team</Link></Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Saved Team</Label>
                                    <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a saved team or create one here" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="new">Create one-time team</SelectItem>
                                            {savedTeams.map((team) => (
                                                <SelectItem key={team.id} value={String(team.id)}>
                                                    {team.name} · {team.teammate_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedTeam && selectedTeamId !== "new" ? (
                                    <div className="rounded-md border border-border p-3 text-sm">
                                        <div className="font-medium">{selectedTeam.name}</div>
                                        <div className="text-muted-foreground">{selectedTeam.teammate_name} · {selectedTeam.teammate_phone}</div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <Label>Team Name</Label>
                                                <Input value={teamForm.team_name} onChange={(event) => setTeamForm((current) => ({ ...current, team_name: event.target.value }))} />
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Teammate Name</Label>
                                                <Input value={teamForm.teammate_name} onChange={(event) => setTeamForm((current) => ({ ...current, teammate_name: event.target.value }))} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <Label>Teammate Phone</Label>
                                                <Input value={teamForm.teammate_phone} onChange={(event) => setTeamForm((current) => ({ ...current, teammate_phone: event.target.value }))} />
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Teammate Email</Label>
                                                <Input type="email" value={teamForm.teammate_email} onChange={(event) => setTeamForm((current) => ({ ...current, teammate_email: event.target.value }))} />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Teammate Skill Level</Label>
                                            <Select value={teamForm.teammate_skill_level} onValueChange={(value: any) => setTeamForm((current) => ({ ...current, teammate_skill_level: value }))}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="beginner">Beginner</SelectItem>
                                                    <SelectItem value="intermediate">Intermediate</SelectItem>
                                                    <SelectItem value="advanced">Advanced</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Checkbox
                                                id="save_team"
                                                checked={teamForm.save_team}
                                                onCheckedChange={(checked) => setTeamForm((current) => ({ ...current, save_team: Boolean(checked) }))}
                                            />
                                            <Label htmlFor="save_team">Save this team for future tournaments</Label>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between gap-3">
                                    <Button onClick={onRegisterTeam} disabled={!registrationOpen}>Join Tournament as Team</Button>
                                    <Link href="/account/teams" className="text-primary-text underline">Manage Saved Teams</Link>
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label>{t("registration.name")}</Label>
                                    <Input value={name} onChange={(event) => setName(event.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <Label>{t("registration.phone")}</Label>
                                    <Input value={phone} onChange={(event) => setPhone(event.target.value)} />
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <Label>{t("registration.email")}</Label>
                                    <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label>{t("registration.skill")}</Label>
                                <Select value={skillLevel} onValueChange={(value: any) => setSkillLevel(value)}>
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
                            <Button onClick={onRegister} disabled={!registrationOpen}>
                                {tournament.registration_open ? t("registration.submit") : t("registration.closed")}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Approved Participants</CardTitle>
                </CardHeader>
                <CardContent>
                    {participants.length === 0 ? (
                        <p className="text-muted-foreground">No approved participants yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {participants.map((participant) => (
                                <div key={participant.id} className="rounded-md border border-border p-3 text-sm">
                                    <div className="font-medium">{participant.name}</div>
                                    {participant.members && participant.members.length > 0 && (
                                        <div className="text-muted-foreground">{participant.members.join(" · ")}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
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
                                    <div>
                                        <div>{t("live.matchLine", { round: match.round_number, match: match.match_number })}</div>
                                        <div className="text-muted-foreground">{match.team1_name || "TBD"} vs {match.team2_name || "TBD"}</div>
                                    </div>
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
