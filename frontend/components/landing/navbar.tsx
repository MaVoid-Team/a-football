"use client";

import { useEffect, useRef, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { animate, createScope } from "animejs";
import { cn } from "@/lib/utils";
import { UserActions } from "@/components/shared/user-actions";
import { LanguageToggle } from "@/components/landing/language-toggle";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Menu, X } from "lucide-react";
import { useTheme } from "next-themes";

export function LandingNavbar() {
  const t = useTranslations("landing.nav");
  const tCommon = useTranslations("common");
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const root = useRef<HTMLElement>(null);
  const scope = useRef<ReturnType<typeof createScope> | null>(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const pathname = usePathname();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? (theme === "system" ? resolvedTheme : theme) : "light";

  const NAV_LINKS = [
    { label: t("packages"), href: "/package" },
    { label: t("events"), href: "/event" },
    { label: t("bookACourt"), href: "/book" },
  ];

  // Entrance animation
  useEffect(() => {
    scope.current = createScope({ root }).add(() => {
      animate(".nav-logo", {
        opacity: [0, 1],
        translateX: [-20, 0],
        duration: 800,
        delay: 200,
        easing: "easeOutExpo",
      });
      animate(".nav-link", {
        opacity: [0, 1],
        translateY: [-12, 0],
        delay: (_, i) => 300 + i * 80,
        duration: 700,
        easing: "easeOutExpo",
      });
      animate(".nav-cta", {
        opacity: [0, 1],
        translateX: [20, 0],
        duration: 800,
        delay: 600,
        easing: "easeOutExpo",
      });
    });
    return () => scope.current?.revert();
  }, []);

  // Hide/reveal on scroll direction + background morphing
  useEffect(() => {
    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          const delta = currentY - lastScrollY.current;

          setScrolled(currentY > 80);
          if (currentY > 300 && delta > 8) {
            setHidden(true);
          } else if (delta < -4) {
            setHidden(false);
          }

          lastScrollY.current = currentY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      ref={root}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ease-in-out",
        hidden ? "-translate-y-full" : "translate-y-0",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm"
          : "bg-transparent",
      )}
    >
      <div className="w-full px-8 md:px-16 lg:px-24 py-5 flex items-center justify-between">
        {/* Brand - Desktop only */}
        <Link
          href="/"
          className="nav-logo opacity-0 hidden md:flex items-center gap-3 group"
        >
          <img
            src={currentTheme === "dark" ? "/logo-light.png" : "/logo-dark.png"}
            alt="A Football"
            className="w-auto h-10 object-contain"
          />
        </Link>

        {/* Book Button - Mobile only */}
        <Link
          href="/book"
          className="md:hidden nav-logo opacity-0 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors duration-200"
        >
          {t("bookACourt")}
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "nav-link opacity-0 text-sm font-medium transition-colors duration-200 tracking-wide",
                pathname === link.href
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side: Language Toggle + Theme Toggle + CTA + mobile toggle */}
        <div className="flex items-center gap-3">
          {/* Hidden on mobile - shown in mobile menu instead */}
          <LanguageToggle className="nav-cta opacity-0 hidden md:flex" />
          <div className="nav-cta opacity-0 hidden md:block">
            <ThemeToggle />
          </div>
          <div className="nav-cta opacity-0 hidden md:block">
            <UserActions showDashboardLink />
          </div>
          {/* Mobile menu button */}
          <button
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors duration-200"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={tCommon("toggleMenu")}
            id="mobile-menu-toggle"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
          scrolled
            ? "bg-background/95 backdrop-blur-2xl"
            : "bg-background/95 backdrop-blur-2xl",
          mobileOpen ? "max-h-96 border-b border-border/60" : "max-h-0",
        )}
      >
        <nav className="flex flex-col px-8 pb-6 pt-2 gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium py-2.5 px-3 rounded-lg transition-colors duration-200",
                pathname === link.href
                  ? "text-foreground bg-muted/60"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
              )}
            >
              {link.label}
            </Link>
          ))}
          {/* User actions in mobile menu */}
          <div className="pt-3 mt-1 border-t border-border/40">
            <UserActions showDashboardLink />
          </div>
          {/* Language toggle and theme toggle in mobile menu */}
          <div className="pt-3 mt-1 border-t border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">
                {tCommon("language")}
              </span>
              <LanguageToggle />
            </div>
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
