import { LenisWrapper } from "@/components/landing/lenis-wrapper";
import { LandingNavbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { PackagesSection } from "@/components/landing/packages-section";
import { EventsSection } from "@/components/landing/events-section";
import { LandingFooter } from "@/components/landing/footer";

export const metadata = {
  title: "A Football — Book Your Court",
  description:
    "Check live availability, browse packages, join events, and secure your spot instantly.",
};

export default function LandingPage() {
  return (
    <LenisWrapper>
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        <LandingNavbar />
        <HeroSection />
        <PackagesSection />
        <EventsSection />
        <LandingFooter />
      </div>
    </LenisWrapper>
  );
}
