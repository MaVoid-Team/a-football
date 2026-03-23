"use client";

import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { usePublicPromoCodesAPI } from "@/hooks/api/use-public-promo-codes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Percent, X, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/format-currency";

interface Slot {
    start_time: string;
    end_time: string;
}

interface PromoCodeInputProps {
    branchId?: string;
    selectedCourt?: { id?: number | string; price_per_hour: string; [key: string]: unknown };
    selectedSlots?: Slot[];
    startTime?: string;
    endTime?: string;
    onAppliedPromoCodeChange?: (code: string) => void;
    onPricingPreviewChange?: (preview: { originalAmount: number; discountAmount: number; finalAmount: number } | null) => void;
}

export function PromoCodeInput({ branchId, selectedCourt, selectedSlots = [], startTime, endTime, onAppliedPromoCodeChange, onPricingPreviewChange }: PromoCodeInputProps) {
    const t = useTranslations("promoInput");
    const form = useFormContext();
    const [promoCode, setPromoCode] = useState("");
    const [isValidating, setIsValidating] = useState(false);
    const [validationResult, setValidationResult] = useState<any>(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [appliedContext, setAppliedContext] = useState<string | null>(null);
    
    const { validatePromoCode } = usePublicPromoCodesAPI();

    // Calculate current total based on selected court and slots
    const calculateCurrentTotal = () => {
        if (!selectedCourt) return 0;
        const pricePerHour = Number(selectedCourt.price_per_hour) || 0;

        // Multi-slot path
        if (selectedSlots.length > 0) {
            const totalHours = selectedSlots.reduce((sum, slot) => {
                const start = new Date(`2000-01-01T${slot.start_time}:00`);
                const end = new Date(`2000-01-01T${slot.end_time}:00`);
                return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            }, 0);
            return totalHours * pricePerHour;
        }

        // Legacy single-slot fallback
        if (!startTime || !endTime) return 0;
        const start = new Date(`2000-01-01T${startTime}:00`);
        const end = new Date(`2000-01-01T${endTime}:00`);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return hours * pricePerHour;
    };

    const currentTotal = calculateCurrentTotal();
    const slotSignature = selectedSlots.map((slot) => `${slot.start_time}-${slot.end_time}`).join("|");
    const pricingContext = `${branchId ?? ""}:${selectedCourt?.id ?? ""}:${slotSignature}`;
    const displayedTotal = validationResult?.validated_total_amount ?? currentTotal;

    useEffect(() => {
        if (validationResult?.valid) {
            setDiscountAmount(validationResult.discount_amount || 0);
        } else {
            setDiscountAmount(0);
        }
    }, [validationResult]);

    useEffect(() => {
        if (!validationResult?.valid || !appliedContext) return;
        if (appliedContext === pricingContext) return;

        setValidationResult(null);
        setDiscountAmount(0);
        setAppliedContext(null);
        form.setValue("promo_code", "");
        onAppliedPromoCodeChange?.("");
        onPricingPreviewChange?.(null);
    }, [appliedContext, pricingContext, validationResult?.valid, form, onAppliedPromoCodeChange, onPricingPreviewChange]);

    const handleValidatePromoCode = async () => {
        if (!promoCode.trim()) {
            toast.error(t("toasts.enterPromoCode"));
            return;
        }

        if (currentTotal <= 0) {
            toast.error(t("toasts.selectCourtAndTime"));
            return;
        }

        if (selectedSlots.length < 2) {
            toast.error(t("toasts.selectCourtAndTime"));
            return;
        }

        if (!branchId) {
            toast.error(t("toasts.selectCourtAndTime"));
            return;
        }

        setIsValidating(true);
        try {
            const result = await validatePromoCode(branchId, {
                code: promoCode.toUpperCase(),
                total_amount: currentTotal,
                court_id: selectedCourt?.id ? Number(selectedCourt.id) : undefined,
                booking_slots_attributes: selectedSlots,
            });

            if (result.valid) {
                setValidationResult(result);
                const normalizedCode = promoCode.toUpperCase();
                form.setValue("promo_code", normalizedCode);
                setAppliedContext(pricingContext);
                onAppliedPromoCodeChange?.(normalizedCode);
                const originalAmount = Number(result.validated_total_amount ?? currentTotal) || 0;
                const discount = Number(result.discount_amount ?? 0) || 0;
                onPricingPreviewChange?.({
                    originalAmount,
                    discountAmount: discount,
                    finalAmount: Math.max(originalAmount - discount, 0),
                });
                toast.success(t("toasts.applied", { amount: formatCurrency(result.discount_amount || 0) }));
            } else {
                setValidationResult(null);
                form.setValue("promo_code", "");
                setAppliedContext(null);
                onAppliedPromoCodeChange?.("");
                onPricingPreviewChange?.(null);
                toast.error(result.error || t("toasts.invalidPromoCode"));
            }
        } catch (error) {
            setValidationResult(null);
            form.setValue("promo_code", "");
            setAppliedContext(null);
            onAppliedPromoCodeChange?.("");
            onPricingPreviewChange?.(null);
            toast.error(t("toasts.validateFailed"));
        } finally {
            setIsValidating(false);
        }
    };

    const handleRemovePromoCode = () => {
        setPromoCode("");
        setValidationResult(null);
        form.setValue("promo_code", "");
        setDiscountAmount(0);
        setAppliedContext(null);
        onAppliedPromoCodeChange?.("");
        onPricingPreviewChange?.(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-primary-text" />
                <label className="text-sm font-medium">{t("label")}</label>
            </div>
            
            {!validationResult?.valid ? (
                <div className="flex gap-2">
                    <Input
                        placeholder={t("placeholder")}
                        value={promoCode}
                        onChange={(e) => {
                            const normalizedCode = e.target.value.toUpperCase();
                            setPromoCode(normalizedCode);
                            form.setValue("promo_code", normalizedCode);
                            onAppliedPromoCodeChange?.("");
                            onPricingPreviewChange?.(null);
                        }}
                        className="flex-1"
                        disabled={currentTotal <= 0 || !branchId}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleValidatePromoCode}
                        disabled={!promoCode.trim() || isValidating || currentTotal <= 0 || !branchId}
                    >
                        {isValidating ? t("validating") : t("apply")}
                    </Button>
                </div>
            ) : (
                <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                <div>
                                    <div className="font-medium text-green-900 dark:text-green-100">
                                        {validationResult.promo_code?.code}
                                    </div>
                                    <div className="text-sm text-green-700 dark:text-green-300">
                                        {validationResult.promo_code?.description}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                                    -{formatCurrency(discountAmount)}
                                </Badge>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleRemovePromoCode}
                                    className="h-8 w-8 text-green-600 hover:text-green-700 dark:text-green-400"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
            
            {discountAmount > 0 && (
                <div className="text-sm text-muted-foreground">
                    <div className="flex justify-between">
                        <span>{t("summary.originalAmount")}</span>
                        <span>{formatCurrency(displayedTotal)}</span>
                    </div>
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                        <span>{t("summary.discount")}</span>
                        <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                        <span>{t("summary.finalAmount")}</span>
                        <span>{formatCurrency(displayedTotal - discountAmount)}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
