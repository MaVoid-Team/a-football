"use client";

import { useState } from "react";
import { ImageIcon, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";

interface PaymentScreenshotViewerProps {
    screenshotUrl: string | null | undefined;
}

export function PaymentScreenshotViewer({ screenshotUrl }: PaymentScreenshotViewerProps) {
    const t = useTranslations("bookings");
    const [open, setOpen] = useState(false);

    if (!screenshotUrl) {
        return (
            <div className="flex items-center gap-1.5 text-muted-foreground/50">
                <ImageIcon className="w-4 h-4" />
                <span className="text-xs italic">{t("table.noScreenshot")}</span>
            </div>
        );
    }

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="group relative inline-flex items-center gap-1.5 text-primary-text hover:text-primary-text/80 transition-colors"
                title={t("table.viewScreenshot")}
            >
                <div className="relative w-10 h-10 rounded-md overflow-hidden border border-border group-hover:border-primary transition-colors">
                    <img
                        src={screenshotUrl}
                        alt="Payment screenshot"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ZoomIn className="w-4 h-4 text-white" />
                    </div>
                </div>
                <span className="text-xs font-medium">{t("table.viewScreenshot")}</span>
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ImageIcon className="w-5 h-5" />
                            {t("table.screenshotDialogTitle")}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-full overflow-hidden rounded-xl border border-border bg-muted/30">
                            <img
                                src={screenshotUrl}
                                alt="Payment screenshot"
                                className="w-full max-h-[70vh] object-contain"
                            />
                        </div>
                        <div className="flex gap-2 w-full justify-end">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(screenshotUrl, "_blank")}
                            >
                                {t("table.screenshotOpenFull")}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setOpen(false)}
                            >
                                {t("table.screenshotClose")}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
