"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useReviewsAPI } from "@/hooks/api/use-reviews";
import { StarRating } from "@/components/reviews/star-rating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Booking } from "@/schemas/booking.schema";
import { CheckCircle2, MessageSquare, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ReviewPromptProps {
  booking: Booking;
  courtName: string;
}

type PromptState = "idle" | "writing" | "submitting" | "done";

export function ReviewPrompt({ booking, courtName }: ReviewPromptProps) {
  const t = useTranslations("reviewPrompt");

  const [state, setState] = useState<PromptState>("idle");
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  const { createReview } = useReviewsAPI();

  const ratingLabels: Record<number, string> = {
    1: t("ratingLabel.1"),
    2: t("ratingLabel.2"),
    3: t("ratingLabel.3"),
    4: t("ratingLabel.4"),
    5: t("ratingLabel.5"),
  };

  const handleRatingClick = (value: number) => {
    setRating(value);
    if (state === "idle") setState("writing");
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error(t("errorNoRating"));
      return;
    }

    setState("submitting");

    const result = await createReview({
      booking_id: booking.id,
      user_phone: booking.user_phone,
      rating,
      body: body.trim() || undefined,
    });

    if (result.success) {
      setState("done");
      toast.success(t("successSubmitted"));
    } else {
      setState("writing");
      // toast is already shown by the axios interceptor
    }
  };

  /* ── Done state ── */
  if (state === "done") {
    return (
      <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 flex flex-col items-center gap-3 text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <p className="font-semibold text-foreground">{t("doneTitle")}</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("doneThanks", { courtName })}
          </p>
        </div>
        <StarRating value={rating} readonly size="sm" />
      </div>
    );
  }

  /* ── Idle + Writing + Submitting states ── */
  return (
    <div
      className={cn(
        "mt-6 rounded-2xl border border-border/60 bg-muted/20 p-6 transition-all duration-300",
        state !== "idle" && "border-primary/30 bg-primary/5",
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <p className="font-semibold text-foreground leading-tight">
            {t("header")}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("subheader", { courtName })}
          </p>
        </div>
      </div>

      {/* Star selector */}
      <div className="flex items-center gap-3 mb-1">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => {
            const filled = star <= (hoverRating || rating);
            return (
              <button
                key={star}
                type="button"
                disabled={state === "submitting"}
                onClick={() => handleRatingClick(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
              >
                <svg
                  viewBox="0 0 24 24"
                  className={cn(
                    "w-8 h-8 transition-colors duration-100",
                    filled
                      ? "fill-amber-400 text-amber-400"
                      : "fill-muted text-muted-foreground/20",
                  )}
                  aria-hidden="true"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            );
          })}
        </div>

        {(hoverRating > 0 || rating > 0) && (
          <span className="text-sm font-semibold text-amber-500 animate-in fade-in duration-150">
            {ratingLabels[hoverRating || rating]}
          </span>
        )}
      </div>

      {/* Review textarea — shown once a rating is picked */}
      {state !== "idle" && (
        <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t("placeholder")}
            disabled={state === "submitting"}
            className="resize-none min-h-[90px] bg-background/80 text-sm"
            maxLength={500}
          />
          {body.length > 0 && (
            <p className="text-xs text-muted-foreground text-end mt-1">
              {body.length} / 500
            </p>
          )}

          <div className="flex justify-end mt-3">
            <Button
              onClick={handleSubmit}
              disabled={state === "submitting" || rating === 0}
              size="sm"
              className="font-semibold px-6"
            >
              {state === "submitting" ? (
                <>
                  <Loader2 className="w-4 h-4 me-2 animate-spin" />
                  {t("submitting")}
                </>
              ) : (
                t("submit")
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
