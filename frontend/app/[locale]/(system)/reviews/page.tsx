"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useReviewsAPI } from "@/hooks/api/use-reviews";
import { useCourtsAPI } from "@/hooks/api/use-courts";
import { useBranchesAPI } from "@/hooks/api/use-branches";
import { usePagination } from "@/hooks/code/use-pagination";
import { PaginationControls } from "@/components/shared/pagination-controls";

import { StarRating } from "@/components/reviews/star-rating";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/auth-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  MessageSquare,
  Star,
  Trash2,
  User,
  CalendarDays,
  TrendingUp,
} from "lucide-react";
import { formatDate } from "@/lib/format-date";

export default function ReviewsPage() {
  const { admin } = useAuthContext();

  const tPage = useTranslations("reviews.page");
  const tBadge = useTranslations("reviews.badge");
  const tDel = useTranslations("reviews.delete");
  const tToast = useTranslations("reviews.toast");
  const tStars = useTranslations("reviews.starsFilter");

  const [filterCourtId, setFilterCourtId] = useState<string>("all");
  const [filterRating, setFilterRating] = useState<string>("all");

  const { reviews, pagination, loading, fetchAdminReviews, deleteReview } =
    useReviewsAPI();
  const { courts, fetchCourts } = useCourtsAPI();
  const { branches, fetchBranches } = useBranchesAPI();
  const { page, perPage, goToPage, changePerPage } = usePagination(1, 25);

  const loadData = () => {
    const params: any = { page, per_page: perPage };
    if (filterCourtId !== "all") params.court_id = Number(filterCourtId);
    if (filterRating !== "all") params.rating = Number(filterRating);
    fetchAdminReviews(params);
  };

  useEffect(() => {
    fetchBranches();
    fetchCourts({ per_page: 500 });
  }, [fetchBranches, fetchCourts]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage, filterCourtId, filterRating]);

  const handleDelete = async (id: string) => {
    const res = await deleteReview(id);
    if (res.success) {
      toast.success(tToast("deleted"));
      loadData();
    }
  };

  // Derived stats from current page
  const totalOnPage = reviews.length;
  const avgOnPage =
    totalOnPage > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / totalOnPage).toFixed(1)
      : "—";

  const totalReviews = pagination?.totalCount ?? 0;

  const getCourtName = (court_id: number) =>
    courts.find((c) => Number(c.id) === court_id)?.name ?? `Court #${court_id}`;

  const getRatingBadge = (rating: number) => {
    if (rating >= 5)
      return (
        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0 text-xs font-semibold">
          {tBadge("excellent")}
        </Badge>
      );
    if (rating >= 4)
      return (
        <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-0 text-xs font-semibold">
          {tBadge("great")}
        </Badge>
      );
    if (rating >= 3)
      return (
        <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-0 text-xs font-semibold">
          {tBadge("good")}
        </Badge>
      );
    if (rating >= 2)
      return (
        <Badge className="bg-orange-500/15 text-orange-600 dark:text-orange-400 border-0 text-xs font-semibold">
          {tBadge("fair")}
        </Badge>
      );
    return (
      <Badge className="bg-red-500/15 text-red-600 dark:text-red-400 border-0 text-xs font-semibold">
        {tBadge("poor")}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {tPage("title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {tPage("subtitle")}
          </p>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {tPage("totalReviews")}
            </p>
            <p className="text-2xl font-black tabular-nums">{totalReviews}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {tPage("avgRating")}
            </p>
            <p className="text-2xl font-black tabular-nums">{avgOnPage}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 col-span-2 md:col-span-1">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {tPage("fiveStarReviews")}
            </p>
            <p className="text-2xl font-black tabular-nums">
              {reviews.filter((r) => r.rating === 5).length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          {/* Court filter */}
          <div className="flex items-center gap-2">
            <Label className="text-sm text-muted-foreground whitespace-nowrap">
              {tPage("filterCourt")}:
            </Label>
            <Select
              value={filterCourtId}
              onValueChange={(v) => {
                setFilterCourtId(v);
                goToPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={tPage("allCourts")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tPage("allCourts")}</SelectItem>
                {courts.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rating filter */}
          <div className="flex items-center gap-2">
            <Label className="text-sm text-muted-foreground whitespace-nowrap">
              {tPage("filterRating")}:
            </Label>
            <Select
              value={filterRating}
              onValueChange={(v) => {
                setFilterRating(v);
                goToPage(1);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={tPage("allRatings")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tPage("allRatings")}</SelectItem>
                {(["5", "4", "3", "2", "1"] as const).map((r) => (
                  <SelectItem key={r} value={r}>
                    {tStars(r)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Reviews list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner size={36} />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="mx-auto w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">
              {tPage("noReviewsFound")}
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {tPage("noReviewsDesc")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="group flex flex-col sm:flex-row sm:items-start gap-4 p-4 rounded-xl border border-border/60 bg-muted/10 hover:bg-muted/20 transition-colors duration-200"
              >
                {/* Left: avatar + name */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-sm uppercase">
                    {review.reviewer_name.slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground text-sm">
                        {review.reviewer_name}
                      </span>
                      {getRatingBadge(review.rating)}
                    </div>

                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <StarRating value={review.rating} readonly size="sm" />
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {formatDate(review.created_at)}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {getCourtName(review.court_id)}
                      </span>
                    </div>

                    {review.body ? (
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {review.body}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground/50 italic">
                        {tPage("noWrittenReview")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: delete */}
                <div className="flex sm:flex-col items-center gap-2 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                  <ConfirmDialog
                    title={tDel("title")}
                    description={tDel("description", {
                      name: review.reviewer_name,
                    })}
                    onConfirm={() => handleDelete(review.id)}
                    triggerButton={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title={tDel("title")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {pagination && (
          <PaginationControls
            pagination={pagination}
            onPageChange={goToPage}
            onPerPageChange={changePerPage}
          />
        )}
      </div>
    </div>
  );
}
