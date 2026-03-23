import { LenisWrapper } from "@/components/landing/lenis-wrapper";
import { LandingNavbar } from "@/components/landing/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { TournamentDetail } from "@/components/tournaments/tournament-detail";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const isArabic = locale === "ar";

    return {
        title: isArabic ? "تفاصيل البطولة | A Football" : "Tournament Details | A Football",
        description: isArabic ? "تابع تفاصيل البطولة والمباريات." : "View tournament details and matches.",
    };
}

export default async function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <LenisWrapper>
            <div className="min-h-screen bg-background text-foreground overflow-x-hidden flex flex-col">
                <LandingNavbar />
                <main className="flex-1 pt-32 pb-16 px-8 md:px-16 lg:px-24">
                    <TournamentDetail id={id} />
                </main>
                <LandingFooter />
            </div>
        </LenisWrapper>
    );
}
