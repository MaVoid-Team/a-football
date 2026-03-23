"use client";

import { FormEvent, useEffect, useState } from "react";
import { usePlayerAccountAPI } from "@/hooks/api/use-player-account";
import { PlayerTeam, PlayerTeamFormData } from "@/schemas/player.schema";
import { AccountShell } from "@/components/player/account-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const blankForm: PlayerTeamFormData = {
    name: "",
    teammate_name: "",
    teammate_phone: "",
    teammate_email: "",
    teammate_skill_level: "intermediate",
};

export function TeamsPanel() {
    const { fetchTeams, createTeam, deleteTeam } = usePlayerAccountAPI();
    const [teams, setTeams] = useState<PlayerTeam[]>([]);
    const [form, setForm] = useState<PlayerTeamFormData>(blankForm);

    const refresh = () => {
        fetchTeams().then(setTeams).catch(() => undefined);
    };

    useEffect(() => {
        refresh();
    }, []);

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            await createTeam(form);
            setForm(blankForm);
            toast.success("Team saved");
            refresh();
        } catch (_error) {
            toast.error("Failed to save team");
        }
    };

    return (
        <AccountShell title="My Teams" description="Save reusable 2-player team setups so team tournament joins stay quick.">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Create Team</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={onSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Team Name</Label>
                                    <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Teammate Name</Label>
                                    <Input value={form.teammate_name} onChange={(event) => setForm((current) => ({ ...current, teammate_name: event.target.value }))} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Teammate Phone</Label>
                                    <Input value={form.teammate_phone} onChange={(event) => setForm((current) => ({ ...current, teammate_phone: event.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Teammate Email</Label>
                                    <Input value={form.teammate_email || ""} onChange={(event) => setForm((current) => ({ ...current, teammate_email: event.target.value }))} />
                                </div>
                            </div>
                            <div className="space-y-2 max-w-xs">
                                <Label>Teammate Skill Level</Label>
                                <Select value={form.teammate_skill_level} onValueChange={(value: any) => setForm((current) => ({ ...current, teammate_skill_level: value }))}>
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
                            <Button type="submit">Save Team</Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    {teams.length === 0 ? (
                        <Card><CardContent className="py-10 text-center text-muted-foreground">No saved teams yet.</CardContent></Card>
                    ) : teams.map((team) => (
                        <Card key={team.id}>
                            <CardHeader className="flex flex-row items-center justify-between gap-3">
                                <div>
                                    <CardTitle className="text-lg">{team.name}</CardTitle>
                                    <p className="text-sm text-muted-foreground">{team.teammate_name} · {team.teammate_phone}</p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={async () => {
                                        await deleteTeam(team.id);
                                        refresh();
                                    }}
                                >
                                    Delete
                                </Button>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>
        </AccountShell>
    );
}
