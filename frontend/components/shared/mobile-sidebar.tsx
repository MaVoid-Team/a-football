"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
    Building2,
    CalendarDays,
    CalendarRange,
    Home,
    LayoutDashboard,
    Lock,
    MapPin,
    MessageSquare,
    Percent,
    PackageSearch,
    Settings,
    Star,
    Users,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface MobileSidebarProps {
    open: boolean;
    onClose: () => void;
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
    const t = useTranslations("sidebar");
    const tCommon = useTranslations("common");
    const pathname = usePathname();
    const { theme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Close on route change
    useEffect(() => {
        onClose();
    }, [pathname, onClose]);

    // Prevent body scroll when open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    const currentTheme = mounted ? (theme === "system" ? resolvedTheme : theme) : "light";

    const navigation = [
        { name: t("dashboard"), href: "/dashboard", icon: LayoutDashboard },
        { name: t("branches"), href: "/branches", icon: MapPin },
        { name: t("courts"), href: "/courts", icon: Building2 },
        { name: t("bookings"), href: "/bookings", icon: CalendarDays },
        { name: t("packages"), href: "/packages", icon: PackageSearch },
        { name: t("events"), href: "/events", icon: CalendarRange },
        { name: t("promoCodes"), href: "/promo-codes", icon: Percent },
        { name: t("blockedSlots"), href: "/blocked-slots", icon: Lock },
        { name: t("reviews"), href: "/reviews", icon: MessageSquare },
        { name: t("ratings"), href: "/ratings", icon: Star },
        { name: t("admins"), href: "/admins", icon: Users },
        { name: t("settings"), href: "/settings", icon: Settings },
    ];

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden",
                    open ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={cn(
                    "fixed inset-y-0 start-0 z-50 w-72 bg-sidebar border-e border-border transform transition-transform duration-300 ease-in-out md:hidden",
                    open ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex h-16 items-center justify-between border-b border-border px-4">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-3 font-bold text-sidebar-foreground"
                            onClick={onClose}
                        >
                            <img
                                src={currentTheme === "dark" ? "/logo-light.png" : "/logo-dark.png"}
                                alt="A Football"
                                className="w-auto h-8 object-contain"
                            />
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="text-sidebar-foreground"
                        >
                            <X className="h-5 w-5" />
                            <span className="sr-only">{tCommon("close")}</span>
                        </Button>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto py-4">
                        <nav className="grid items-start px-4 text-sm font-medium gap-1">
                            {navigation.map((item) => {
                                const isActive = pathname.startsWith(item.href);
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={onClose}
                                        className={cn(
                                            "flex items-center gap-3 rounded-md px-3 py-2.5 transition-all",
                                            isActive
                                                ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                                                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Back to Home */}
                    <div className="mt-auto border-t border-border px-4 py-4">
                        <Link
                            href="/"
                            onClick={onClose}
                            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        >
                            <Home className="h-5 w-5" />
                            {t("backToHome")}
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
