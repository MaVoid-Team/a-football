"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { usePlayerAuthContext } from "@/contexts/player-auth-context";
import { usePlayerAccountAPI } from "@/hooks/api/use-player-account";
import { AccountShell } from "@/components/player/account-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function ProfilePanel() {
    const t = useTranslations("playerAccount.profilePanel");
    const { player, updatePlayer } = usePlayerAuthContext();
    const { fetchProfile, updateProfile, loading } = usePlayerAccountAPI();
    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        skill_level: "intermediate",
        password: "",
    });

    useEffect(() => {
        if (player) {
            setForm({
                name: player.name,
                phone: player.phone,
                email: player.email,
                skill_level: player.skill_level,
                password: "",
            });
        }

        fetchProfile().then((profile) => {
            setForm({
                name: profile.name,
                phone: profile.phone,
                email: profile.email,
                skill_level: profile.skill_level,
                password: "",
            });
            updatePlayer(profile);
        }).catch(() => undefined);
    }, []);

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const profile = await updateProfile({
                name: form.name,
                phone: form.phone,
                email: form.email,
                skill_level: form.skill_level as any,
                password: form.password || undefined,
            });
            updatePlayer(profile);
            setForm((current) => ({ ...current, password: "" }));
            toast.success(t("profileUpdated"));
        } catch (_error) {
            toast.error(t("profileUpdateFailed"));
        }
    };

    return (
        <AccountShell
            title={t("title")}
            description={t("description")}
            backHref="/account/tournaments"
            backLabel={t("backToTournaments")}
        >
            <Card>
                <CardHeader>
                    <CardTitle>{t("basicInfo")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t("name")}</Label>
                                <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>{t("phone")}</Label>
                                <Input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t("email")}</Label>
                                <Input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>{t("skillLevel")}</Label>
                                <Select value={form.skill_level} onValueChange={(value) => setForm((current) => ({ ...current, skill_level: value }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="beginner">{t("skillBeginner")}</SelectItem>
                                        <SelectItem value="intermediate">{t("skillIntermediate")}</SelectItem>
                                        <SelectItem value="advanced">{t("skillAdvanced")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>{t("newPassword")}</Label>
                            <Input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} />
                        </div>
                        <Button type="submit" disabled={loading}>
                            {loading ? t("saving") : t("saveChanges")}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </AccountShell>
    );
}
