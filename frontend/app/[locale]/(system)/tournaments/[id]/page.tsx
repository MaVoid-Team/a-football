"use client";

import { useParams } from "next/navigation";
import { AdminTournamentDetails } from "@/components/tournaments/admin-tournament-details";

export default function AdminTournamentDetailsPage() {
    const params = useParams<{ id: string }>();

    return <AdminTournamentDetails id={String(params?.id ?? "")} />;
}
