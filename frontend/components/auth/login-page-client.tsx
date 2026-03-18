"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { LoginForm } from "@/components/auth/login-form";

export function LoginPageClient() {
    const { theme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const currentTheme = mounted ? (theme === "system" ? resolvedTheme : theme) : "light";

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/3 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 w-full flex justify-center flex-col items-center">
                <div className="text-2xl font-bold mb-8">
                    <img
                        src={currentTheme === "dark" ? "/logo-light.png" : "/logo-dark.png"}
                        alt="A Football"
                        className="w-auto h-16 object-contain"
                    />
                </div>
                <LoginForm />
            </div>
        </div>
    );
}
