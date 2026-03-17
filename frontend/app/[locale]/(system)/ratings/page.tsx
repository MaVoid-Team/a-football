"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useReviewsAPI } from "@/hooks/api/use-reviews";
import { useBranchesAPI } from "@/hooks/api/use-branches";
import { StarRating } from "@/components/reviews/star-rating";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CourtRating } from "@/schemas/review.schema";
import {
  Star,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Building2,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function RatingsPage() {
  const tPage = useTranslations("ratings.page");
  const tLabel = useTranslations("ratings.label");
  const t = useTranslations("ratings");

  const { ratings, loading, fetchRatings } = useReviewsAPI();
  const { branches, fetchBranches } = useBranchesAPI();

  const [filterBranchId, setFilterBranchId] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"avg_desc" | "avg_asc" | "total_desc">(
    "avg_desc",
  );

  useEffect(() => {
    fetchBranches();
    fetchRatings();
  }, [fetchBranches, fetchRatings]);

  const filteredCourts: CourtRating[] = (() => {
    if (!ratings) return [];
    let list = ratings.courts;
    if (filterBranchId !== "all") {
      list = list.filter((c) => c.branch_id === Number(filterBranchId));
    }
    return [...list].sort((a, b) => {
      if (sortBy === "avg_desc") return b.avg_rating - a.avg_rating;
      if (sortBy === "avg_asc") return a.avg_rating - b.avg_rating;
      return b.total_reviews - a.total_reviews;
    });
  })();

  const starColors: Record<number, string> = {
    5: "bg-emerald-500",
    4: "bg-blue-500",
    3: "bg-amber-400",
    2: "bg-orange-400",
    1: "bg-red-500",
  };

  const starBg: Record<number, string> = {
    5: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    4: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    3: "bg-amber-400/10 text-amber-600 dark:text-amber-400",
    2: "bg-orange-400/10 text-orange-600 dark:text-orange-400",
    1: "bg-red-500/10 text-red-600 dark:text-red-400",
  };

  const getRatingLabel = (avg: number) => {
    if (avg === 0)
      return { label: tLabel("noRatings"), color: "text-muted-foreground" };
    if (avg >= 4.5)
      return { label: tLabel("excellent"), color: "text-emerald-500" };
    if (avg >= 4.0) return { label: tLabel("great"), color: "text-blue-500" };
    if (avg >= 3.0) return { label: tLabel("good"), color: "text-amber-500" };
    if (avg >= 2.0) return { label: tLabel("fair"), color: "text-orange-500" };
    return { label: tLabel("poor"), color: "text-red-500" };
  };

  const topCourt = filteredCourts.find((c) => c.total_reviews > 0);
  const bottomCourt = [...filteredCourts]
    .reverse()
    .find((c) => c.total_reviews > 0);

  const courtCountLabel = (count: number) =>
    t(count === 1 ? "courtCount" : "courtCountPlural", { count });

  const reviewCountLabel = (count: number) =>
    t(count === 1 ? "reviewCount" : "reviewCountPlural", { count });

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {tPage("title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {tPage("subtitle")}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <LoadingSpinner size={40} />
        </div>
      ) : !ratings ? (
        <div className="text-center py-32 text-muted-foreground">
          {tPage("failedToLoad")}
        </div>
      ) : (
        <>
          {/* Overall stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  {tPage("overallAvg")}
                </p>
                <p className="text-2xl font-black tabular-nums">
                  {ratings.overall_total_reviews > 0
                    ? ratings.overall_avg_rating.toFixed(1)
                    : "—"}
                </p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  {tPage("totalReviews")}
                </p>
                <p className="text-2xl font-black tabular-nums">
                  {ratings.overall_total_reviews}
                </p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  {tPage("topCourt")}
                </p>
                <p className="text-sm font-bold leading-tight mt-0.5 line-clamp-1">
                  {topCourt ? topCourt.court_name : "—"}
                </p>
                {topCourt && (
                  <p className="text-xs text-emerald-500 font-semibold">
                    {topCourt.avg_rating.toFixed(1)} ★
                  </p>
                )}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  {tPage("needsAttention")}
                </p>
                <p className="text-sm font-bold leading-tight mt-0.5 line-clamp-1">
                  {bottomCourt &&
                  bottomCourt.court_name !== topCourt?.court_name
                    ? bottomCourt.court_name
                    : "—"}
                </p>
                {bottomCourt &&
                  bottomCourt.court_name !== topCourt?.court_name && (
                    <p className="text-xs text-red-500 font-semibold">
                      {bottomCourt.avg_rating.toFixed(1)} ★
                    </p>
                  )}
              </div>
            </div>
          </div>

          {/* Filters + Sort */}
          <div className="bg-card border border-border rounded-xl shadow-sm p-4">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Label className="text-sm text-muted-foreground whitespace-nowrap">
                  {tPage("filterBranch")}:
                </Label>
                <Select
                  value={filterBranchId}
                  onValueChange={setFilterBranchId}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={tPage("allBranches")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{tPage("allBranches")}</SelectItem>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={b.id.toString()}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-sm text-muted-foreground whitespace-nowrap">
                  {tPage("sortBy")}:
                </Label>
                <Select
                  value={sortBy}
                  onValueChange={(v) => setSortBy(v as typeof sortBy)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="avg_desc">
                      {tPage("highestRated")}
                    </SelectItem>
                    <SelectItem value="avg_asc">
                      {tPage("lowestRated")}
                    </SelectItem>
                    <SelectItem value="total_desc">
                      {tPage("mostReviewed")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="ms-auto flex items-center gap-1.5 text-sm text-muted-foreground">
                <BarChart3 className="w-4 h-4" />
                <span>{courtCountLabel(filteredCourts.length)}</span>
              </div>
            </div>

            {filteredCourts.length === 0 ? (
              <div className="text-center py-16">
                <Building2 className="mx-auto w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-medium">
                  {tPage("noCourtsFound")}
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  {tPage("noCourtsDesc")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredCourts.map((court) => {
                  const { label, color } = getRatingLabel(court.avg_rating);
                  const hasReviews = court.total_reviews > 0;

                  return (
                    <div
                      key={court.court_id}
                      className="rounded-xl border border-border/60 bg-muted/10 hover:bg-muted/20 transition-colors duration-200 p-5 flex flex-col gap-4"
                    >
                      {/* Court header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-bold text-foreground tracking-tight truncate">
                              {court.court_name}
                            </h3>
                          </div>
                          {court.branch_name && (
                            <p className="text-xs text-muted-foreground">
                              {court.branch_name}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className="shrink-0 text-xs font-semibold border-border/60"
                        >
                          {reviewCountLabel(court.total_reviews)}
                        </Badge>
                      </div>

                      {/* Avg rating display */}
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "text-4xl font-black tabular-nums",
                            hasReviews
                              ? "text-foreground"
                              : "text-muted-foreground/40",
                          )}
                        >
                          {hasReviews ? court.avg_rating.toFixed(1) : "—"}
                        </span>
                        <div>
                          {hasReviews ? (
                            <StarRating
                              value={Math.round(court.avg_rating)}
                              readonly
                              size="sm"
                            />
                          ) : (
                            <StarRating value={0} readonly size="sm" />
                          )}
                          <p
                            className={cn(
                              "text-xs font-semibold mt-0.5",
                              color,
                            )}
                          >
                            {label}
                          </p>
                        </div>
                      </div>

                      {/* Rating distribution */}
                      <div className="space-y-1.5">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count =
                            court.distribution[
                              star as keyof typeof court.distribution
                            ] ?? 0;
                          const pct = hasReviews
                            ? Math.round((count / court.total_reviews) * 100)
                            : 0;

                          return (
                            <div
                              key={star}
                              className="flex items-center gap-2 text-xs"
                            >
                              <span className="w-3 text-muted-foreground text-right shrink-0">
                                {star}
                              </span>
                              <Star className="w-3 h-3 fill-muted-foreground/40 text-muted-foreground/40 shrink-0" />
                              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all duration-500",
                                    starColors[star],
                                  )}
                                  style={{
                                    width: `${pct}%`,
                                  }}
                                />
                              </div>
                              <span
                                className={cn(
                                  "w-7 text-right font-medium tabular-nums shrink-0",
                                  count > 0
                                    ? starBg[star].split(" ")[1]
                                    : "text-muted-foreground/40",
                                )}
                              >
                                {count}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Percentage breakdown footer */}
                      {hasReviews && (
                        <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {t("positiveLabel", {
                              pct: Math.round(
                                (((court.distribution[4] ?? 0) +
                                  (court.distribution[5] ?? 0)) /
                                  court.total_reviews) *
                                  100,
                              ),
                            })}
                          </span>
                          <span>
                            {t("negativeLabel", {
                              pct: Math.round(
                                (((court.distribution[1] ?? 0) +
                                  (court.distribution[2] ?? 0)) /
                                  court.total_reviews) *
                                  100,
                              ),
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
