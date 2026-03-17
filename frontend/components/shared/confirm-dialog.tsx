"use client";

import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface ConfirmDialogProps {
    title?: string;
    description?: string;
    onConfirm: () => Promise<void> | void;
    triggerButton?: React.ReactNode;
    disabled?: boolean;
}

export function ConfirmDialog({
    title,
    description,
    onConfirm,
    triggerButton,
    disabled = false,
}: ConfirmDialogProps) {
    const t = useTranslations("common.confirm");
    const resolvedTitle = title ?? t("title");
    const resolvedDescription = description ?? t("description");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleConfirm = async (e: React.MouseEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onConfirm();
            setOpen(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                {triggerButton || (
                    <Button
                        variant="destructive"
                        size="icon"
                        disabled={disabled}
                        data-testid="confirm-dialog-trigger"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{resolvedTitle}</AlertDialogTitle>
                    <AlertDialogDescription>{resolvedDescription}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading} data-testid="confirm-dialog-cancel">
                        {t("cancel")}
                    </AlertDialogCancel>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={loading}
                        data-testid="confirm-dialog-submit"
                    >
                        {loading ? t("deleting") : t("continue")}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
