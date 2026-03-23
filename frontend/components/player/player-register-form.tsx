"use client";

import { FormEvent, useState } from "react";
import { usePlayerAuthAPI } from "@/hooks/api/use-player-auth";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function PlayerRegisterForm() {
    const { register, loading } = usePlayerAuthAPI();
    const router = useRouter();
    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        password: "",
        skill_level: "intermediate" as "beginner" | "intermediate" | "advanced",
    });

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const result = await register(form);
        if (result.success) {
            toast.success("Account created");
            router.push("/account/tournaments");
        } else {
            toast.error(result.errorMessage || "Failed to create account");
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Create Player Account</CardTitle>
                <CardDescription>Save your profile once, then use it across tournaments and bookings.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                        <Label>Password</Label>
                        <Input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                        <Label>Skill Level</Label>
                        <Select value={form.skill_level} onValueChange={(value: any) => setForm((current) => ({ ...current, skill_level: value }))}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Creating account..." : "Create Account"}
                    </Button>
                </form>
                <div className="mt-4 text-sm text-muted-foreground">
                    Already registered? <Link href="/account/login" className="text-primary-text underline">Sign in</Link>
                </div>
            </CardContent>
        </Card>
    );
}
