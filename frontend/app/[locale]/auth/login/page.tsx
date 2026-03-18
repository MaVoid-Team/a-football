import { LoginPageClient } from "@/components/auth/login-page-client";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const isArabic = locale === "ar";

    return {
        title: isArabic ? "تسجيل الدخول | A Football" : "Login | A Football",
        description: isArabic ? "صفحة دخول الأدمن." : "Admin login page",
    };
}

export default function LoginPage() {
    return <LoginPageClient />;
}
