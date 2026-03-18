import { LenisWrapper } from "@/components/landing/lenis-wrapper";
import { LandingNavbar } from "@/components/landing/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { EventDetail } from "@/components/events/event-detail";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const isArabic = locale === "ar";

    return {
        title: isArabic ? "تفاصيل الإيفنت | A Football" : "Event Details | A Football",
        description: isArabic ? "شوف تفاصيل الإيفنت وسجّل بسهولة." : "View details and sign up for this event.",
    };
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;

    return (
        <LenisWrapper>
            <div className="min-h-screen bg-background text-foreground overflow-x-hidden flex flex-col">
                <LandingNavbar />
                <main className="flex-1 pt-32 pb-16 px-8 md:px-16 lg:px-24">
                    <EventDetail id={resolvedParams.id} />
                </main>
                <LandingFooter />
            </div>
        </LenisWrapper>
    );
}
