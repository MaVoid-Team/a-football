"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useCrmAPI } from "@/hooks/api/use-crm";
import { formatDate } from "@/lib/format-date";
import { CrmOnboardingChecklist } from "@/components/crm/crm-onboarding-checklist";

export default function CrmDashboardPage() {
  const t = useTranslations("crm");
  const { dashboard, loading, fetchDashboard } = useCrmAPI();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("dashboard.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("dashboard.subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
          <Button asChild variant="outline" className="w-full">
            <Link href="/crm/players">{t("actions.openPlayers")}</Link>
          </Button>
          <Button asChild className="w-full">
            <Link href="/crm/templates">{t("actions.openTemplates")}</Link>
          </Button>
          <Button asChild variant="secondary" className="w-full">
            <Link href="/crm/actions">{t("actions.openActionCenter")}</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/crm/automations">{t("actions.openAutomations")}</Link>
          </Button>
        </div>
      </div>

      <CrmOnboardingChecklist />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t("dashboard.totalPlayers")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : dashboard?.total_players ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t("dashboard.activePlayers")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : dashboard?.active_players ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t("dashboard.inactivePlayers")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : dashboard?.inactive_players ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.insightsTitle")}</CardTitle>
          <CardDescription>{t("dashboard.insightsHint")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(dashboard?.insight_cards || []).map((insight) => (
              <div key={insight.key} className="rounded-lg border border-border p-3">
                <p className="text-2xl font-bold">{insight.count}</p>
                <p className="mt-1 text-sm text-muted-foreground">{insight.message}</p>
                {insight.action_path && (
                  <Button asChild size="sm" variant="outline" className="mt-3">
                    <Link href={insight.action_path}>{t("dashboard.takeAction")}</Link>
                  </Button>
                )}
              </div>
            ))}
            {!dashboard?.insight_cards?.length && (
              <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                {t("dashboard.noInsights")}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.topPlayers")}</CardTitle>
            <CardDescription>{t("dashboard.topPlayersHint")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboard?.top_players?.length ? (
                dashboard.top_players.slice(0, 8).map((player) => (
                  <div key={player.key} className="flex items-center justify-between border-b border-border pb-2">
                    <div>
                      <Link href={`/crm/players/${player.key}`} className="font-medium hover:underline">
                        {player.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{player.phone}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p>{t("dashboard.bookings", { count: player.total_bookings })}</p>
                      <p className="text-muted-foreground">{t("dashboard.matches", { count: player.total_matches })}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed p-4">
                  <p className="text-sm text-muted-foreground">{t("dashboard.noData")}</p>
                  <Button asChild size="sm" variant="outline" className="mt-3">
                    <Link href="/crm/players">{t("dashboard.openPlayersCta")}</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.recentActivity")}</CardTitle>
            <CardDescription>{t("dashboard.recentActivityHint")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboard?.recent_activity?.length ? (
                dashboard.recent_activity.slice(0, 12).map((activity) => (
                  <div key={activity.id} className="border-b border-border pb-2">
                    <p className="text-sm font-medium">{activity.player_name || t("dashboard.unknownPlayer")}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.activity_type} • {formatDate(activity.created_at, "PP p")}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed p-4">
                  <p className="text-sm text-muted-foreground">{t("dashboard.noActivity")}</p>
                  <Button asChild size="sm" variant="outline" className="mt-3">
                    <Link href="/crm/templates">{t("dashboard.openTemplatesCta")}</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
