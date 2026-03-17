"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BlockedSlot, blockedSlotFormSchema, BlockedSlotFormData } from "@/schemas/blocked-slot.schema";
import { Branch } from "@/schemas/branch.schema";
import { Court } from "@/schemas/court.schema";
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

interface BlockedSlotFormDialogProps {
    blockedSlot?: BlockedSlot;
    branches?: Branch[];
    courts?: Court[];
    onSubmit: (data: BlockedSlotFormData) => Promise<{ success: boolean; error?: any }>;
}

export function BlockedSlotFormDialog({ blockedSlot, branches = [], courts = [], onSubmit }: BlockedSlotFormDialogProps) {
    const t = useTranslations("blockedSlots.form");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const isEdit = !!blockedSlot;

    const form = useForm<BlockedSlotFormData>({
        resolver: zodResolver(blockedSlotFormSchema),
        defaultValues: {
            branch_id: 0,
            court_id: 0,
            date: "",
            start_time: "",
            end_time: "",
            reason: "",
        },
    });

    const selectedBranchId = form.watch("branch_id");
    const filteredCourts = courts.filter(c => c.branch_id === selectedBranchId);

    useEffect(() => {
        if (open) {
            if (blockedSlot) {
                // format time back to HH:MM for input type="time"
                const stDate = new Date(blockedSlot.start_time);
                const stTime = !isNaN(stDate.getTime()) ? stDate.toISOString().substring(11, 16) : blockedSlot.start_time;

                const etDate = new Date(blockedSlot.end_time);
                const etTime = !isNaN(etDate.getTime()) ? etDate.toISOString().substring(11, 16) : blockedSlot.end_time;

                form.reset({
                    branch_id: blockedSlot.branch_id,
                    court_id: blockedSlot.court_id,
                    date: blockedSlot.date,
                    start_time: stTime,
                    end_time: etTime,
                    reason: blockedSlot.reason,
                });
            } else {
                form.reset({
                    branch_id: branches.length > 0 ? Number(branches[0].id) : 0,
                    court_id: 0,
                    date: new Date().toISOString().split("T")[0],
                    start_time: "09:00",
                    end_time: "10:00",
                    reason: "Maintenance",
                });
            }
        }
    }, [open, blockedSlot, form, branches]);

    const handleSubmit = async (data: BlockedSlotFormData) => {
        setLoading(true);
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
                    <Button variant="ghost" size="icon" data-testid={`edit-blocked-slot-${blockedSlot.id}`}>
                        <Edit className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button data-testid="create-blocked-slot-btn">
                        <Plus className="mr-2 h-4 w-4" />
                        {t("createButton")}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? t("editTitle") : t("createTitle")}</DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? t("editDescription")
                            : t("createDescription")}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" data-testid="blocked-slot-form" noValidate>
                    <div className="space-y-2">
                        <Label htmlFor="branch_id">{t("branchLabel")}</Label>
                        <Select
                            disabled={loading || isEdit}
                            value={form.watch("branch_id") ? String(form.watch("branch_id")) : ""}
                            onValueChange={(val) => {
                                form.setValue("branch_id", Number(val));
                                form.setValue("court_id", 0); // Reset court when branch changes
                            }}
                        >
                            <SelectTrigger id="branch_id" data-testid="bs-branch-select">
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
                        <Label htmlFor="court_id">{t("courtLabel")}</Label>
                        <Select
                            disabled={loading || isEdit || !selectedBranchId}
                            value={form.watch("court_id") ? String(form.watch("court_id")) : ""}
                            onValueChange={(val) => form.setValue("court_id", Number(val))}
                        >
                            <SelectTrigger id="court_id" data-testid="bs-court-select">
                                <SelectValue placeholder={t("selectCourt")} />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredCourts.map((c) => (
                                    <SelectItem key={c.id} value={c.id.toString()}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {form.formState.errors.court_id && (
                            <p className="text-xs text-destructive">{form.formState.errors.court_id.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date">{t("dateLabel")}</Label>
                        <Input
                            id="date"
                            type="date"
                            {...form.register("date")}
                            disabled={loading}
                            data-testid="bs-date-input"
                        />
                        {form.formState.errors.date && (
                            <p className="text-xs text-destructive">{form.formState.errors.date.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start_time">{t("startTimeLabel")}</Label>
                            <Input
                                id="start_time"
                                type="time"
                                {...form.register("start_time")}
                                disabled={loading}
                                data-testid="bs-start-input"
                            />
                            {form.formState.errors.start_time && (
                                <p className="text-xs text-destructive">{form.formState.errors.start_time.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="end_time">{t("endTimeLabel")}</Label>
                            <Input
                                id="end_time"
                                type="time"
                                {...form.register("end_time")}
                                disabled={loading}
                                data-testid="bs-end-input"
                            />
                            {form.formState.errors.end_time && (
                                <p className="text-xs text-destructive">{form.formState.errors.end_time.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason">{t("reasonLabel")}</Label>
                        <Input
                            id="reason"
                            placeholder={t("reasonPlaceholder")}
                            {...form.register("reason")}
                            disabled={loading}
                            data-testid="bs-reason-input"
                        />
                        {form.formState.errors.reason && (
                            <p className="text-xs text-destructive">{form.formState.errors.reason.message}</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            {t("cancel")}
                        </Button>
                        <Button type="submit" disabled={loading} data-testid="bs-submit-btn">
                            {loading ? t("saving") : t("save")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
