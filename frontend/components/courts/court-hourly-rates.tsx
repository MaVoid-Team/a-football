"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useHourlyRatesAPI } from "@/hooks/api/use-hourly-rates";
import { HourlyRate, HourlyRateFormData, hourlyRateFormSchema } from "@/schemas/hourly-rate.schema";
import { formatCurrency } from "@/lib/format-currency";
import { Edit, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

interface CourtHourlyRatesProps {
    courtId: string;
    basePricePerHour: string;
}

export function CourtHourlyRates({ courtId, basePricePerHour }: CourtHourlyRatesProps) {
    const t = useTranslations("courts.hourlyRates");
    const { loading, fetchHourlyRates, createHourlyRate, updateHourlyRate, deleteHourlyRate } = useHourlyRatesAPI();
    const [rates, setRates] = useState<HourlyRate[]>([]);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<HourlyRate | null>(null);

    const form = useForm<HourlyRateFormData>({
        resolver: zodResolver(hourlyRateFormSchema),
        defaultValues: {
            start_hour: 8,
            end_hour: 12,
            price_per_hour: Number(basePricePerHour || 0),
            active: true,
        },
    });

    const sortedRates = useMemo(
        () => [...rates].sort((a, b) => a.start_hour - b.start_hour),
        [rates]
    );

    const loadRates = async () => {
        const res = await fetchHourlyRates(courtId);
        if (!res.success) return;

        const mapped = (res.data || []).map((item: any) => ({
            id: item.id,
            ...item.attributes,
        })) as HourlyRate[];
        setRates(mapped);
    };

    useEffect(() => {
        loadRates();
    }, [courtId]);

    const toHourLabel = (hour: number) => `${String(hour).padStart(2, "0")}:00`;

    const openCreateDialog = () => {
        setEditing(null);
        form.reset({
            start_hour: 8,
            end_hour: 12,
            price_per_hour: Number(basePricePerHour || 0),
            active: true,
        });
        setOpen(true);
    };

    const openEditDialog = (rate: HourlyRate) => {
        setEditing(rate);
        form.reset({
            start_hour: rate.start_hour,
            end_hour: rate.end_hour,
            price_per_hour: Number(rate.price_per_hour),
            active: rate.active,
        });
        setOpen(true);
    };

    const onSubmit = async (values: HourlyRateFormData) => {
        const res = editing
            ? await updateHourlyRate(courtId, editing.id, values)
            : await createHourlyRate(courtId, values);

        if (!res.success) {
            toast.error(t("toasts.saveFailed"));
            return;
        }

        toast.success(editing ? t("toasts.updated") : t("toasts.created"));
        setOpen(false);
        await loadRates();
    };

    const handleDelete = async (id: string) => {
        const res = await deleteHourlyRate(courtId, id);
        if (!res.success) {
            toast.error(t("toasts.deleteFailed"));
            return;
        }
        toast.success(t("toasts.deleted"));
        await loadRates();
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>{t("title")}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        {t("defaultFallbackPrice", { price: formatCurrency(basePricePerHour) })}
                    </p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openCreateDialog}>
                            <Plus className="h-4 w-4 mr-2" />
                            {t("addRange")}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editing ? t("editTitle") : t("createTitle")}</DialogTitle>
                            <DialogDescription>
                                {t("description")}
                            </DialogDescription>
                        </DialogHeader>

                        <Form {...form}>
                            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                                <div className="grid grid-cols-2 gap-3">
                                    <FormField
                                        control={form.control}
                                        name="start_hour"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("startHour")}</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min={0} max={23} {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="end_hour"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("endHour")}</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min={1} max={24} {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="price_per_hour"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("pricePerHour")}</FormLabel>
                                            <FormControl>
                                                <Input type="number" min={0} step="0.01" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="active"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-3">
                                            <FormLabel>{t("active")}</FormLabel>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                        {t("cancel")}
                                    </Button>
                                    <Button type="submit" disabled={loading}>
                                        {loading ? t("saving") : t("save")}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </CardHeader>

            <CardContent>
                {sortedRates.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                        {t("empty")}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sortedRates.map((rate) => (
                            <div key={rate.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                                <div className="space-y-1">
                                    <div className="font-medium">
                                        {toHourLabel(rate.start_hour)} - {toHourLabel(rate.end_hour)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {t("perHour", { price: formatCurrency(rate.price_per_hour) })}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Badge variant={rate.active ? "default" : "secondary"}>
                                        {rate.active ? t("statusActive") : t("statusInactive")}
                                    </Badge>
                                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(rate)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <ConfirmDialog
                                        title={t("deleteTitle")}
                                        description={t("deleteDescription", {
                                            start: toHourLabel(rate.start_hour),
                                            end: toHourLabel(rate.end_hour),
                                        })}
                                        onConfirm={() => handleDelete(rate.id)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
