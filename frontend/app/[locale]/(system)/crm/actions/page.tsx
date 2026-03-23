"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { useCrmAPI } from "@/hooks/api/use-crm";
import { formatDate } from "@/lib/format-date";
import { toast } from "sonner";

export default function CrmActionCenterPage() {
  const t = useTranslations("crm");
  const {
    actionItems,
    loading,
    fetchActionItems,
    updateActionItemStatus,
    generateActionItemWhatsappLink,
  } = useCrmAPI();

  const [statusFilter, setStatusFilter] = useState("pending");
  const [activeActionId, setActiveActionId] = useState<number | null>(null);

  useEffect(() => {
    fetchActionItems({ status: statusFilter === "all" ? undefined : statusFilter });
  }, [fetchActionItems, statusFilter]);

  const pendingCount = useMemo(() => actionItems.filter((item) => item.status === "pending").length, [actionItems]);

  const openWhatsapp = async (actionId: number) => {
    setActiveActionId(actionId);
    const result = await generateActionItemWhatsappLink(actionId);

    if (!result.success || !result.data?.whatsapp_link) {
      toast.error(t("actionCenter.whatsappFailed"));
      setActiveActionId(null);
      return;
    }

    window.open(result.data.whatsapp_link, "_blank", "noopener,noreferrer");
    toast.success(t("actionCenter.whatsappOpened"));
    setActiveActionId(null);
  };

  const markStatus = async (actionId: number, status: "completed" | "ignored") => {
    setActiveActionId(actionId);
    const result = await updateActionItemStatus(actionId, status);

    if (!result.success) {
      toast.error(t("actionCenter.updateFailed"));
      setActiveActionId(null);
      return;
    }

    await fetchActionItems({ status: statusFilter === "all" ? undefined : statusFilter });
    toast.success(status === "completed" ? t("actionCenter.markedCompleted") : t("actionCenter.markedIgnored"));
    setActiveActionId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("actionCenter.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("actionCenter.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{t("actionCenter.pendingCount", { count: pendingCount })}</Badge>
          <Button asChild variant="outline">
            <Link href="/crm/players">{t("actionCenter.openPlayers")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/crm/automations">{t("actionCenter.openAutomations")}</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("actionCenter.queue")}</CardTitle>
          <CardDescription>{t("actionCenter.queueHint")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-xs">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t("actionCenter.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("actionCenter.all")}</SelectItem>
                <SelectItem value="pending">{t("actionCenter.pending")}</SelectItem>
                <SelectItem value="completed">{t("actionCenter.completed")}</SelectItem>
                <SelectItem value="ignored">{t("actionCenter.ignored")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {actionItems.map((item) => (
              <div key={item.id} className="rounded-lg border border-border p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{item.reason}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.player_type}-{item.player_id} • {formatDate(item.created_at, "PP p")}
                    </p>
                    <Badge variant={item.status === "pending" ? "secondary" : "outline"}>{t(`actionCenter.${item.status}`)}</Badge>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={loading || activeActionId === item.id}
                      onClick={() => openWhatsapp(item.id)}
                    >
                      {t("actionCenter.openWhatsapp")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={loading || activeActionId === item.id || item.status !== "pending"}
                      onClick={() => markStatus(item.id, "completed")}
                    >
                      {t("actionCenter.complete")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={loading || activeActionId === item.id || item.status !== "pending"}
                      onClick={() => markStatus(item.id, "ignored")}
                    >
                      {t("actionCenter.ignore")}
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {!actionItems.length && (
              <div className="rounded-lg border border-dashed p-4">
                <p className="text-sm text-muted-foreground">{t("actionCenter.empty")}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("actionCenter.emptyHint")}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
