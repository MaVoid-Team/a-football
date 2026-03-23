"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCrmAPI } from "@/hooks/api/use-crm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/format-date";
import { toast } from "sonner";

export default function CrmPlayerProfilePage() {
  const t = useTranslations("crm");
  const params = useParams<{ id: string }>();
  const playerKey = decodeURIComponent(params.id);

  const {
    player,
    templates,
    loading,
    fetchPlayer,
    fetchTemplates,
    updatePlayerTag,
    generateWhatsappLink,
  } = useCrmAPI();

  const [tagInput, setTagInput] = useState("");
  const [templateId, setTemplateId] = useState("all");

  const activeTemplateId = useMemo(() => {
    if (templateId !== "all") return Number(templateId);
    return templates[0]?.id;
  }, [templateId, templates]);

  useEffect(() => {
    fetchPlayer(playerKey);
    fetchTemplates();
  }, [fetchPlayer, fetchTemplates, playerKey]);

  const addTag = async () => {
    if (!tagInput.trim()) return;
    const result = await updatePlayerTag(playerKey, "add", tagInput.trim());
    if (result.success) {
      setTagInput("");
      await fetchPlayer(playerKey);
    }
  };

  const removeTag = async (tag: string) => {
    const result = await updatePlayerTag(playerKey, "remove", tag);
    if (result.success) {
      await fetchPlayer(playerKey);
    }
  };

  const messagePlayer = async () => {
    if (!activeTemplateId) {
      toast.error(t("players.selectTemplateFirst"));
      return;
    }

    const result = await generateWhatsappLink(activeTemplateId, playerKey);
    if (!result.success || !result.data?.whatsapp_link) {
      toast.error(t("players.whatsappFailed"));
      return;
    }

    window.open(result.data.whatsapp_link, "_blank", "noopener,noreferrer");
  };

  const inactiveSuggestion = player?.last_activity_date
    ? new Date(player.last_activity_date) <= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    : true;
  const frequentSuggestion = (player?.total_bookings || 0) >= 3;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{player?.name || t("players.profile")}</h1>
          <p className="text-sm text-muted-foreground">{player?.phone}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/crm/players">{t("players.backToList")}</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">{t("players.bookings")}</p><p className="text-2xl font-bold">{player?.total_bookings || 0}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">{t("players.matches")}</p><p className="text-2xl font-bold">{player?.total_matches || 0}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">{t("players.tournaments")}</p><p className="text-2xl font-bold">{player?.total_tournaments || 0}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">{t("players.lastActivity")}</p><p className="text-sm font-medium">{formatDate(player?.last_activity_date, "PP")}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("players.tags")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {(player?.tags || []).map((tag) => (
              <Button key={tag} variant="secondary" size="sm" onClick={() => removeTag(tag)}>
                {tag} ×
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder={t("players.tagPlaceholder")} />
            <Button disabled={loading} onClick={addTag}>{t("players.addTag")}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("players.messaging")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder={t("players.template")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("players.defaultTemplate")}</SelectItem>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id.toString()}>{template.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={messagePlayer}>{t("players.messageWhatsapp")}</Button>
          </div>

          {inactiveSuggestion && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              {t("players.reengageSuggestion")}
            </div>
          )}

          {frequentSuggestion && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              {t("players.tournamentSuggestion")}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("players.activityHistory")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(player?.activities || []).map((activity) => (
              <div key={activity.id} className="border-b border-border pb-2">
                <p className="text-sm font-medium">{activity.activity_type}</p>
                <p className="text-xs text-muted-foreground">{formatDate(activity.created_at, "PP p")}</p>
              </div>
            ))}
            {!player?.activities?.length && (
              <p className="text-sm text-muted-foreground">{t("players.noActivity")}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
