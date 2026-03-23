import { LenisWrapper } from "@/components/landing/lenis-wrapper";
import { LandingNavbar } from "@/components/landing/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { TournamentsView } from "@/components/tournaments/tournaments-view";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const isArabic = locale === "ar";

    return {
        title: isArabic ? "البطولات | A Football" : "Tournaments | A Football",
        description: isArabic ? "استكشف البطولات وسجل بسهولة." : "Discover tournaments and register easily.",
    };
}

export default function TournamentsPage() {
    return (
        <LenisWrapper>
            <div className="min-h-screen bg-background text-foreground overflow-x-hidden flex flex-col">
                <LandingNavbar />
                <main className="flex-1 pt-32 pb-16 px-8 md:px-16 lg:px-24">
                    <TournamentsView />
                </main>
                <LandingFooter />
            </div>
        </LenisWrapper>
    );
}
