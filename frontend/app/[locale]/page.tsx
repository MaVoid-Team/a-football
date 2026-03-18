import { LenisWrapper } from "@/components/landing/lenis-wrapper";
import { LandingNavbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { PackagesSection } from "@/components/landing/packages-section";
import { EventsSection } from "@/components/landing/events-section";
import { LandingFooter } from "@/components/landing/footer";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";

  return {
    title: isArabic ? "A Football — احجز ملعبك" : "A Football — Book Your Court",
    description: isArabic
      ? "شوف المواعيد المتاحة، قارن الملاعب، واحجز مكانك فورًا."
      : "Check live availability, browse packages, join events, and secure your spot instantly.",
  };
}

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
