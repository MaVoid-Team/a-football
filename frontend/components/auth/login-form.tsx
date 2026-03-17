"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginFormSchema, LoginFormData } from "@/schemas/auth.schema";
import { useAuthAPI } from "@/hooks/api/use-auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { useAuthContext } from "@/contexts/auth-context";
import { useTranslations } from "next-intl";

export function LoginForm() {
    const t = useTranslations("login");
    const router = useRouter();
    const { isAuthenticated, loading: authLoading } = useAuthContext();
    const { login, loading, error } = useAuthAPI();

    // Auto-redirect already-authenticated users straight to the dashboard
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            router.replace("/dashboard");
        }
    }, [isAuthenticated, authLoading, router]);

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: LoginFormData) => {
        const res = await login(data);
        if (res.success) {
            toast.success(t("toast.success"));
            router.push("/dashboard");
        }
    };

    return (
        <Card className="w-full max-w-sm space-y-6 p-8 mt-10 transition-all hover:shadow-md animate-in slide-in-from-bottom-8 duration-500">
            <div className="space-y-2 text-center">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("title")}</h1>
                <p className="text-sm text-muted-foreground">
                    {t("subtitle")}
                </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="login-form" noValidate>
                <div className="space-y-2">
                    <Label htmlFor="email">{t("emailLabel")}</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder={t("emailPlaceholder")}
                        {...form.register("email")}
                        disabled={loading}
                        data-testid="login-email-input"
                        className={form.formState.errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                    />
                    {form.formState.errors.email && (
                        <p className="text-xs text-destructive animate-in slide-in-from-top-1" data-testid="email-error">
                            {form.formState.errors.email.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">{t("passwordLabel")}</Label>
                    <Input
                        id="password"
                        type="password"
                        {...form.register("password")}
                        disabled={loading}
                        data-testid="login-password-input"
                        className={form.formState.errors.password ? "border-destructive focus-visible:ring-destructive" : ""}
                    />
                    {form.formState.errors.password && (
                        <p className="text-xs text-destructive animate-in slide-in-from-top-1" data-testid="password-error">
                            {form.formState.errors.password.message}
                        </p>
                    )}
                </div>

                <Button type="submit" className="w-full mt-4" disabled={loading} data-testid="login-submit-btn">
                    {loading ? t("loggingIn") : t("loginButton")}
                    {!loading && <LogIn className="ml-2 h-4 w-4" />}
                </Button>
            </form>
        </Card>
    );
}
