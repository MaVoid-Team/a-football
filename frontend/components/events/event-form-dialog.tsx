"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Event, eventFormSchema, EventFormData } from "@/schemas/event.schema";
import { Branch } from "@/schemas/branch.schema";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Edit } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface EventFormDialogProps {
    event?: Event;
    branches?: Branch[];
    onSubmit: (data: EventFormData) => Promise<{ success: boolean; error?: any }>;
}

export function EventFormDialog({ event, branches = [], onSubmit }: EventFormDialogProps) {
    const t = useTranslations("events.form");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const isEdit = !!event;

    const form = useForm<EventFormData>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: {
            branch_id: 0,
            title: "",
            description: "",
            start_date: "",
            participation_price: 0,
            max_participants: undefined,
        },
    });

    useEffect(() => {
        if (open) {
            if (event) {
                form.reset({
                    branch_id: event.branch_id,
                    title: event.title,
                    description: event.description || "",
                    start_date: event.start_date.split("T")[0], // Assuming API sends full ISO, we just need YYYY-MM-DD for simple date input
                    participation_price: event.participation_price ? Number(event.participation_price) : 0,
                    max_participants: event.max_participants || undefined,
                });
            } else {
                form.reset({
                    branch_id: branches.length > 0 ? Number(branches[0].id) : 0,
                    title: "",
                    description: "",
                    start_date: new Date().toISOString().split("T")[0],
                    participation_price: 0,
                    max_participants: undefined,
                });
            }
        }
    }, [open, event, form, branches]);

    const handleSubmit = async (data: EventFormData) => {
        setLoading(true);
        // Transform empty string to undefined if needed for max_participants
        const res = await onSubmit(data);
        setLoading(false);
        if (res.success) {
            setOpen(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {isEdit ? (
                    <Button variant="ghost" size="icon" data-testid={`edit-event-${event.id}`}>
                        <Edit className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button data-testid="create-event-btn">
                        <Plus className="mr-2 h-4 w-4" />
                        {t("addButton")}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? t("editTitle") : t("createTitle")}</DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? t("editDescription")
                            : t("createDescription")}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" data-testid="event-form" noValidate>
                    <div className="space-y-2">
                        <Label htmlFor="branch_id">{t("branchLabel")}</Label>
                        <Select
                            disabled={loading}
                            value={form.watch("branch_id") ? String(form.watch("branch_id")) : ""}
                            onValueChange={(val) => form.setValue("branch_id", Number(val))}
                        >
                            <SelectTrigger id="branch_id" data-testid="event-branch-select">
                                <SelectValue placeholder={t("selectBranch")} />
                            </SelectTrigger>
                            <SelectContent>
                                {branches.map((b) => (
                                    <SelectItem key={b.id} value={b.id.toString()}>
                                        {b.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {form.formState.errors.branch_id && (
                            <p className="text-xs text-destructive">{form.formState.errors.branch_id.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title">{t("titleLabel")}</Label>
                        <Input
                            id="title"
                            placeholder={t("titlePlaceholder")}
                            {...form.register("title")}
                            disabled={loading}
                            data-testid="event-title-input"
                        />
                        {form.formState.errors.title && (
                            <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start_date">{t("startDateLabel")}</Label>
                            <Input
                                id="start_date"
                                type="date"
                                {...form.register("start_date")}
                                disabled={loading}
                                data-testid="event-date-input"
                            />
                            {form.formState.errors.start_date && (
                                <p className="text-xs text-destructive">{form.formState.errors.start_date.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="participation_price">{t("priceLabel")}</Label>
                            <Input
                                id="participation_price"
                                type="number"
                                min="0"
                                step="0.01"
                                {...form.register("participation_price", { valueAsNumber: true })}
                                disabled={loading}
                                data-testid="event-price-input"
                            />
                            <p className="text-[10px] text-muted-foreground mr-1">{t("priceHint")}</p>
                            {form.formState.errors.participation_price && (
                                <p className="text-xs text-destructive">{form.formState.errors.participation_price.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="max_participants">{t("maxParticipantsLabel")}</Label>
                        <Input
                            id="max_participants"
                            type="number"
                            min="1"
                            placeholder={t("maxParticipantsPlaceholder")}
                            {...form.register("max_participants", { setValueAs: (v) => v === "" || Number.isNaN(Number(v)) ? undefined : Number(v) })}
                            disabled={loading}
                            data-testid="event-participants-input"
                        />
                        {form.formState.errors.max_participants && (
                            <p className="text-xs text-destructive">{form.formState.errors.max_participants.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">{t("descriptionLabel")}</Label>
                        <Textarea
                            id="description"
                            placeholder={t("descriptionPlaceholder")}
                            {...form.register("description")}
                            disabled={loading}
                            data-testid="event-desc-input"
                            className="resize-y"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            {t("cancelButton")}
                        </Button>
                        <Button type="submit" disabled={loading} data-testid="event-submit-btn">
                            {loading ? t("savingButton") : t("saveButton")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
