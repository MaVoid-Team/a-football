"use client";

import { Link } from "@/i18n/navigation";
import { ArrowRight, LayoutDashboard, LogOut } from "lucide-react";
import { useAuthContext } from "@/contexts/auth-context";
import { useAuthAPI } from "@/hooks/api/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations } from "next-intl";

interface UserActionsProps {
    /** Show a "Go to Dashboard" item inside the dropdown. Default: false. */
    showDashboardLink?: boolean;
}

export function UserActions({ showDashboardLink = false }: UserActionsProps) {
    const t = useTranslations("common");
    const tAdmin = useTranslations("admins.form.roleOptions");
    const { admin, isAuthenticated } = useAuthContext();
    const { logout } = useAuthAPI();

    const getInitials = (email?: string) => {
        if (!email) return "A";
        return email.substring(0, 2).toUpperCase();
    };

    if (!isAuthenticated) {
        return (
            <Button asChild className="group hover:gap-3 transition-all duration-200 h-10 px-5">
                <Link href="/auth/login" className="flex items-center gap-2">
                    {t("signIn")}
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
            </Button>
        );
    }

    return (
        <div className="flex items-center gap-3">
            {admin?.role === "super_admin" && (
                <Badge
                    variant="secondary"
                    className="hidden md:flex text-xs bg-primary/10 text-primary border-0 font-bold uppercase tracking-wider"
                >
                    {t("superAdmin")}
                </Badge>
            )}

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                        data-testid="user-menu-trigger"
                    >
                        <Avatar className="h-8 w-8 border border-border">
                            <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                                {getInitials(admin?.email)}
                            </AvatarFallback>
                        </Avatar>
                        <span className="sr-only">{t("toggleUserMenu")}</span>
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                                {admin?.email || t("adminUser")}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {t("rolePrefix")} {admin?.role === "super_admin" ? tAdmin("superAdmin") : tAdmin("branchAdmin")}
                            </p>
                        </div>
                    </DropdownMenuLabel>

                    {showDashboardLink && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard" className="flex items-center cursor-pointer">
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    {t("goToDashboard")}
                                </Link>
                            </DropdownMenuItem>
                        </>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={logout}
                        className="text-destructive focus:bg-destructive/10 cursor-pointer"
                        data-testid="logout-button"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>{t("logOut")}</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
