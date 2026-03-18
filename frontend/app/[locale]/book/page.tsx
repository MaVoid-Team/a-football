import { LenisWrapper } from "@/components/landing/lenis-wrapper";
import { LandingNavbar } from "@/components/landing/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { BookingView } from "@/components/book/booking-view";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const isArabic = locale === "ar";

    return {
        title: isArabic ? "احجز الآن | A Football" : "Book Now | A Football",
        description: isArabic ? "احجز ملعبك بسهولة أونلاين." : "Book a court easily online.",
    };
}

export default function BookPage() {
    return (
        <LenisWrapper>
            <div className="min-h-screen bg-background text-foreground overflow-x-hidden flex flex-col">
                <LandingNavbar />
                <main className="flex-1 pt-32 pb-16 px-8 md:px-16 lg:px-24">
                    <BookingView />
                </main>
                <LandingFooter />
            </div>
        </LenisWrapper>
    );
}
