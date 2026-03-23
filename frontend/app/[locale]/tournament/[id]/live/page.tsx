import { LenisWrapper } from "@/components/landing/lenis-wrapper";
import { LandingNavbar } from "@/components/landing/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { TournamentLiveBoard } from "@/components/tournaments/tournament-live-board";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const isArabic = locale === "ar";

    return {
        title: isArabic ? "البث المباشر للبطولة | A Football" : "Tournament Live Board | A Football",
        description: isArabic ? "تابع حالة المباريات مباشرة." : "Track tournament matches live.",
    };
}

export default async function TournamentLiveBoardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <LenisWrapper>
            <div className="min-h-screen bg-background text-foreground overflow-x-hidden flex flex-col">
                <LandingNavbar />
                <main className="flex-1 pt-28 pb-10 px-6 md:px-10 lg:px-16">
                    <TournamentLiveBoard id={id} />
                </main>
                <LandingFooter />
            </div>
        </LenisWrapper>
    );
}
