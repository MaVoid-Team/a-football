"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "lucide-react";

export function LandingFooter() {
  const t = useTranslations("landing.footer");
  const currentYear = new Date().getFullYear();

  const links = {
    [t("explore")]: [
      { label: t("packages"), href: "/package" },
      { label: t("events"), href: "/event" },
      { label: t("bookACourt"), href: "/book" },
    ],
    [t("company")]: [
      { label: t("about"), href: "#" },
      { label: t("contact"), href: "#" },
      { label: t("privacy"), href: "#" },
      { label: t("terms"), href: "#" },
    ],
  };

  return (
    <footer className="w-full border-t border-border/50 bg-background">
      {/* Large brand name */}
      <div className="w-full px-8 md:px-16 lg:px-24 pt-20 pb-12">
        <div className="mb-16">
          <p className="text-[clamp(4rem,12vw,14rem)] font-black tracking-[-0.05em] leading-[0.85] text-foreground/8 select-none pointer-events-none">
            CourtManager
          </p>
        </div>

        {/* Footer content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 border-t border-border/40 pt-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4 group w-fit">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-foreground text-background font-black text-[13px] select-none">
                CM
              </span>
              <span className="font-bold text-foreground tracking-tight text-base">
                CourtManager
              </span>
            </Link>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-5">
                {category}
              </p>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={`${item.label}-${item.href}`}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1 group w-fit"
                    >
                      {item.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -translate-y-0.5 translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t border-border/30">
          <p className="text-xs text-muted-foreground/50">
            {t("copyright", { year: currentYear })}
          </p>
        </div>
      </div>
    </footer>
  );
}
