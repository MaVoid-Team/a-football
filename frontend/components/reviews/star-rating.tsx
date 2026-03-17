"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
    value: number;
    onChange?: (value: number) => void;
    readonly?: boolean;
    size?: "sm" | "md" | "lg";
    showValue?: boolean;
    className?: string;
}

const sizeMap = {
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
    lg: "w-7 h-7",
};

export function StarRating({
    value,
    onChange,
    readonly = false,
    size = "md",
    showValue = false,
    className,
}: StarRatingProps) {
    const [hovered, setHovered] = useState<number | null>(null);

    const effective = hovered ?? value;

    return (
        <div className={cn("flex items-center gap-1", className)}>
            {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= effective;
                return (
                    <button
                        key={star}
                        type="button"
                        disabled={readonly}
                        onClick={() => !readonly && onChange?.(star)}
                        onMouseEnter={() => !readonly && setHovered(star)}
                        onMouseLeave={() => !readonly && setHovered(null)}
                        className={cn(
                            "transition-all duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded",
                            readonly
                                ? "cursor-default"
                                : "cursor-pointer hover:scale-110 active:scale-95",
                        )}
                        aria-label={readonly ? `${star} star${star !== 1 ? "s" : ""}` : `Rate ${star} star${star !== 1 ? "s" : ""}`}
                    >
                        <Star
                            className={cn(
                                sizeMap[size],
                                "transition-colors duration-100",
                                filled
                                    ? "fill-amber-400 text-amber-400"
                                    : "fill-transparent text-muted-foreground/30",
                            )}
                        />
                    </button>
                );
            })}

            {showValue && value > 0 && (
                <span className="ms-1 text-sm font-semibold text-muted-foreground tabular-nums">
                    {value.toFixed(1)}
                </span>
            )}
        </div>
    );
}
