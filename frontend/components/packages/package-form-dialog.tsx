"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Package, packageFormSchema, PackageFormData } from "@/schemas/package.schema";
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

interface PackageFormDialogProps {
    packageItem?: Package;
    branches?: Branch[];
    onSubmit: (data: PackageFormData) => Promise<{ success: boolean; error?: any }>;
}

export function PackageFormDialog({ packageItem, branches = [], onSubmit }: PackageFormDialogProps) {
    const t = useTranslations("packages");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const isEdit = !!packageItem;

    const form = useForm<PackageFormData>({
        resolver: zodResolver(packageFormSchema),
        defaultValues: {
            branch_id: null,
            title: "",
            description: "",
            price: 0,
        },
    });

    useEffect(() => {
        if (open) {
            if (packageItem) {
                form.reset({
                    branch_id: packageItem.branch_id,
                    title: packageItem.title,
                    description: packageItem.description || "",
                    price: Number(packageItem.price),
                });
            } else {
                form.reset({
                    branch_id: null,
                    title: "",
                    description: "",
                    price: 0,
                });
            }
        }
    }, [open, packageItem, form]);

    const handleSubmit = async (data: PackageFormData) => {
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
                    <Button variant="ghost" size="icon" data-testid={`edit-package-${packageItem.id}`}>
                        <Edit className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button data-testid="create-package-btn">
                        <Plus className="mr-2 h-4 w-4" />
                        {t("form.addButton")}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? t("form.editTitle") : t("form.createTitle")}</DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? t("form.editDescription")
                            : t("form.createDescription")}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" data-testid="package-form" noValidate>
                    <div className="space-y-2">
                        <Label htmlFor="branch_id">{t("form.branchLabel")}</Label>
                        <Select
                            disabled={loading}
                            value={form.watch("branch_id") ? String(form.watch("branch_id")) : "global"}
                            onValueChange={(val) => form.setValue("branch_id", val === "global" ? null : Number(val))}
                        >
                            <SelectTrigger id="branch_id" data-testid="package-branch-select">
                                <SelectValue placeholder={t("form.branchPlaceholder")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="global" className="font-semibold text-primary-text">{t("form.branchOption")}</SelectItem>
                                {branches.map((b) => (
                                    <SelectItem key={b.id} value={b.id.toString()}>
                                        {b.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mr-1">{t("form.branchHelp")}</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title">{t("form.titleLabel")}</Label>
                        <Input
                            id="title"
                            placeholder={t("form.titlePlaceholder")}
                            {...form.register("title")}
                            disabled={loading}
                            data-testid="package-title-input"
                        />
                        {form.formState.errors.title && (
                            <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="price">{t("form.priceLabel")}</Label>
                        <Input
                            id="price"
                            type="number"
                            min="0"
                            step="0.01"
                            {...form.register("price", { valueAsNumber: true })}
                            disabled={loading}
                            data-testid="package-price-input"
                        />
                        {form.formState.errors.price && (
                            <p className="text-xs text-destructive">{form.formState.errors.price.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">{t("form.descriptionLabel")}</Label>
                        <Textarea
                            id="description"
                            placeholder={t("form.descriptionPlaceholder")}
                            {...form.register("description")}
                            disabled={loading}
                            data-testid="package-desc-input"
                            className="resize-y"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            {t("form.cancel")}
                        </Button>
                        <Button type="submit" disabled={loading} data-testid="package-submit-btn">
                            {loading ? t("form.saving") : t("form.save")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
