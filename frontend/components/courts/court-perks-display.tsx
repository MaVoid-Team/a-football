import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { Perk } from "@/schemas/perk.schema";
import { useTranslations } from "next-intl";

interface CourtPerksDisplayProps {
    perks?: Perk[];
    className?: string;
}

export function CourtPerksDisplay({ perks = [], className = "" }: CourtPerksDisplayProps) {
    const t = useTranslations("courts");
    if (!perks || perks.length === 0) {
        return null;
    }

    const activePerks = perks.filter(perk => perk.active);

    if (activePerks.length === 0) {
        return null;
    }

    return (
        <div className={`space-y-2 ${className}`}>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Star className="h-4 w-4" />
                <span>{t("perks.title")}</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {activePerks.map((perk) => (
                    <Badge
                        key={perk.id}
                        variant="secondary"
                        className="bg-primary/10 text-primary-text border-primary/20 hover:bg-primary/20"
                        title={perk.description || perk.name}
                    >
                        {perk.name}
                    </Badge>
                ))}
            </div>
        </div>
    );
}
