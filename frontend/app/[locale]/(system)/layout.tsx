"use client";

import { ReactNode, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useAuthContext } from "@/contexts/auth-context";
import { Sidebar } from "@/components/shared/sidebar";
import { MobileSidebar } from "@/components/shared/mobile-sidebar";
import { Topbar } from "@/components/shared/topbar";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

export default function SystemLayout({ children }: { children: ReactNode }) {
    const { isAuthenticated, loading } = useAuthContext();
    const router = useRouter();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Public paths that authenticated users can freely visit (home + public-facing pages)
    const PUBLIC_PATHS = ["/", "/book", "/event", "/package"];
    const isPublicPath =
        PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
        pathname.includes("/auth/login");

    const handleMenuToggle = useCallback(() => {
        setMobileMenuOpen((prev) => !prev);
    }, []);

    const handleMenuClose = useCallback(() => {
        setMobileMenuOpen(false);
    }, []);

    useEffect(() => {
        // Only redirect to login if the user is unauthenticated AND is trying to
        // access a protected (system) page — never block the home page or public pages.
        if (!loading && !isAuthenticated && !isPublicPath) {
            router.push("/auth/login");
        }
    }, [isAuthenticated, loading, isPublicPath, router]);

    // Optionally set up Lenis smooth scroll down the line

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <LoadingSpinner size={48} />
            </div>
        );
    }

    if (!isAuthenticated) {
        // Public pages (home, book, event, etc.) are accessible without auth — let them render.
        // Protected pages will be redirected by the useEffect above.
        if (isPublicPath) {
            return <>{children}</>;
        }
        return null; // Will redirect in useEffect
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />
            <MobileSidebar open={mobileMenuOpen} onClose={handleMenuClose} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Topbar onMenuToggle={handleMenuToggle} />
                <main className="flex-1 overflow-y-auto bg-muted/20 p-4 md:p-6 lg:p-8 custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
}
