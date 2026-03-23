"use client";

import { ReactNode, useEffect } from "react";
import { Bell, Calendar, CreditCard, Trophy, User2, Users } from "lucide-react";
import { usePlayerAuthContext } from "@/contexts/player-auth-context";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/account/profile", label: "Profile", icon: User2 },
    { href: "/account/tournaments", label: "My Tournaments", icon: Trophy },
    { href: "/account/matches", label: "My Matches", icon: Calendar },
    { href: "/account/bookings", label: "My Bookings", icon: CreditCard },
    { href: "/account/notifications", label: "Notifications", icon: Bell },
    { href: "/account/teams", label: "My Teams", icon: Users },
];

export function AccountShell({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: ReactNode;
}) {
    const { player, loading, isAuthenticated } = usePlayerAuthContext();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push("/account/login");
        }
    }, [isAuthenticated, loading, router]);

    if (loading || !isAuthenticated || !player) {
        return <div className="py-24 text-center text-muted-foreground">Loading your account...</div>;
    }

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6">
            <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Player Account</p>
                <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
                <p className="text-muted-foreground">{description}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg">{player.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{player.email}</p>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
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
                    </CardContent>
                </Card>

                <div>{children}</div>
            </div>
        </div>
    );
}
