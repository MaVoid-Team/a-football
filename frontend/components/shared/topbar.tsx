"use client";

import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { UserActions } from "./user-actions";
import { useTranslations } from "next-intl";

export function Topbar() {
    const t = useTranslations("common");
    return (
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-4 md:px-6">
            <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
            >
                <Menu className="h-5 w-5" />
                <span className="sr-only">{t("toggleNavigationMenu")}</span>
            </Button>

            <div className="w-full flex-1">
                {/* Branch Selector would go here if needed in topbar */}
            </div>

            <LanguageToggle />
            <ThemeToggle />

            <UserActions />
        </header>
    );
}
