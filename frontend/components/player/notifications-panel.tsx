"use client";

import { useEffect, useState } from "react";
import { usePlayerAccountAPI } from "@/hooks/api/use-player-account";
import { PlayerNotification } from "@/schemas/player.schema";
import { AccountShell } from "@/components/player/account-shell";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function NotificationsPanel() {
    const { fetchNotifications, markNotification } = usePlayerAccountAPI();
    const [notifications, setNotifications] = useState<PlayerNotification[]>([]);

    const refresh = () => {
        fetchNotifications().then(setNotifications).catch(() => undefined);
    };

    useEffect(() => {
        refresh();
    }, []);

    return (
        <AccountShell
            title="Notifications"
            description="Important status changes and scheduling updates stay here until you read them."
            backHref="/account/tournaments"
            backLabel="Back to My Tournaments"
        >
            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <Card><CardContent className="py-12 text-center text-muted-foreground">No notifications yet.</CardContent></Card>
                ) : notifications.map((notification) => (
                    <Card key={notification.id} className={notification.read ? "opacity-70" : ""}>
                        <CardHeader className="flex flex-row items-center justify-between gap-3">
                            <div>
                                <CardTitle className="text-lg">{notification.title}</CardTitle>
                                <p className="text-sm text-muted-foreground">{notification.created_at ? new Date(notification.created_at).toLocaleString() : ""}</p>
                            </div>
                            {!notification.read && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={async () => {
                                        await markNotification(notification.id, true);
                                        refresh();
                                    }}
                                >
                                    Mark Read
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p>{notification.body}</p>
                            {notification.link_url && (
                                <Link href={notification.link_url as any} className="text-primary-text underline">
                                    Open
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </AccountShell>
    );
}
