"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock } from "lucide-react";
import { useTranslations } from "next-intl";

interface Slot {
    start_time: string;
    end_time: string;
}

interface AvailabilityGridProps {
    slots: Slot[];
    selectedSlots: Slot[];
    onToggle: (slot: Slot) => void;
    isLoading?: boolean;
}

export function AvailabilityGrid({ slots, selectedSlots, onToggle, isLoading }: AvailabilityGridProps) {
    const t = useTranslations("availability");
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 animate-pulse">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-16 bg-muted/50 border border-border/50 rounded-md" />
                ))}
            </div>
        );
    }

    if (slots.length === 0) {
        return (
            <div className="py-12 bg-muted/30 border border-dashed border-border/60 rounded-lg flex flex-col items-center justify-center text-center">
                <Clock className="w-10 h-10 text-muted-foreground/50 mb-3" />
                <h4 className="text-lg font-medium">{t("emptyTitle")}</h4>
                <p className="text-sm text-muted-foreground mt-1">{t("emptyDescription")}</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {slots.map((slot) => {
                const isSelected = selectedSlots.some(s => s.start_time === slot.start_time);

                return (
                    <Button
                        key={slot.start_time}
                        variant="outline"
                        type="button"
                        onClick={() => onToggle(slot)}
                        className={cn(
                            "relative flex flex-col items-center justify-center h-16 py-4 px-3 transition-all duration-200 group text-sm font-medium",
                            isSelected
                                ? "border-primary bg-primary/10 text-primary-text shadow-sm ring-1 ring-primary"
                                : "border-border/50 bg-card hover:border-primary/50 hover:bg-primary/5 hover:-translate-y-0.5"
                        )}
                    >
                        <span>{slot.start_time}</span>
                        <span className="text-xs opacity-70 mt-1 font-normal">{t("to", { endTime: slot.end_time })}</span>
                        {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-primary-text absolute -top-2 -right-2 bg-background rounded-full" />
                        )}
                    </Button>
                );
            })}
        </div>
    );
}
