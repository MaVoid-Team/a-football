"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { animate, createScope, stagger } from "animejs";
import { useEventsAPI } from "@/hooks/api/use-events";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { formatCurrency } from "@/lib/format-currency";
import { formatDate } from "@/lib/format-date";
import { CalendarIcon, UsersIcon } from "lucide-react";

export function EventsSection() {
  const t = useTranslations("landing.events");
  const { events, error, fetchPublicEvents } = useEventsAPI();
  const root = useRef<HTMLElement>(null);
  const scope = useRef<ReturnType<typeof createScope> | null>(null);
  const animated = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReady(false);

    async function load() {
      await fetchPublicEvents();
      if (cancelled) return;

      setReady(true);
    }

    load();
    return () => { cancelled = true; };
  }, [fetchPublicEvents]);

  useEffect(() => {
    if (!ready) return;

    scope.current = createScope({ root }).add(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !animated.current) {
            animated.current = true;

            animate(".events-eyebrow", {
              opacity: [0, 1],
              translateY: [20, 0],
              duration: 600,
              easing: "easeOutExpo",
            });

            animate(".events-headline", {
              opacity: [0, 1],
              translateY: [30, 0],
              duration: 800,
              delay: 100,
              easing: "easeOutExpo",
            });

            animate(".event-card", {
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

      const section = document.getElementById("events");
      if (section) observer.observe(section);
    });

    return () => {
      scope.current?.revert();
      animated.current = false;
    };
  }, [ready]);

  return (
    <section
      ref={root}
      id="events"
      className="relative w-full py-24 overflow-hidden bg-background border-t border-border/40"
    >
      <div className="relative z-10 w-full px-8 md:px-16 lg:px-24">
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <p className="events-eyebrow text-xs font-bold uppercase tracking-[0.25em] text-primary mb-4">
              {t("eyebrow")}
            </p>
            <h2 className="events-headline text-[clamp(2.5rem,5vw,4.5rem)] font-black tracking-[-0.03em] leading-none text-foreground">
              {t("title")}
            </h2>
          </div>
          {events.length > 0 && (
            <div className="events-headline">
              <Button asChild variant="outline">
                <Link href="/event">{t("viewAll")}</Link>
              </Button>
            </div>
          )}
        </div>

        {!ready ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-6 border border-border/50 rounded-2xl bg-card space-y-4"
              >
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
                <div className="pt-4 border-t border-border/40 mt-4">
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 border border-destructive/20 bg-destructive/5 rounded-2xl text-center">
            <p className="text-destructive font-medium mb-2">
              {t("failedToLoad")}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Error: {error}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setReady(false);
                fetchPublicEvents().then(() => setReady(true));
              }}
            >
              {t("tryAgain")}
            </Button>
          </div>
        ) : events.length === 0 ? (
          <div className="p-12 border border-border/50 bg-card rounded-2xl text-center">
            <p className="text-muted-foreground text-lg mb-2">{t("noEvents")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="event-card group flex flex-col justify-between p-6 border border-border/50 rounded-2xl bg-card hover:border-primary/50 transition-colors duration-300"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h3 className="text-xl font-bold tracking-tight leading-tight line-clamp-2">
                      {event.title}
                    </h3>
                    {(!event.participation_price ||
                      Number(event.participation_price) === 0) && (
                      <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0 shrink-0">
                        {t("free")}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-3 mb-6 text-muted-foreground text-sm">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
                      <span>{formatDate(event.start_date)}</span>
                    </div>
                    {event.max_participants && (
                      <div className="flex items-center gap-2">
                        <UsersIcon className="w-4 h-4 text-primary shrink-0" />
                        <span>
                          {t("maxParticipants", {
                            count: event.max_participants,
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {event.participation_price &&
                    Number(event.participation_price) > 0 && (
                      <div className="mb-6 font-semibold">
                        {formatCurrency(Number(event.participation_price))}{" "}
                        {t("perEntry")}
                      </div>
                    )}
                </div>

                <div className="pt-4 border-t border-border/40">
                  <Button asChild variant="secondary" className="w-full">
                    <Link href={`/event/${event.id}`}>{t("viewEvent")}</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
