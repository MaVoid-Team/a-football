import { ReactNode } from "react";

export default function PlayerAccountLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <main className="pt-24 md:pt-28 pb-16 px-4 sm:px-6 md:px-16 lg:px-24">
                {children}
            </main>
        </div>
    );
}
