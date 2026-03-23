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
import { X } from "lucide-react";

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
  const [activityType, setActivityType] = useState("all");
  const [activityPage, setActivityPage] = useState(1);
  const [isLoadingMoreActivity, setIsLoadingMoreActivity] = useState(false);
  const [isTagActionLoading, setIsTagActionLoading] = useState(false);
  const [isMessaging, setIsMessaging] = useState(false);
  const [activityItems, setActivityItems] = useState<NonNullable<typeof player>["activities"]>([]);

  const messagingTemplates = useMemo(() => templates.filter((template) => template.active), [templates]);

  const activeTemplateId = useMemo(() => {
    if (templateId !== "all") return Number(templateId);
    return messagingTemplates[0]?.id;
  }, [templateId, messagingTemplates]);

  useEffect(() => {
    setActivityPage(1);
    setActivityItems([]);
    fetchPlayer(playerKey, activityType === "all" ? undefined : activityType, 1, 20);
    fetchTemplates();
  }, [fetchPlayer, fetchTemplates, playerKey, activityType]);

  useEffect(() => {
    setActivityItems(player?.activities || []);
  }, [player?.activities]);

  const addTag = async () => {
    const normalized = tagInput.trim().toLowerCase();
    if (!normalized) return;
    setIsTagActionLoading(true);
    const result = await updatePlayerTag(playerKey, "add", normalized);
    if (result.success) {
      setTagInput("");
      await fetchPlayer(playerKey);
      toast.success(t("players.tagAdded", { tag: normalized }));
    } else {
      toast.error(t("players.tagActionFailed"));
    }
    setIsTagActionLoading(false);
  };

  const removeTag = async (tag: string) => {
    setIsTagActionLoading(true);
    const result = await updatePlayerTag(playerKey, "remove", tag);
    if (result.success) {
      await fetchPlayer(playerKey);
      toast.success(t("players.tagRemoved", { tag }));
    } else {
      toast.error(t("players.tagActionFailed"));
    }
    setIsTagActionLoading(false);
  };

  const messagePlayer = async () => {
    if (!activeTemplateId) {
      toast.error(t("players.selectTemplateFirst"));
      return;
    }

    setIsMessaging(true);
    const result = await generateWhatsappLink(activeTemplateId, playerKey);
    if (!result.success || !result.data?.whatsapp_link) {
      toast.error(t("players.whatsappFailed"));
      setIsMessaging(false);
      return;
    }

    window.open(result.data.whatsapp_link, "_blank", "noopener,noreferrer");
    toast.success(t("players.whatsappOpened"));
    setIsMessaging(false);
  };

  const inactiveSuggestion = player?.last_activity_date
    ? new Date(player.last_activity_date) <= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    : true;
  const frequentSuggestion = (player?.total_bookings || 0) >= 3;

  const getActivityLabel = (value: string) => {
    const labels: Record<string, string> = {
      booking: t("players.activityBooking"),
      cancel: t("players.activityCancel"),
      match_played: t("players.activityMatchPlayed"),
      tournament_join: t("players.activityTournamentJoin"),
      no_show: t("players.activityNoShow"),
    };

    return labels[value] || value;
  };

  const getActivityMetadataLabel = (key: string) => {
    const labels: Record<string, string> = {
      booking_id: t("players.metaBookingId"),
      tournament_id: t("players.metaTournamentId"),
      registration_id: t("players.metaRegistrationId"),
      match_id: t("players.metaMatchId"),
      team_id: t("players.metaTeamId"),
      winner_id: t("players.metaWinnerId"),
      reason: t("players.metaReason"),
      date: t("players.metaDate"),
      player_name: t("players.metaPlayerName"),
      user_name: t("players.metaUserName"),
      user_phone: t("players.metaPhone"),
      player_phone: t("players.metaPhone"),
      score: t("players.metaScore"),
    };

    return labels[key] || key;
  };

  const loadMoreActivity = async () => {
    if (!player?.activities_meta?.has_more) return;

    const nextPage = activityPage + 1;
    setIsLoadingMoreActivity(true);
    const result = await fetchPlayer(playerKey, activityType === "all" ? undefined : activityType, nextPage, 20);
    if (!result.success || !result.data) {
      toast.error(t("players.activityLoadFailed"));
      setIsLoadingMoreActivity(false);
      return;
    }

    setActivityPage(nextPage);
    setActivityItems((prev) => [...prev, ...(result.data?.activities || [])]);
    setIsLoadingMoreActivity(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{player?.name || t("players.profile")}</h1>
          <p className="text-sm text-muted-foreground">{player?.phone}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {player?.player_type && <Badge variant="outline">{player.player_type}</Badge>}
            {player?.skill_level && <Badge variant="outline">{player.skill_level}</Badge>}
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href="/crm/players">{t("players.backToList")}</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
              <Button key={tag} variant="secondary" size="sm" onClick={() => removeTag(tag)} aria-label={t("players.removeTagAria", { tag })}>
                {tag} <X className="ml-1 h-3 w-3" />
              </Button>
            ))}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder={t("players.tagPlaceholder")} />
            <Button disabled={loading || isTagActionLoading || !tagInput.trim()} onClick={addTag}>
              {isTagActionLoading ? t("players.updatingTag") : t("players.addTag")}
            </Button>
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
                {messagingTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id.toString()}>{template.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button disabled={isMessaging} onClick={messagePlayer}>{isMessaging ? t("players.sending") : t("players.messageWhatsapp")}</Button>
          </div>

          {inactiveSuggestion && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <p className="font-medium">{t("players.reengageTitle")}</p>
              <p>{t("players.reengageSuggestion")}</p>
            </div>
          )}

          {frequentSuggestion && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              <p className="font-medium">{t("players.tournamentTitle")}</p>
              <p>{t("players.tournamentSuggestion")}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("players.activityHistory")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger>
                <SelectValue placeholder={t("players.activityType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("players.activityAll")}</SelectItem>
                <SelectItem value="booking">{t("players.activityBooking")}</SelectItem>
                <SelectItem value="cancel">{t("players.activityCancel")}</SelectItem>
                <SelectItem value="match_played">{t("players.activityMatchPlayed")}</SelectItem>
                <SelectItem value="tournament_join">{t("players.activityTournamentJoin")}</SelectItem>
                <SelectItem value="no_show">{t("players.activityNoShow")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {activityItems.map((activity) => (
              <div key={activity.id} className="border-b border-border pb-2">
                <div className="mb-1">
                  <Badge variant="outline">{getActivityLabel(activity.activity_type)}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("players.reference")} {activity.reference_type || "-"} #{activity.reference_id || "-"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("players.actor")} {activity.actor_admin_name || t("players.systemActor")}
                </p>
                {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {Object.entries(activity.metadata)
                      .slice(0, 3)
                      .map(([key, value]) => `${getActivityMetadataLabel(key)}: ${String(value)}`)
                      .join(" | ")}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">{formatDate(activity.created_at, "PP p")}</p>
              </div>
            ))}
            {!activityItems.length && (
              <div className="rounded-lg border border-dashed p-4">
                <p className="text-sm text-muted-foreground">{t("players.noActivity")}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("players.noActivityHint")}</p>
              </div>
            )}
            {Boolean(activityItems.length) && player?.activities_meta?.has_more && (
              <Button variant="outline" onClick={loadMoreActivity} disabled={isLoadingMoreActivity}>
                {isLoadingMoreActivity ? t("players.loadingMore") : t("players.loadMore")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
