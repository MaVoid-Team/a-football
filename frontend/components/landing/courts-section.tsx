"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { animate, createScope, stagger } from "animejs";
import { useCourtsAPI } from "@/hooks/api/use-courts";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { formatCurrency } from "@/lib/format-currency";
import { getDefaultBranchId } from "@/lib/branch";
import { CourtPerksDisplay } from "@/components/courts/court-perks-display";

export function CourtsSection() {
  const t = useTranslations("landing.courts");
  const { courts, loading, error, fetchPublicCourts } = useCourtsAPI();
  const root = useRef<HTMLElement>(null);
  const scope = useRef<ReturnType<typeof createScope> | null>(null);
  const animated = useRef(false);

  useEffect(() => {
    fetchPublicCourts({ branch_id: getDefaultBranchId() });
  }, [fetchPublicCourts]);

  useEffect(() => {
    if (loading) return;

    scope.current = createScope({ root }).add(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !animated.current) {
            animated.current = true;

            animate(".section-eyebrow", {
              opacity: [0, 1],
              translateY: [20, 0],
              duration: 600,
              easing: "easeOutExpo",
            });

            animate(".section-headline", {
              opacity: [0, 1],
              translateY: [30, 0],
              duration: 800,
              delay: 100,
              easing: "easeOutExpo",
            });

            animate(".court-card", {
              opacity: [0, 1],
              translateY: [40, 0],
              scale: [0.96, 1],
              delay: stagger(70, { start: 300 }),
              duration: 700,
              easing: "easeOutExpo",
            });

            observer.disconnect();
          }
        },
        { threshold: 0.06 },
      );

      const section = document.getElementById("courts");
      if (section) observer.observe(section);
    });

    return () => scope.current?.revert();
  }, [loading]);

  return (
    <section
      ref={root}
      id="courts"
      className="relative w-full py-24 overflow-hidden bg-muted/10 border-t border-border/40"
    >
      <div className="relative z-10 w-full px-8 md:px-16 lg:px-24">
        <div className="mb-16">
          <p className="section-eyebrow opacity-0 text-xs font-bold uppercase tracking-[0.25em] text-primary mb-4">
            {t("eyebrow")}
          </p>
          <h2 className="section-headline opacity-0 text-[clamp(2.5rem,5vw,4.5rem)] font-black tracking-[-0.03em] leading-none text-foreground">
            {t("title")}
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-6 border border-border/50 rounded-2xl bg-card space-y-4"
              >
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-8 w-1/2" />
                <div className="pt-4 mt-4 border-t border-border/40">
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 border border-destructive/20 bg-destructive/5 rounded-2xl text-center">
            <p className="text-destructive font-medium mb-2">
              {t("failedToLoad")}
            </p>
            <Button variant="outline" onClick={() => fetchPublicCourts()}>
              {t("tryAgain")}
            </Button>
          </div>
        ) : courts.length === 0 ? (
          <div className="p-12 border border-border/50 bg-card rounded-2xl text-center">
            <p className="text-muted-foreground text-lg">{t("noCourts")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courts.map((court) => (
              <div
                key={court.id}
                className="court-card opacity-0 group flex flex-col justify-between p-6 border border-border/50 rounded-2xl bg-card hover:bg-muted/30 transition-colors duration-300"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold tracking-tight">
                      {court.name}
                    </h3>
                    <Badge
                      variant={court.active ? "outline" : "secondary"}
                      className="bg-background shrink-0"
                    >
                      {court.active ? t("available") : t("maintenance")}
                    </Badge>
                  </div>
                  <div className="mb-6">
                    <span className="text-3xl font-black">
                      {formatCurrency(Number(court.price_per_hour))}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {" "}
                      {t("perHour")}
                    </span>
                  </div>
                  {court.perks && court.perks.length > 0 && (
                    <CourtPerksDisplay perks={court.perks} className="mb-4" />
                  )}
                </div>
                <div className="pt-4 border-t border-border/40">
                  {court.active ? (
                    <Button
                      asChild
                      className="w-full font-semibold group-hover:gap-2 transition-all"
                    >
                      <Link href={`/book?court_id=${court.id}`}>
                        {t("bookNow")}
                      </Link>
                    </Button>
                  ) : (
                    <Button disabled className="w-full font-semibold">
                      {t("unavailable")}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
