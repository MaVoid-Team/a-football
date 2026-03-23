"use client";

import { FormEvent, useState } from "react";
import { usePlayerAuthAPI } from "@/hooks/api/use-player-auth";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function PlayerLoginForm() {
    const { login, loading } = usePlayerAuthAPI();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const result = await login({ email, password });
        if (result.success) {
            toast.success("Welcome back");
            router.push("/account/tournaments");
        } else {
            toast.error(result.errorMessage || "Failed to login");
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Player Login</CardTitle>
                <CardDescription>Sign in to track tournaments, matches, bookings, and notifications.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
                    </div>
                    <div className="space-y-2">
                        <Label>Password</Label>
                        <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Signing in..." : "Sign In"}
                    </Button>
                </form>
                <div className="mt-4 text-sm text-muted-foreground">
                    No account yet? <Link href="/account/register" className="text-primary-text underline">Create one</Link>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                    Admin access: <Link href="/auth/login" className="text-primary-text underline">Admin login</Link>
                </div>
            </CardContent>
        </Card>
    );
}
