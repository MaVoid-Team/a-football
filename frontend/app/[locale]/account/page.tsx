import { redirect } from "next/navigation";

export default async function PlayerAccountHome({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    redirect(`/${locale}/account/tournaments`);
}
