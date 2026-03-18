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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Sidebar() {
  const t = useTranslations("sidebar");
  const pathname = usePathname();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    <div
      className="hidden border-r border-border bg-sidebar md:block w-64 shrink-0"
      data-testid="sidebar"
    >
      <div className="flex h-full flex-col gap-2">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 font-bold text-sidebar-foreground"
          >
            <img
              src={currentTheme === "dark" ? "/logo-light.png" : "/logo-dark.png"}
              alt="A Football"
              className="w-auto h-8 object-contain"
            />
          </Link>
        </div>

        <div className="flex-1 overflow-auto py-4">
          <nav className="grid items-start px-4 text-sm font-medium gap-1">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 transition-all",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                  )}
                  data-testid={`sidebar-link-${item.href.replace("/", "")}`}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Back to Home — pinned at the bottom */}
        <div className="mt-auto border-t border-border px-4 py-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            data-testid="sidebar-link-home"
          >
            <Home className="h-5 w-5" />
            {t("backToHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
