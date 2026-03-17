"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useTransition } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const LOCALES = [
    { code: "en", label: "EN" },
    { code: "ar", label: "AR" },
] as const;

interface LanguageToggleProps {
    className?: string;
}

export function LanguageToggle({ className }: LanguageToggleProps) {
    const t = useTranslations("common");
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const switchTo = (next: string) => {
        if (next === locale || isPending) return;
        startTransition(() => {
            router.replace(pathname, { locale: next });
        });
    };

    return (
        <div
            className={cn(
                "relative flex items-center h-8 p-0.5 rounded-full border border-border/60 bg-muted/20 gap-0 select-none",
                isPending && "opacity-50 pointer-events-none",
                className
            )}
            aria-label={t("switchLanguage")}
        >
            {LOCALES.map(({ code, label }) => (
                <button
                    key={code}
                    onClick={() => switchTo(code)}
                    disabled={isPending}
                    aria-pressed={locale === code}
                    aria-label={code === "en" ? t("switchToEnglish") : t("switchToArabic")}
                    className="relative flex items-center justify-center w-9 h-7 cursor-pointer"
                >
                    {locale === code && (
                        <motion.span
                            layoutId="lang-pill"
                            className="absolute inset-0 rounded-full bg-foreground"
                            transition={{ type: "spring", stiffness: 420, damping: 38 }}
                        />
                    )}
                    <span
                        className={cn(
                            "relative z-10 text-[11px] font-bold tracking-wider uppercase transition-colors duration-150",
                            locale === code
                                ? "text-background"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {label}
                    </span>
                </button>
            ))}
        </div>
    );
}
