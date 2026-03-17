import { LenisWrapper } from "@/components/landing/lenis-wrapper";
import { LandingNavbar } from "@/components/landing/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { EventsView } from "@/components/events/events-view";

export const metadata = {
    title: "Events | CourtManager",
    description: "Browse upcoming events and tournaments.",
};

export default function EventsPage() {
    return (
        <LenisWrapper>
            <div className="min-h-screen bg-background text-foreground overflow-x-hidden flex flex-col">
                <LandingNavbar />
                <main className="flex-1 pt-32 pb-16 px-8 md:px-16 lg:px-24">
                    <EventsView />
                </main>
                <LandingFooter />
            </div>
        </LenisWrapper>
    );
}
