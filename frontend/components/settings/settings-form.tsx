"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Setting, settingFormSchema, SettingFormData } from "@/schemas/setting.schema";
import { Branch } from "@/schemas/branch.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuthContext } from "@/contexts/auth-context";

interface SettingsFormProps {
    setting: Setting | null;
    loading: boolean;
    branches: Branch[];
    selectedBranchId: string;
    onBranchChange: (branchId: string) => void;
    onSubmit: (data: SettingFormData) => Promise<any>;
}

export function SettingsForm({ setting, loading, branches, selectedBranchId, onBranchChange, onSubmit }: SettingsFormProps) {
    const t = useTranslations("settings");
    const { admin } = useAuthContext();
    const isSuperAdmin = admin?.role === "super_admin";

    const form = useForm<SettingFormData>({
        resolver: zodResolver(settingFormSchema),
        defaultValues: {
            branch_id: selectedBranchId !== "all" ? Number(selectedBranchId) : undefined,
            whatsapp_number: "",
            contact_email: "",
            contact_phone: "",
            opening_hour: 8,
            closing_hour: 22,
            booking_terms: "",
            payment_number: "",
            deposit_enabled: false,
            deposit_percentage: 0,
        },
    });

    useEffect(() => {
        if (setting) {
            form.reset({
                branch_id: setting.branch_id,
                whatsapp_number: setting.whatsapp_number || "",
                contact_email: setting.contact_email || "",
                contact_phone: setting.contact_phone || "",
                opening_hour: setting.opening_hour,
                closing_hour: setting.closing_hour,
                booking_terms: setting.booking_terms || "",
                payment_number: setting.payment_number || "",
                deposit_enabled: setting.deposit_enabled ?? false,
                deposit_percentage: Number(setting.deposit_percentage || 0),
            });
        } else {
            form.reset({
                branch_id: selectedBranchId !== "all" ? Number(selectedBranchId) : undefined,
                whatsapp_number: "",
                contact_email: "",
                contact_phone: "",
                opening_hour: 8,
                closing_hour: 22,
                booking_terms: "",
                payment_number: "",
                deposit_enabled: false,
                deposit_percentage: 0,
            });
        }
    }, [setting, selectedBranchId, form]);

    const depositEnabled = !!form.watch("deposit_enabled");

    return (
        <Card className="max-w-2xl p-6">

            {isSuperAdmin && (
                <div className="mb-8 p-4 bg-muted/50 rounded-lg border border-border">
                    <Label htmlFor="branchSelector" className="mb-2 block text-sm font-semibold">
                        {t("form.branchSelector.label")}
                    </Label>
                    <Select value={selectedBranchId} onValueChange={onBranchChange}>
                        <SelectTrigger id="branchSelector" className="bg-background">
                            <SelectValue placeholder={t("form.branchSelector.placeholder")} />
                        </SelectTrigger>
                        <SelectContent>
                            {branches.map(b => (
                                <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="mt-2 text-xs text-muted-foreground">
                        {t("form.branchSelector.description")}
                    </p>
                </div>
            )}

            {(!isSuperAdmin || selectedBranchId !== "all") ? (
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="settings-form" noValidate>
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium leading-none">{t("form.contactInfo.title")}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="whatsapp_number">{t("form.contactInfo.whatsappLabel")}</Label>
                                <Input id="whatsapp_number" {...form.register("whatsapp_number")} disabled={loading} placeholder={t("form.contactInfo.whatsappPlaceholder")} />
                                {form.formState.errors.whatsapp_number && <p className="text-xs text-destructive">{form.formState.errors.whatsapp_number.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact_phone">{t("form.contactInfo.phoneLabel")}</Label>
                                <Input id="contact_phone" {...form.register("contact_phone")} disabled={loading} placeholder={t("form.contactInfo.phonePlaceholder")} />
                                {form.formState.errors.contact_phone && <p className="text-xs text-destructive">{form.formState.errors.contact_phone.message}</p>}
                            </div>
                            <div className="space-y-2 col-span-1 md:col-span-2">
                                <Label htmlFor="contact_email">{t("form.contactInfo.emailLabel")}</Label>
                                <Input id="contact_email" type="email" {...form.register("contact_email")} disabled={loading} placeholder={t("form.contactInfo.emailPlaceholder")} />
                                {form.formState.errors.contact_email && <p className="text-xs text-destructive">{form.formState.errors.contact_email.message}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-border">
                        <h3 className="text-lg font-medium leading-none">{t("form.payment.title")}</h3>
                        <div className="space-y-2">
                            <Label htmlFor="payment_number" className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                {t("form.payment.numberLabel")}
                            </Label>
                            <Input
                                id="payment_number"
                                {...form.register("payment_number")}
                                disabled={loading}
                                placeholder={t("form.payment.numberPlaceholder")}
                            />
                            {form.formState.errors.payment_number && (
                                <p className="text-xs text-destructive">{form.formState.errors.payment_number.message}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                {t("form.payment.numberDescription")}
                            </p>
                        </div>

                        <div className="space-y-3 rounded-lg border border-border/70 p-4">
                            <div className="flex items-start gap-3">
                                <Checkbox
                                    id="deposit_enabled"
                                    checked={depositEnabled}
                                    onCheckedChange={(checked) => {
                                        form.setValue("deposit_enabled", Boolean(checked), { shouldValidate: true });
                                    }}
                                    disabled={loading}
                                />
                                <div className="space-y-1">
                                    <Label htmlFor="deposit_enabled">{t("form.payment.depositEnabledLabel")}</Label>
                                    <p className="text-xs text-muted-foreground">{t("form.payment.depositEnabledDescription")}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="deposit_percentage">{t("form.payment.depositPercentageLabel")}</Label>
                                <Input
                                    id="deposit_percentage"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    {...form.register("deposit_percentage", { valueAsNumber: true })}
                                    disabled={loading || !depositEnabled}
                                    placeholder={t("form.payment.depositPercentagePlaceholder")}
                                />
                                {form.formState.errors.deposit_percentage && (
                                    <p className="text-xs text-destructive">{form.formState.errors.deposit_percentage.message}</p>
                                )}
                                <p className="text-xs text-muted-foreground">{t("form.payment.depositPercentageDescription")}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-border">
                        <h3 className="text-lg font-medium leading-none">{t("form.operatingHours.title")}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="opening_hour">{t("form.operatingHours.openingLabel")}</Label>
                                <Input id="opening_hour" type="number" min="0" max="23" {...form.register("opening_hour", { valueAsNumber: true })} disabled={loading} />
                                {form.formState.errors.opening_hour && <p className="text-xs text-destructive">{form.formState.errors.opening_hour.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="closing_hour">{t("form.operatingHours.closingLabel")}</Label>
                                <Input id="closing_hour" type="number" min="1" max="24" {...form.register("closing_hour", { valueAsNumber: true })} disabled={loading} />
                                {form.formState.errors.closing_hour && <p className="text-xs text-destructive">{form.formState.errors.closing_hour.message}</p>}
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                            {t("form.operatingHours.description")}
                        </p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-border">
                        <h3 className="text-lg font-medium leading-none">{t("form.bookingTerms.title")}</h3>
                        <div className="space-y-2">
                            <Label htmlFor="booking_terms">{t("form.bookingTerms.label")}</Label>
                            <Textarea 
                                id="booking_terms"
                                placeholder={t("form.bookingTerms.placeholder")}
                                className="min-h-[150px] resize-none"
                                {...form.register("booking_terms")}
                                disabled={loading}
                            />
                            {form.formState.errors.booking_terms && (
                                <p className="text-xs text-destructive">{form.formState.errors.booking_terms.message}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                {t("form.bookingTerms.description")}
                            </p>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button type="submit" disabled={loading} data-testid="save-settings-btn">
                            <Save className="w-4 h-4 mr-2" />
                            {loading ? t("form.actions.saving") : setting ? t("form.actions.updateSettings") : t("form.actions.saveSettings")}
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="py-12 text-center text-muted-foreground">
                    {t("form.branchSelector.selectBranch")}
                </div>
            )}
        </Card>
    );
}
