"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { Loader2, MapPin, Clock, User, Phone, Tag, AlertCircle, CreditCard } from "lucide-react";
import { toast } from "sonner";

import { useCourtsAPI } from "@/hooks/api/use-courts";
import { useAvailabilityAPI } from "@/hooks/api/use-availability";
import { useBookingsAPI } from "@/hooks/api/use-bookings";
import { useSettingsAPI } from "@/hooks/api/use-settings";
import { useBranchesAPI } from "@/hooks/api/use-branches";
import { bookingFormSchema, BookingFormData, Booking } from "@/schemas/booking.schema";
import { Court } from "@/schemas/court.schema";
import { Branch } from "@/schemas/branch.schema";

import { AvailabilityGrid } from "@/components/book/availability-grid";
import { BookingConfirmation } from "@/components/book/booking-confirmation";
import { CourtPerksDisplay } from "@/components/courts/court-perks-display";
import { PromoCodeInput } from "@/components/book/promo-code-input";
import { BookingTermsDialog } from "@/components/book/booking-terms-dialog";
import { PaymentScreenshotUpload } from "@/components/book/payment-screenshot-upload";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/format-currency";

interface Slot {
    start_time: string;
    end_time: string;
}

export function BookingView() {
    const t = useTranslations("publicBook");

    const { branches, fetchPublicBranches, loading: branchesLoading } = useBranchesAPI();
    const { courts, fetchPublicCourts, loading: courtsLoading, error: courtsError } = useCourtsAPI();
    const { availability, fetchAvailability, loading: availabilityLoading } = useAvailabilityAPI();
    const { createBooking, loading: bookingLoading } = useBookingsAPI();
    const { setting, fetchPublicSettings } = useSettingsAPI();

    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
    const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedSlots, setSelectedSlots] = useState<Slot[]>([]);
    const [bookingResult, setBookingResult] = useState<Booking | null>(null);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);

    const bookingTerms = (setting as any)?.booking_terms as string | undefined;
    const hasTerms = !!bookingTerms;
    const paymentNumber = (setting as any)?.payment_number as string | undefined;

    const form = useForm<BookingFormData>({
        resolver: zodResolver(bookingFormSchema),
        defaultValues: {
            branch_id: 0,
            court_id: 0,
            date: "",
            start_time: "",
            end_time: "",
            booking_slots_attributes: [],
            user_name: "",
            user_phone: "",
            notes: "",
            promo_code: "",
        },
    });

    // ── Data fetching ──

    useEffect(() => {
        fetchPublicBranches();
    }, [fetchPublicBranches]);

    useEffect(() => {
        if (selectedBranch) {
            fetchPublicCourts({ branch_id: Number(selectedBranch.id) });
            fetchPublicSettings({ branch_id: Number(selectedBranch.id) });
        }
    }, [selectedBranch, fetchPublicCourts, fetchPublicSettings]);

    useEffect(() => {
        if (selectedCourt && selectedDate && selectedBranch) {
            fetchAvailability({
                branch_id: Number(selectedBranch.id),
                court_id: Number(selectedCourt.id),
                date: format(selectedDate, "yyyy-MM-dd"),
            });
            clearSlots();
        }
    }, [selectedCourt, selectedDate, selectedBranch, fetchAvailability]);

    // ── Helpers ──

    const clearSlots = useCallback(() => {
        setSelectedSlots([]);
        form.setValue("start_time", "");
        form.setValue("end_time", "");
        form.setValue("booking_slots_attributes", []);
    }, [form]);

    // ── Handlers ──

    const handleBranchSelect = useCallback((branchId: string) => {
        const branch = branches.find((b) => String(b.id) === branchId) ?? null;
        setSelectedBranch(branch);
        setSelectedCourt(null);
        setSelectedDate(undefined);
        setAcceptedTerms(false);
        setSubmitError(null);
        form.setValue("branch_id", branch ? Number(branch.id) : 0);
        form.setValue("court_id", 0);
        form.setValue("date", "");
        clearSlots();
    }, [branches, form, clearSlots]);

    const handleCourtSelect = useCallback((courtId: string) => {
        const court = courts.find((c) => String(c.id) === courtId) ?? null;
        setSelectedCourt(court);
        setSubmitError(null);
        form.setValue("court_id", court ? Number(court.id) : 0);
        clearSlots();
    }, [courts, form, clearSlots]);

    const handleDateSelect = useCallback((date: Date | undefined) => {
        if (!date) return;
        setSelectedDate(date);
        setSubmitError(null);
        form.setValue("date", format(date, "yyyy-MM-dd"));
        clearSlots();
    }, [form, clearSlots]);

    const handleSlotToggle = useCallback((slot: Slot) => {
        setSubmitError(null);
        setSelectedSlots(prev => {
            const exists = prev.some(s => s.start_time === slot.start_time);
            const updated = exists
                ? prev.filter(s => s.start_time !== slot.start_time)
                : [...prev, slot].sort((a, b) => a.start_time.localeCompare(b.start_time));
            form.setValue("booking_slots_attributes", updated);
            form.clearErrors("booking_slots_attributes");
            return updated;
        });
    }, [form]);

    const onSubmit = async (data: BookingFormData) => {
        setSubmitError(null);
        const slots = data.booking_slots_attributes;
        const bookingData: BookingFormData = {
            ...data,
            branch_id: Number(selectedBranch!.id),
            court_id: Number(selectedCourt!.id),
            start_time: slots[0]?.start_time,
            end_time: slots[slots.length - 1]?.end_time,
        };

        const res = await createBooking(bookingData, paymentScreenshot);

        if (res.success) {
            const raw = (res.data as any)?.data;
            if (raw) {
                setBookingResult({ id: raw.id, ...raw.attributes });
                toast.success(t("bookingSuccess"));
            }
        } else {
            const errMsg =
                (res as any).error?.response?.data?.errors?.[0] ??
                (res as any).error?.response?.data?.error ??
                t("bookingFailed");
            setSubmitError(errMsg);
            toast.error(errMsg);
        }
    };

    // ── Derived values ──

    const activeBranches = branches.filter((b) => b.active);
    const activeCourts   = courts.filter((c) => c.active);
    const activePerks    = selectedCourt?.perks?.filter((p) => p.active) ?? [];
    const availableSlots = availability?.available_slots ?? [];

    const totalHours = selectedSlots.reduce((sum, slot) => {
        const start = new Date(`2000-01-01T${slot.start_time}:00`);
        const end   = new Date(`2000-01-01T${slot.end_time}:00`);
        return sum + (end.getTime() - start.getTime()) / 3_600_000;
    }, 0);

    const estimatedPrice = selectedCourt
        ? totalHours * Number(selectedCourt.price_per_hour ?? 0)
        : 0;

    const canSubmit =
        !!selectedBranch &&
        !!selectedCourt &&
        !!selectedDate &&
        selectedSlots.length > 0 &&
        (!hasTerms || acceptedTerms) &&
        !bookingLoading;

    // ── Confirmation screen ──

    if (bookingResult) {
        return <BookingConfirmation booking={bookingResult} court={selectedCourt} />;
    }

    return (
        <div className="w-full max-w-3xl mx-auto space-y-4">
            <div className="flex flex-col items-center text-center space-y-2 mb-8">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{t("title")}</h1>
                <p className="text-muted-foreground text-base">{t("subtitle")}</p>
            </div>

            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>

                    {/* Step 1: Branch & Court */}
                    <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>{t("steps.chooseCourt")}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="branch_id"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4" />
                                                {t("selectBranchPlaceholder")}
                                            </FormLabel>
                                            <Select
                                                onValueChange={handleBranchSelect}
                                                value={selectedBranch ? String(selectedBranch.id) : ""}
                                                disabled={branchesLoading}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-10 w-full">
                                                        <SelectValue placeholder={branchesLoading ? t("loading") : t("selectBranchPlaceholder")} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="max-h-[300px]">
                                                    {activeBranches.length === 0 && !branchesLoading && (
                                                        <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                                                            <AlertCircle className="w-4 h-4 mx-auto mb-2" />
                                                            {t("noBranchesAvailable")}
                                                        </div>
                                                    )}
                                                    {activeBranches.map((branch) => (
                                                        <SelectItem key={branch.id} value={String(branch.id)}>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{branch.name}</span>
                                                                {branch.address && (
                                                                    <span className="text-sm text-muted-foreground">{branch.address}</span>
                                                                )}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="court_id"
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>{t("courtLabel")}</FormLabel>
                                            <Select
                                                onValueChange={handleCourtSelect}
                                                value={selectedCourt ? String(selectedCourt.id) : ""}
                                                disabled={!selectedBranch || courtsLoading}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-10 w-full">
                                                        <SelectValue
                                                            placeholder={
                                                                courtsLoading
                                                                    ? t("loading")
                                                                    : !selectedBranch
                                                                        ? t("selectBranchFirst")
                                                                        : t("selectCourtPlaceholder")
                                                            }
                                                        />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="max-h-[300px]">
                                                    {selectedBranch && activeCourts.length === 0 && !courtsLoading && (
                                                        <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                                                            <AlertCircle className="w-4 h-4 mx-auto mb-2" />
                                                            {t("noCourtsAvailable")}
                                                        </div>
                                                    )}
                                                    {activeCourts.map((court) => {
                                                        const perks = court.perks?.filter((p) => p.active) ?? [];
                                                        return (
                                                            <SelectItem key={court.id} value={String(court.id)}>
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium whitespace-nowrap">
                                                                        {court.name} ({formatCurrency(court.price_per_hour)} {t("perHour")})
                                                                    </span>
                                                                    {perks.length > 0 && (
                                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                                            {perks.slice(0, 2).map((perk) => (
                                                                                <span key={perk.id} className="text-xs bg-primary/10 text-primary-text px-2 py-0.5 rounded">
                                                                                    {perk.name}
                                                                                </span>
                                                                            ))}
                                                                            {perks.length > 2 && (
                                                                                <span className="text-xs text-muted-foreground">
                                                                                    +{perks.length - 2} {t("morePerks", { count: perks.length - 2 })}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                            {courtsError && (
                                                <p className="text-sm text-destructive mt-2 flex items-center gap-1">
                                                    <AlertCircle className="w-4 h-4" />
                                                    {courtsError}
                                                </p>
                                            )}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Court Perks */}
                    {selectedCourt && activePerks.length > 0 && (
                        <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Tag className="w-4 h-4 mr-2" />
                                    {t("courtPerks")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <CourtPerksDisplay perks={activePerks} />
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 2: Date & Time */}
                    <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>{t("steps.selectDate")}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            {!selectedCourt ? (
                                <EmptyState icon={<Clock className="w-8 h-8" />} message={t("selectCourtFirst")} />
                            ) : (
                                <div className="flex justify-center border rounded-xl overflow-hidden py-2 bg-background/50">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={handleDateSelect}
                                        disabled={{ before: new Date() }}
                                        className="rounded-md"
                                    />
                                </div>
                            )}

                            <input type="hidden" {...form.register("date")} />

                            {!selectedCourt || !selectedDate ? (
                                <EmptyState icon={<Clock className="w-8 h-8" />} message={t("selectCourtAndDate")} />
                            ) : (
                                <>
                                    <AvailabilityGrid
                                        slots={availableSlots}
                                        selectedSlots={selectedSlots}
                                        onToggle={handleSlotToggle}
                                        isLoading={availabilityLoading}
                                    />

                                    {selectedSlots.length > 0 && (
                                        <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm">
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">
                                                    {selectedSlots.length} {selectedSlots.length === 1 ? "slot" : "slots"} ({totalHours}h)
                                                </span>
                                                <span className="font-semibold text-primary-text">
                                                    {formatCurrency(estimatedPrice)}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {selectedSlots.map(s => `${s.start_time}–${s.end_time}`).join(", ")}
                                            </p>
                                        </div>
                                    )}

                                    {form.formState.errors.booking_slots_attributes && (
                                        <p className="text-[0.8rem] font-medium text-destructive mt-3">
                                            {t("selectAvailableSlot")}
                                        </p>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Step 3: Your Info */}
                    <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>{t("steps.yourInfo")}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="user_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                {t("fullNameLabel")}
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder={t("fullNamePlaceholder")} className="h-10" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="user_phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Phone className="w-4 h-4" />
                                                {t("phoneLabel")}
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder={t("phonePlaceholder")} className="h-10" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("notesLabel")}</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder={t("notesPlaceholder")}
                                                className="min-h-[80px] resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <PromoCodeInput
                                branchId={selectedBranch ? String(selectedBranch.id) : undefined}
                                selectedCourt={selectedCourt ?? undefined}
                                selectedSlots={selectedSlots}
                            />

                            {paymentNumber && (
                                <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                                    <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                                        <CreditCard className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                                            {t("paymentInstructionsTitle")}
                                        </p>
                                        <p className="text-sm text-amber-700/80 dark:text-amber-300/80">
                                            {t("paymentInstructionsBody")}
                                        </p>
                                        <p className="text-lg font-bold tracking-wide text-amber-700 dark:text-amber-300 mt-1">
                                            {paymentNumber}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <PaymentScreenshotUpload
                                value={paymentScreenshot}
                                onChange={setPaymentScreenshot}
                            />

                            {hasTerms && (
                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        id="terms"
                                        checked={acceptedTerms}
                                        onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                                    />
                                    <label htmlFor="terms" className="text-sm font-medium leading-none cursor-pointer">
                                        {t("termsPrefix")}{" "}
                                        <BookingTermsDialog
                                            terms={bookingTerms!}
                                            trigger={
                                                <button type="button" className="text-primary-text underline underline-offset-2 hover:text-primary-text/80">
                                                    {t("termsLink")}
                                                </button>
                                            }
                                        />
                                    </label>
                                </div>
                            )}

                            {submitError && (
                                <div className="flex items-center gap-3 text-destructive">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <p className="text-sm font-medium">{submitError}</p>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-12 text-base font-semibold"
                                disabled={!canSubmit}
                            >
                                {bookingLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        {t("processingBooking")}
                                    </>
                                ) : (
                                    t("confirmBooking")
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </form>
            </FormProvider>
        </div>
    );
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
    return (
        <div className="py-12 bg-muted/30 border border-dashed border-border/60 rounded-2xl flex flex-col items-center justify-center text-center">
            <div className="text-muted-foreground mb-4">{icon}</div>
            <p className="text-muted-foreground">{message}</p>
        </div>
    );
}
