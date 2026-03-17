"use client";

import { useEffect, ReactNode } from "react";
import Lenis from "lenis";

export function LenisWrapper({ children }: { children: ReactNode }) {
    useEffect(() => {
        const lenis = new Lenis({
            autoRaf: true,
            duration: 1.2,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
        });

        return () => {
            lenis.destroy();
        };
    }, []);

    return <div className="h-full w-full">{children}</div>;
}
