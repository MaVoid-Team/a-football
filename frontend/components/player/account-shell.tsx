"use client";

import { ReactNode, useEffect, useState } from "react";
import { Bell, Calendar, ChevronLeft, CreditCard, Menu, Trophy, User2, Users, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePlayerAuthContext } from "@/contexts/player-auth-context";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function useNavItems() {
    const t = useTranslations("playerAccount");
    return [
        { href: "/account/profile", label: t("profile"), icon: User2 },
        { href: "/account/tournaments", label: t("tournaments"), icon: Trophy },
        { href: "/account/matches", label: t("matches"), icon: Calendar },
        { href: "/account/bookings", label: t("bookings"), icon: CreditCard },
        { href: "/account/notifications", label: t("notifications"), icon: Bell },
        { href: "/account/teams", label: t("teams"), icon: Users },
    ];
}

export function AccountShell({
    title,
    description,
    backHref,
    backLabel,
    children,
}: {
    title: string;
    description: string;
    backHref?: string;
    backLabel?: string;
    children: ReactNode;
}) {
    const t = useTranslations("playerAccount.shell");
    const navItems = useNavItems();
    const { player, loading, isAuthenticated } = usePlayerAuthContext();
    const router = useRouter();
    const pathname = usePathname();
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push("/account/login");
        }
    }, [isAuthenticated, loading, router]);

    if (loading || !isAuthenticated || !player) {
        return <div className="py-24 text-center text-muted-foreground">{t("loading")}</div>;
    }

    const renderNavLinks = () => (
        <>
            {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileNavOpen(false)}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                            active
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        {item.label}
                    </Link>
                );
            })}
        </>
    );

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6">
            <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    {backHref ? (
                        <Button asChild variant="ghost" className="px-0">
                            <Link href={backHref}>
                                <ChevronLeft className="h-4 w-4" />
                                {backLabel || t("back")}
                            </Link>
                        </Button>
                    ) : (
                        <div />
                    )}
                    <Button
                        type="button"
                        variant="outline"
                        className="lg:hidden"
                        onClick={() => setMobileNavOpen((current) => !current)}
                    >
                        {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                        {t("menu")}
                    </Button>
                </div>
                <div className="space-y-2">
                    <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{t("playerAccount")}</p>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
                    <p className="text-sm md:text-base text-muted-foreground">{description}</p>
                </div>
            </div>

            <Card className={cn("lg:hidden", mobileNavOpen ? "block" : "hidden")}>
                <CardHeader>
                    <CardTitle className="text-lg">{player.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{player.email}</p>
                </CardHeader>
                <CardContent className="space-y-1">
                    {renderNavLinks()}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
                <Card className="h-fit hidden lg:block">
                    <CardHeader>
                        <CardTitle className="text-lg">{player.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{player.email}</p>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        {renderNavLinks()}
                    </CardContent>
                </Card>

                <div className="min-w-0">{children}</div>
            </div>
        </div>
    );
}
