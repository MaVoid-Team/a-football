"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";

export default function BranchPromoCodesRedirectPage() {
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        const branchId = String(params.id);
        router.replace(`/promo-codes?branch_id=${branchId}`);
    }, [params.id, router]);

    return null;
}
