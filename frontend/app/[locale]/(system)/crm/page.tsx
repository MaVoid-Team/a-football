"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useCrmAPI } from "@/hooks/api/use-crm";
import { formatDate } from "@/lib/format-date";

export default function CrmDashboardPage() {
  const t = useTranslations("crm");
  const { dashboard, loading, fetchDashboard } = useCrmAPI();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("dashboard.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("dashboard.subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/crm/players">{t("actions.openPlayers")}</Link>
          </Button>
          <Button asChild>
            <Link href="/crm/templates">{t("actions.openTemplates")}</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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
                      <p className="font-medium">{player.name}</p>
                      <p className="text-xs text-muted-foreground">{player.phone}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p>{t("dashboard.bookings", { count: player.total_bookings })}</p>
                      <p className="text-muted-foreground">{t("dashboard.matches", { count: player.total_matches })}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">{t("dashboard.noData")}</p>
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
                <p className="text-sm text-muted-foreground">{t("dashboard.noActivity")}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
