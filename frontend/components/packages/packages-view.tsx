"use client";

import { useEffect, useState } from "react";
import { usePackagesAPI } from "@/hooks/api/use-packages";
import { useBranchesAPI } from "@/hooks/api/use-branches";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/format-currency";
import { ArrowRight, PackageIcon, MapPinIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

export function PackagesView() {
    const t = useTranslations("publicPackages");
    const { packages, loading, error, fetchPublicPackages } = usePackagesAPI();
    const { branches, fetchPublicBranches } = useBranchesAPI();
    const [selectedBranch, setSelectedBranch] = useState<string>("all");

    useEffect(() => {
        fetchPublicBranches();
    }, [fetchPublicBranches]);

    useEffect(() => {
        if (selectedBranch === "all") {
            fetchPublicPackages();
        } else {
            fetchPublicPackages({ branch_id: Number(selectedBranch) });
        }
    }, [fetchPublicPackages, selectedBranch]);

    if (error) {
        return (
            <div className="w-full text-center py-20">
                <p className="text-destructive mb-4">{t("errorLoading")}</p>
                <p className="text-muted-foreground">{error}</p>
                <Button variant="outline" className="mt-4" onClick={() => {
                    if (selectedBranch === "all") {
                        fetchPublicPackages();
                    } else {
                        fetchPublicPackages({ branch_id: Number(selectedBranch) });
                    }
                }}>
                    {t("tryAgain")}
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto">
            <div className="flex flex-col items-center text-center space-y-4 mb-12">
                <Badge variant="secondary" className="px-3 py-1 font-medium bg-primary/10 text-primary-text border-primary/20">
                    <PackageIcon className="mr-2 h-4 w-4" />
                    {t("badge")}
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{t("title")}</h1>
                <p className="text-muted-foreground max-w-[600px] text-lg">
                    {t("subtitle")}
                </p>
            </div>

            {branches.length > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-10">
                    <div className="flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{t("filterByBranch")}</span>
                    </div>
                    <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <SelectValue placeholder={t("allBranches")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("allBranches")}</SelectItem>
                            {branches.filter(b => b.active).map((branch) => (
                                <SelectItem key={branch.id} value={branch.id}>
                                    {branch.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {loading && packages.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="flex flex-col h-full bg-card/60">
                            <CardHeader>
                                <Skeleton className="h-8 w-1/2 mb-2" />
                                <Skeleton className="h-4 w-full" />
                            </CardHeader>
                            <CardContent className="flex-1">
                                <Skeleton className="h-10 w-1/3 mb-4" />
                            </CardContent>
                            <CardFooter>
                                <Skeleton className="h-10 w-full rounded-xl" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : packages.length === 0 ? (
                <div className="text-center py-24 bg-card rounded-3xl border border-border/50 shadow-sm">
                    <PackageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-xl font-bold mb-2">{t("emptyTitle")}</h3>
                    <p className="text-muted-foreground">{t("emptyDescription")}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {packages.map((pkg) => (
                        <Card key={pkg.id} className="flex flex-col h-full bg-card/60 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                            <CardHeader>
                                <CardTitle className="text-2xl">{pkg.title}</CardTitle>
                                {pkg.description && (
                                    <CardDescription className="text-base mt-2 line-clamp-3">
                                        {pkg.description}
                                    </CardDescription>
                                )}
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col justify-end">
                                <div className="mt-4 flex items-baseline gap-2">
                                    <span className="text-4xl font-bold tracking-tight">
                                        {formatCurrency(Number(pkg.price))}
                                    </span>
                                </div>
                                {!pkg.branch_id && (
                                    <Badge variant="outline" className="mt-4 w-fit uppercase text-[10px] tracking-wider font-semibold">
                                        {t("globalPackage")}
                                    </Badge>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button asChild size="lg" className="w-full group">
                                    <Link href={`/package/${pkg.id}`}>
                                        {t("viewDetails")}
                                        <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
