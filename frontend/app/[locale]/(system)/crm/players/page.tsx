"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCrmAPI } from "@/hooks/api/use-crm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { formatDate } from "@/lib/format-date";
import { toast } from "sonner";

export default function CrmPlayersPage() {
  const t = useTranslations("crm");
  const {
    players,
    segments,
    templates,
    pagination,
    loading,
    fetchPlayers,
    fetchSegments,
    fetchTemplates,
    generateWhatsappLink,
  } = useCrmAPI();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [segmentId, setSegmentId] = useState("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [templateId, setTemplateId] = useState("all");

  const activeTemplateId = useMemo(() => {
    if (templateId !== "all") return Number(templateId);
    return templates[0]?.id;
  }, [templateId, templates]);

  const load = () => {
    fetchPlayers({
      page,
      per_page: perPage,
      search: search || undefined,
      status: status === "all" ? undefined : status,
      segment_id: segmentId === "all" ? undefined : Number(segmentId),
    });
  };

  useEffect(() => {
    fetchSegments();
    fetchTemplates();
  }, [fetchSegments, fetchTemplates]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage, status, segmentId]);

  const onSearch = () => {
    setPage(1);
    load();
  };

  const onQuickMessage = async (playerKey: string) => {
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

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("players.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("players.subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("players.filters")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5">
          <Input
            placeholder={t("players.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder={t("players.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("players.all")}</SelectItem>
              <SelectItem value="active">{t("players.active")}</SelectItem>
              <SelectItem value="inactive">{t("players.inactive")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={segmentId} onValueChange={setSegmentId}>
            <SelectTrigger>
              <SelectValue placeholder={t("players.segment")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("players.allSegments")}</SelectItem>
              {segments.map((segment) => (
                <SelectItem key={segment.id} value={segment.id.toString()}>{segment.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

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

          <Button onClick={onSearch}>{t("players.apply")}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {players.map((player) => (
              <div key={player.key} className="grid gap-3 border border-border rounded-lg p-3 md:grid-cols-[2fr_1fr_1fr_auto_auto] items-center">
                <div>
                  <p className="font-medium">{player.name}</p>
                  <p className="text-xs text-muted-foreground">{player.phone} {player.email ? `• ${player.email}` : ""}</p>
                  <p className="text-xs text-muted-foreground">{t("players.lastActivity")}: {formatDate(player.last_activity_date, "PP")}</p>
                </div>

                <div className="text-sm">
                  <p>{t("players.bookings")}: {player.total_bookings}</p>
                  <p>{t("players.matches")}: {player.total_matches}</p>
                </div>

                <div className="flex gap-1 flex-wrap">
                  {(player.tags || []).map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>

                <Button variant="outline" asChild>
                  <Link href={`/crm/players/${player.key}`}>{t("players.viewProfile")}</Link>
                </Button>

                <Button disabled={loading} onClick={() => onQuickMessage(player.key)}>
                  {t("players.messageWhatsapp")}
                </Button>
              </div>
            ))}

            {!players.length && <p className="text-sm text-muted-foreground">{t("players.empty")}</p>}
          </div>

          {pagination && (
            <PaginationControls
              pagination={pagination}
              onPageChange={setPage}
              onPerPageChange={(value) => {
                setPerPage(value);
                setPage(1);
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
