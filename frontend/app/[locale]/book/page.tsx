import { LenisWrapper } from "@/components/landing/lenis-wrapper";
import { LandingNavbar } from "@/components/landing/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { BookingView } from "@/components/book/booking-view";

export const metadata = {
    title: "Book a Court | CourtManager",
    description: "Book a court easily online.",
};

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
