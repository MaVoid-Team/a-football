"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { toast } from "sonner";
import { useTournamentsAPI } from "@/hooks/api/use-tournaments";
import { useBranchesAPI } from "@/hooks/api/use-branches";
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
    const [createStatus, setCreateStatus] = useState<"draft" | "open">("open");
    const [startDate, setStartDate] = useState("");
    const [deadline, setDeadline] = useState("");
    const [maxPlayers, setMaxPlayers] = useState("16");

    const { branches, fetchBranches } = useBranchesAPI();
    const { tournaments, loading, fetchAdminTournaments, createTournament } = useTournamentsAPI();

    useEffect(() => {
        fetchBranches();
    }, [fetchBranches]);

    useEffect(() => {
        const params: { branch_id?: number } = {};
        if (branchId !== "all") params.branch_id = Number(branchId);
        fetchAdminTournaments(params);
    }, [branchId, fetchAdminTournaments]);

    const onCreate = async () => {
        if (branchId === "all") {
            toast.error(t("admin.selectBranchFirst"));
            return;
        }

        const result = await createTournament({
            branch_id: Number(branchId),
            name,
            tournament_type: type,
            status: createStatus,
            start_date: startDate,
            registration_deadline: deadline,
            max_players: Number(maxPlayers),
            match_duration_minutes: 60,
        });

        if (result.success) {
            toast.success(t("admin.created"));
            setName("");
            setCreateStatus("open");
            setStartDate("");
            setDeadline("");
            setMaxPlayers("16");
            fetchAdminTournaments({ branch_id: Number(branchId) });
        } else {
            toast.error(result.errorMessage || t("admin.createFailed"));
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
                            <Select value={type} onValueChange={(value: "knockout" | "round_robin" | "group_knockout") => setType(value)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="knockout">{t("type.knockout")}</SelectItem>
                                    <SelectItem value="round_robin">{t("type.round_robin")}</SelectItem>
                                    <SelectItem value="group_knockout">{t("type.group_knockout")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>{t("admin.visibility")}</Label>
                            <Select value={createStatus} onValueChange={(value: "draft" | "open") => setCreateStatus(value)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="open">{t("admin.visibilityOpen")}</SelectItem>
                                    <SelectItem value="draft">{t("admin.visibilityDraft")}</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                {createStatus === "open" ? t("admin.visibilityOpenHint") : t("admin.visibilityDraftHint")}
                            </p>
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
                                <div key={tour.id} className="rounded-md border border-border p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <div className="font-semibold">{tour.name}</div>
                                            <Badge variant={tour.status === "draft" ? "secondary" : "outline"}>
                                                {t(`status.${tour.status}`)}
                                            </Badge>
                                            <Badge variant={tour.registration_open ? "default" : "secondary"}>
                                                {tour.registration_open ? t("admin.registrationOpen") : t("admin.registrationClosed")}
                                            </Badge>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {t("typeLabel")}: {t(`type.${tour.tournament_type}`)} | {t("startDate")}: {formatDate(tour.start_date)}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {t("admin.participantsSummary", {
                                                approved: tour.approved_registrations_count ?? 0,
                                                max: tour.max_players ?? "-"
                                            })}
                                        </div>
                                    </div>

                                    <Button asChild>
                                        <Link href={`/tournaments/${tour.id}`}>{t("admin.openDetails")}</Link>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
