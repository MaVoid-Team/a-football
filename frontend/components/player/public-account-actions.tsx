"use client";

import { ArrowRight, Bell, Calendar, LogOut, Trophy, User2, Users } from "lucide-react";
import { usePlayerAuthContext } from "@/contexts/player-auth-context";
import { usePlayerAuthAPI } from "@/hooks/api/use-player-auth";
import { Link } from "@/i18n/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function PublicAccountActions() {
    const { player, isAuthenticated, loading } = usePlayerAuthContext();
    const { logout } = usePlayerAuthAPI();
    if (loading) {
        return null;
    }

    if (!isAuthenticated || !player) {
        return (
            <Button asChild className="group hover:gap-3 transition-all duration-200 h-10 px-5">
                <Link href="/account/login" className="flex items-center gap-2">
                    Player Login
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
            </Button>
        );
    }

    const initials = player.name
        .split(" ")
        .map((segment) => segment[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8 border border-border">
                        <AvatarFallback className="bg-primary/10 text-primary-text font-medium text-xs">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{player.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{player.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/account/profile" className="flex items-center cursor-pointer">
                        <User2 className="mr-2 h-4 w-4" />
                        Profile
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/account/tournaments" className="flex items-center cursor-pointer">
                        <Trophy className="mr-2 h-4 w-4" />
                        My Tournaments
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/account/matches" className="flex items-center cursor-pointer">
                        <Calendar className="mr-2 h-4 w-4" />
                        My Matches
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/account/teams" className="flex items-center cursor-pointer">
                        <Users className="mr-2 h-4 w-4" />
                        My Teams
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/account/notifications" className="flex items-center cursor-pointer">
                        <Bell className="mr-2 h-4 w-4" />
                        Notifications
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/auth/login" className="cursor-pointer">
                        Admin Login
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={logout}
                    className="text-destructive focus:bg-destructive/10 cursor-pointer"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
