"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Branch, branchFormSchema, BranchFormData } from "@/schemas/branch.schema";
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
import { Switch } from "@/components/ui/switch";
import { Plus, Edit } from "lucide-react";

interface BranchFormDialogProps {
    branch?: Branch; // If provided, it's edit mode
    onSubmit: (data: BranchFormData) => Promise<{ success: boolean; error?: any }>;
}

export function BranchFormDialog({ branch, onSubmit }: BranchFormDialogProps) {
    const t = useTranslations("branches.form");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const isEdit = !!branch;

    const form = useForm<BranchFormData>({
        resolver: zodResolver(branchFormSchema),
        defaultValues: {
            name: "",
            address: "",
            timezone: "UTC",
            active: true,
        },
    });

    // Reset form when opening/closing or when branch prop changes
    useEffect(() => {
        if (open) {
            if (branch) {
                form.reset({
                    name: branch.name || "",
                    address: branch.address || "",
                    timezone: branch.timezone || "UTC",
                    active: branch.active ?? true,
                });
            } else {
                form.reset({
                    name: "",
                    address: "",
                    timezone: "UTC",
                    active: true,
                });
            }
        }
    }, [open, branch, form]);

    const handleSubmit = async (data: BranchFormData) => {
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
                    <Button variant="ghost" size="icon" data-testid={`edit-branch-${branch.id}`}>
                        <Edit className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button data-testid="create-branch-btn">
                        <Plus className="mr-2 h-4 w-4" />
                        {t("addButton")}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? t("editTitle") : t("createTitle")}</DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? t("editDescription")
                            : t("createDescription")}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" data-testid="branch-form" noValidate>
                    <div className="space-y-2">
                        <Label htmlFor="name">{t("nameLabel")}</Label>
                        <Input
                            id="name"
                            {...form.register("name")}
                            disabled={loading}
                            data-testid="branch-name-input"
                        />
                        {form.formState.errors.name && (
                            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">{t("addressLabel")}</Label>
                        <Input
                            id="address"
                            {...form.register("address")}
                            disabled={loading}
                            data-testid="branch-address-input"
                        />
                        {form.formState.errors.address && (
                            <p className="text-xs text-destructive">{form.formState.errors.address.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="timezone">{t("timezoneLabel")}</Label>
                        <Input
                            id="timezone"
                            {...form.register("timezone")}
                            disabled={loading}
                            data-testid="branch-timezone-input"
                        />
                        {form.formState.errors.timezone && (
                            <p className="text-xs text-destructive">{form.formState.errors.timezone.message}</p>
                        )}
                        <p className="text-xs text-muted-foreground">{t("timezoneHint")}</p>
                    </div>

                    <div className="flex flex-row items-center justify-between rounded-lg border border-border p-3 shadow-sm">
                        <div className="space-y-0.5">
                            <Label htmlFor="active">{t("activeStatusLabel")}</Label>
                            <p className="text-xs text-muted-foreground">{t("activeStatusHelp")}</p>
                        </div>
                        <Switch
                            id="active"
                            checked={form.watch("active")}
                            onCheckedChange={(val) => form.setValue("active", val)}
                            disabled={loading}
                            data-testid="branch-active-switch"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            {t("cancel")}
                        </Button>
                        <Button type="submit" disabled={loading} data-testid="branch-submit-btn">
                            {loading ? t("saving") : t("save")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
