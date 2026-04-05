"use client";

import { FormEvent, useState } from "react";
import { usePlayerAuthAPI } from "@/hooks/api/use-player-auth";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LogIn, Mail, Lock, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

export function PlayerLoginForm() {
    const t = useTranslations("playerLogin");
    const { login, loading } = usePlayerAuthAPI();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const result = await login({ email, password });
        if (result.success) {
            toast.success(t("welcomeBack"));
            router.push("/account/tournaments");
        } else {
            toast.error(result.errorMessage || t("loginFailed"));
        }
    };

    return (
        <div className="w-full space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-[#1A1A1A]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {t("title")}
                </h2>
                <p className="text-[#737373] text-base">
                    {t("subtitle")}
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email field */}
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-[#1A1A1A]">
                        {t("emailLabel")}
                    </Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#737373]" />
                        <Input
                            id="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            type="email"
                            placeholder={t("emailPlaceholder")}
                            className="pl-10 h-12 rounded-xl border-[#E5E5E5] focus:border-[#EFFD5F] focus:ring-[#EFFD5F]/20 text-[#1A1A1A] placeholder:text-[#737373]/60"
                            required
                        />
                    </div>
                </div>

                {/* Password field */}
                <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-[#1A1A1A]">
                        {t("passwordLabel")}
                    </Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#737373]" />
                        <Input
                            id="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            type="password"
                            placeholder={t("passwordPlaceholder")}
                            className="pl-10 h-12 rounded-xl border-[#E5E5E5] focus:border-[#EFFD5F] focus:ring-[#EFFD5F]/20 text-[#1A1A1A] placeholder:text-[#737373]/60"
                            required
                        />
                    </div>
                </div>

                {/* Submit button - Brand primary yellow */}
                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 mt-2 bg-[#EFFD5F] hover:bg-[#E5F34A] text-[#1A1A1A] font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            {t("signingIn")}
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            {t("signIn")}
                            <ArrowRight className="h-5 w-5" />
                        </span>
                    )}
                </Button>
            </form>

            {/* Divider */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#E5E5E5]" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-[#737373]">{t("or")}</span>
                </div>
            </div>

            {/* Links */}
            <div className="space-y-4 text-center">
                <div className="text-sm text-[#737373]">
                    {t("noAccount")}{" "}
                    <Link
                        href="/account/register"
                        className="font-semibold text-[#1A1A1A] hover:text-[#2D2D2D] underline underline-offset-2 transition-colors"
                    >
                        {t("createAccount")}
                    </Link>
                </div>

                <div className="pt-4 border-t border-[#E5E5E5]">
                    <Link
                        href="/auth/login"
                        className="inline-flex items-center gap-2 text-sm text-[#737373] hover:text-[#1A1A1A] transition-colors"
                    >
                        <LogIn className="h-4 w-4" />
                        {t("adminLogin")}
                    </Link>
                </div>
            </div>
        </div>
    );
}
