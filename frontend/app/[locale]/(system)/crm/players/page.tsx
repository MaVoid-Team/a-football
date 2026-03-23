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

type PlayerStatusFilter = "all" | "active" | "warm" | "inactive";

export default function CrmPlayersPage() {
  const t = useTranslations("crm");
  const {
    players,
    segments,
    templates,
    pagination,
    loading,
    fetchPlayers,
    fetchSegmentPlayers,
    fetchSegments,
    createSegment,
    fetchTemplates,
    generateWhatsappLink,
    generateBulkWhatsappLinks,
  } = useCrmAPI();

  const [searchInput, setSearchInput] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [statusInput, setStatusInput] = useState<PlayerStatusFilter>("all");
  const [segmentIdInput, setSegmentIdInput] = useState("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [templateId, setTemplateId] = useState("all");
  const [isApplying, setIsApplying] = useState(false);
  const [messagingPlayerKey, setMessagingPlayerKey] = useState<string | null>(null);
  const [segmentName, setSegmentName] = useState("");
  const [segmentField, setSegmentField] = useState("last_activity_days");
  const [segmentOp, setSegmentOp] = useState("gte");
  const [segmentValue, setSegmentValue] = useState("7");
  const [isCreatingSegment, setIsCreatingSegment] = useState(false);
  const [bulkLinks, setBulkLinks] = useState<Array<{ player_key: string; whatsapp_link: string; message: string }>>([]);
  const [isGeneratingBulk, setIsGeneratingBulk] = useState(false);
  const [filters, setFilters] = useState<{
    search?: string;
    tags?: string;
    status?: string;
    segment_id?: number;
  }>({});

  const activeTemplateId = useMemo(() => {
    if (templateId !== "all") return Number(templateId);
    return templates.find((template) => template.active)?.id;
  }, [templateId, templates]);

  const messagingTemplates = useMemo(() => templates.filter((template) => template.active), [templates]);
  const selectedSegment = useMemo(
    () => segments.find((segment) => segment.id.toString() === segmentIdInput),
    [segments, segmentIdInput],
  );

  const summarizeSegmentRules = (conditions: Record<string, unknown> | undefined) => {
    const rules = Array.isArray(conditions?.rules) ? conditions.rules : [];
    if (!rules.length) return t("players.segmentNoRules");

    return rules
      .map((rule) => {
        const ruleRecord = rule as Record<string, unknown>;
        const field = String(ruleRecord.field || "");
        const op = String(ruleRecord.op || "");
        const value = String(ruleRecord.value || "");
        return `${field} ${op} ${value}`;
      })
      .join(" • ");
  };

  const load = async () => {
    if (filters.segment_id) {
      return fetchSegmentPlayers(filters.segment_id, {
        page,
        per_page: perPage,
        search: filters.search,
        status: filters.status,
        tags: filters.tags,
      });
    }

    return fetchPlayers({
      page,
      per_page: perPage,
      search: filters.search,
      status: filters.status,
      tags: filters.tags,
    });
  };

  useEffect(() => {
    fetchSegments();
    fetchTemplates();
  }, [fetchSegments, fetchTemplates]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage, filters]);

  const onApply = async () => {
    setIsApplying(true);
    const nextFilters = {
      search: searchInput.trim() || undefined,
      tags: tagsInput.trim() || undefined,
      status: statusInput === "all" ? undefined : statusInput,
      segment_id: segmentIdInput === "all" ? undefined : Number(segmentIdInput),
    };

    setFilters(nextFilters);
    setPage(1);
    const result = await (nextFilters.segment_id
      ? fetchSegmentPlayers(nextFilters.segment_id, {
        page: 1,
        per_page: perPage,
        search: nextFilters.search,
        status: nextFilters.status,
        tags: nextFilters.tags,
      })
      : fetchPlayers({
        page: 1,
        per_page: perPage,
        search: nextFilters.search,
        status: nextFilters.status,
        tags: nextFilters.tags,
      }));
    if (!result.success) {
      toast.error(t("players.loadFailed"));
    }
    setIsApplying(false);
  };

  const onReset = async () => {
    setSearchInput("");
    setTagsInput("");
    setStatusInput("all");
    setSegmentIdInput("all");
    setFilters({});
    setPage(1);
    await fetchPlayers({ page: 1, per_page: perPage });
  };

  const onQuickMessage = async (playerKey: string) => {
    if (!activeTemplateId) {
      toast.error(t("players.selectTemplateFirst"));
      return;
    }

    setMessagingPlayerKey(playerKey);
    const result = await generateWhatsappLink(activeTemplateId, playerKey);
    if (!result.success || !result.data?.whatsapp_link) {
      toast.error(t("players.whatsappFailed"));
      setMessagingPlayerKey(null);
      return;
    }

    window.open(result.data.whatsapp_link, "_blank", "noopener,noreferrer");
    toast.success(t("players.whatsappOpened"));
    setMessagingPlayerKey(null);
  };

  const onCreateSegment = async () => {
    if (!segmentName.trim()) {
      toast.error(t("players.segmentNameRequired"));
      return;
    }

    setIsCreatingSegment(true);
    const result = await createSegment({
      name: segmentName.trim(),
      active: true,
      auto_update: true,
      conditions: {
        operator: "all",
        rules: [{ field: segmentField, op: segmentOp, value: Number(segmentValue) || segmentValue }],
      },
    });

    if (!result.success) {
      toast.error(t("players.segmentCreateFailed"));
      setIsCreatingSegment(false);
      return;
    }

    await fetchSegments();
    setSegmentName("");
    toast.success(t("players.segmentCreated"));
    setIsCreatingSegment(false);
  };

  const onGenerateBulkLinks = async () => {
    if (segmentIdInput === "all") {
      toast.error(t("players.selectSegmentForBulk"));
      return;
    }
    if (!activeTemplateId) {
      toast.error(t("players.selectTemplateFirst"));
      return;
    }

    setIsGeneratingBulk(true);
    const result = await generateBulkWhatsappLinks(Number(segmentIdInput), activeTemplateId);
    if (!result.success || !result.data) {
      toast.error(t("players.bulkGenerateFailed"));
      setIsGeneratingBulk(false);
      return;
    }

    setBulkLinks(result.data);
    toast.success(t("players.bulkGenerated", { count: result.data.length }));
    setIsGeneratingBulk(false);
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
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <Input
            placeholder={t("players.searchPlaceholder")}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />

          <Input
            placeholder={t("players.tagsPlaceholder")}
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />

          <Select value={statusInput} onValueChange={(value) => setStatusInput(value as PlayerStatusFilter)}>
            <SelectTrigger>
              <SelectValue placeholder={t("players.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("players.all")}</SelectItem>
              <SelectItem value="active">{t("players.active")}</SelectItem>
              <SelectItem value="warm">{t("players.warm")}</SelectItem>
              <SelectItem value="inactive">{t("players.inactive")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={segmentIdInput} onValueChange={setSegmentIdInput}>
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
              {messagingTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id.toString()}>{template.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
            <Button className="flex-1" onClick={onApply} disabled={loading || isApplying}>
              {loading || isApplying ? t("players.applying") : t("players.apply")}
            </Button>
            <Button className="flex-1" variant="outline" onClick={onReset} disabled={loading || isApplying}>
              {t("players.reset")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("players.segmentBuilder")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Input
            placeholder={t("players.segmentNamePlaceholder")}
            value={segmentName}
            onChange={(e) => setSegmentName(e.target.value)}
          />
          <Select value={segmentField} onValueChange={setSegmentField}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="last_activity_days">last_activity_days</SelectItem>
              <SelectItem value="total_bookings">total_bookings</SelectItem>
              <SelectItem value="total_tournaments">total_tournaments</SelectItem>
              <SelectItem value="no_show_count">no_show_count</SelectItem>
              <SelectItem value="tags">tags</SelectItem>
            </SelectContent>
          </Select>
          <Select value={segmentOp} onValueChange={setSegmentOp}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="gte">gte</SelectItem>
              <SelectItem value="lte">lte</SelectItem>
              <SelectItem value="gt">gt</SelectItem>
              <SelectItem value="lt">lt</SelectItem>
              <SelectItem value="eq">eq</SelectItem>
              <SelectItem value="includes">includes</SelectItem>
            </SelectContent>
          </Select>
          <Input value={segmentValue} onChange={(e) => setSegmentValue(e.target.value)} placeholder={t("players.segmentValue")} />
          <Button disabled={isCreatingSegment} onClick={onCreateSegment}>
            {isCreatingSegment ? t("players.creatingSegment") : t("players.createSegment")}
          </Button>
        </CardContent>
      </Card>

      {selectedSegment && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t("players.segmentDetails")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{selectedSegment.name}</Badge>
              <Badge variant="outline">
                {selectedSegment.active ? t("players.segmentActive") : t("players.segmentInactive")}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{summarizeSegmentRules(selectedSegment.conditions as Record<string, unknown>)}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {players.map((player) => (
              <div key={player.key} className="grid gap-3 rounded-lg border border-border p-3 md:grid-cols-[2fr_1fr_1fr_auto_auto] md:items-center">
                <div className="space-y-1">
                  <p className="font-medium">{player.name}</p>
                  <p className="text-xs text-muted-foreground">{player.phone} {player.email ? `• ${player.email}` : ""}</p>
                  <p className="text-xs text-muted-foreground">{t("players.lastActivity")}: {formatDate(player.last_activity_date, "PP")}</p>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline">{player.player_type}</Badge>
                    {player.skill_level && <Badge variant="outline">{player.skill_level}</Badge>}
                    {typeof player.player_score === "number" && (
                      <Badge variant="secondary">{t("players.score")}: {player.player_score}</Badge>
                    )}
                    {(player.behavior_flags || []).map((flag) => (
                      <Badge key={flag} variant="outline">{flag}</Badge>
                    ))}
                  </div>
                </div>

                <div className="text-sm">
                  <p>{t("players.bookings")}: {player.total_bookings}</p>
                  <p>{t("players.matches")}: {player.total_matches}</p>
                  <p>{t("players.tournaments")}: {player.total_tournaments}</p>
                  <p>{t("players.noShows")}: {player.no_show_count || 0}</p>
                </div>

                <div className="flex max-w-full flex-wrap gap-1">
                  {(player.tags || []).slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                  {(player.tags || []).length > 3 && (
                    <Badge variant="secondary">+{(player.tags || []).length - 3}</Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:contents">
                  <Button variant="outline" asChild className="w-full md:w-auto">
                    <Link href={`/crm/players/${player.key}`}>{t("players.viewProfile")}</Link>
                  </Button>

                  <Button
                    className="w-full md:w-auto"
                    disabled={loading || messagingPlayerKey === player.key}
                    onClick={() => onQuickMessage(player.key)}
                  >
                    {messagingPlayerKey === player.key ? t("players.sending") : t("players.messageWhatsapp")}
                  </Button>
                </div>
              </div>
            ))}

            {!players.length && (
              <div className="rounded-lg border border-dashed p-4">
                <p className="text-sm text-muted-foreground">{t("players.empty")}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("players.emptyHint")}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={onReset}>{t("players.reset")}</Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/crm/templates">{t("players.openTemplates")}</Link>
                  </Button>
                </div>
              </div>
            )}
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

      <Card>
        <CardHeader>
          <CardTitle>{t("players.bulkActions")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button disabled={isGeneratingBulk} onClick={onGenerateBulkLinks}>
            {isGeneratingBulk ? t("players.generatingBulk") : t("players.generateBulkWhatsapp")}
          </Button>
          {bulkLinks.length > 0 && (
            <div className="space-y-2">
              {bulkLinks.slice(0, 20).map((item) => (
                <div key={item.player_key} className="rounded-md border border-border p-2 text-xs">
                  <p className="font-medium">{item.player_key}</p>
                  <a href={item.whatsapp_link} target="_blank" rel="noreferrer" className="text-primary underline">
                    {t("players.openGeneratedLink")}
                  </a>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
