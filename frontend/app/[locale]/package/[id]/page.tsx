import { PackageDetail } from "@/components/packages/package-detail";
import { LenisWrapper } from "@/components/landing/lenis-wrapper";
import { LandingNavbar } from "@/components/landing/navbar";
import { LandingFooter } from "@/components/landing/footer";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const isArabic = locale === "ar";

    return {
        title: isArabic ? "تفاصيل الباكدج | A Football" : "Package Details | A Football",
        description: isArabic ? "تفاصيل الباكدج والتواصل معنا." : "View package details and contact us.",
    };
}

export default async function PackageDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <LenisWrapper>
            <div className="min-h-screen bg-background text-foreground overflow-x-hidden flex flex-col">
                <LandingNavbar />
                <main className="flex-1 pt-32 pb-16 px-8 md:px-16 lg:px-24">
                    <PackageDetail packageId={id} />
                </main>
                <LandingFooter />
            </div>
        </LenisWrapper>
    );
}
