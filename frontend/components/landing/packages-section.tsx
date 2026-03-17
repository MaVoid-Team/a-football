"use client";

import { useEffect, useRef, useState } from "react";
import { animate, createScope, stagger } from "animejs";
import { usePackagesAPI } from "@/hooks/api/use-packages";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatCurrency } from "@/lib/format-currency";
import { ArrowRight, PackageIcon } from "lucide-react";

export function PackagesSection() {
    const { packages, loading, error, fetchPublicPackages } = usePackagesAPI();
    const root = useRef<HTMLElement>(null);
    const scope = useRef<ReturnType<typeof createScope> | null>(null);
    const animated = useRef(false);
    const [ready, setReady] = useState(false);

    const defaultBranchId = (() => {
        const raw = process.env.NEXT_PUBLIC_DEFAULT_BRANCH_ID;
        const parsed = raw ? Number(raw) : NaN;
        return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
    })();

    useEffect(() => {
        let cancelled = false;
        setReady(false);

        async function load() {
            const result = await fetchPublicPackages(
                defaultBranchId ? { branch_id: defaultBranchId } : undefined
            );
            if (cancelled) return;

            // If branch filter returned empty, retry without filter
            if (result.success && defaultBranchId && result.data?.length === 0) {
                await fetchPublicPackages();
                if (cancelled) return;
            }

            setReady(true);
        }

        load();
        return () => { cancelled = true; };
    }, [fetchPublicPackages, defaultBranchId]);

    useEffect(() => {
        if (!ready) return;

        scope.current = createScope({ root }).add(() => {
            const observer = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting && !animated.current) {
                        animated.current = true;

                        animate(".pkg-eyebrow", {
                            opacity: [0, 1],
                            translateY: [20, 0],
                            duration: 600,
                            easing: "easeOutExpo",
                        });

                        animate(".pkg-headline", {
                            opacity: [0, 1],
                            translateY: [30, 0],
                            duration: 800,
                            delay: 100,
                            easing: "easeOutExpo",
                        });

                        animate(".pkg-card", {
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
                { threshold: 0.06 }
            );

            const section = document.getElementById("packages");
            if (section) observer.observe(section);
        });

        return () => {
            scope.current?.revert();
            animated.current = false;
        };
    }, [ready]);

    return (
        <section ref={root} id="packages" className="relative w-full py-24 overflow-hidden bg-muted/10 border-t border-border/40">
            <div className="relative z-10 w-full px-8 md:px-16 lg:px-24">
                <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <p className="pkg-eyebrow text-xs font-bold uppercase tracking-[0.25em] text-primary mb-4">
                            Save More
                        </p>
                        <h2 className="pkg-headline text-[clamp(2.5rem,5vw,4.5rem)] font-black tracking-[-0.03em] leading-none text-foreground">
                            Court Packages
                        </h2>
                    </div>
                    {packages.length > 0 && (
                        <div className="pkg-headline">
                            <Button asChild variant="outline">
                                <Link href="/package">View All Packages</Link>
                            </Button>
                        </div>
                    )}
                </div>

                {!ready ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-6 border border-border/50 rounded-2xl bg-card space-y-4">
                                <Skeleton className="h-6 w-1/3" />
                                <Skeleton className="h-4 w-2/3" />
                                <Skeleton className="h-8 w-1/2" />
                                <div className="pt-4 mt-4 border-t border-border/40">
                                    <Skeleton className="h-10 w-full rounded-md" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="p-8 border border-destructive/20 bg-destructive/5 rounded-2xl text-center">
                        <p className="text-destructive font-medium mb-2">Failed to load packages.</p>
                        <Button variant="outline" onClick={() => {
                            setReady(false);
                            fetchPublicPackages({ branch_id: defaultBranchId }).then(() => setReady(true));
                        }}>Try again</Button>
                    </div>
                ) : packages.length === 0 ? (
                    <div className="p-12 border border-border/50 bg-card rounded-2xl text-center">
                        <PackageIcon className="mx-auto h-10 w-10 text-muted-foreground mb-4 opacity-40" />
                        <p className="text-muted-foreground text-lg">No packages available at the moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {packages.slice(0, 6).map((pkg) => (
                            <div
                                key={pkg.id}
                                className="pkg-card group flex flex-col justify-between p-6 border border-border/50 rounded-2xl bg-card hover:bg-muted/30 hover:border-primary/40 transition-all duration-300 hover:-translate-y-0.5"
                            >
                                <div>
                                    <div className="flex items-start justify-between mb-3 gap-3">
                                        <h3 className="text-xl font-bold tracking-tight leading-tight">{pkg.title}</h3>
                                        {!pkg.branch_id && (
                                            <Badge variant="outline" className="shrink-0 text-[10px] uppercase tracking-wider font-semibold">
                                                Global
                                            </Badge>
                                        )}
                                    </div>
                                    {pkg.description && (
                                        <p className="text-sm text-muted-foreground mb-5 line-clamp-2 leading-relaxed">{pkg.description}</p>
                                    )}
                                    <div className="mb-6">
                                        <span className="text-3xl font-black">{formatCurrency(Number(pkg.price))}</span>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-border/40">
                                    <Button asChild className="w-full font-semibold group/btn">
                                        <Link href={`/book?package_id=${pkg.id}`} className="flex items-center gap-2">
                                            Book Now
                                            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
                                        </Link>
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
