"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Plus, Edit, Percent, DollarSign, Calendar, Users } from "lucide-react";
import { usePromoCodesAPI } from "@/hooks/api/use-promo-codes";
import { useBranchesAPI } from "@/hooks/api/use-branches";
import { PromoCode, promoCodeFormSchema, PromoCodeFormData } from "@/schemas/promo-code.schema";
import { formatCurrency } from "@/lib/format-currency";
import { formatDate } from "@/lib/format-date";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

const toLocalDateTime = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

export default function PromoCodesAdminPage() {
  const t = useTranslations("promoCodes");
  const searchParams = useSearchParams();
  const { branches, fetchBranches } = useBranchesAPI();
  const { fetchPromoCodes, createPromoCode, updatePromoCode, deletePromoCode } = usePromoCodesAPI();

  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [loadingPage, setLoadingPage] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PromoCode | null>(null);

  const form = useForm<PromoCodeFormData>({
    resolver: zodResolver(promoCodeFormSchema),
    defaultValues: {
      code: "",
      description: "",
      discount_type: "percentage",
      discount_percentage: undefined,
      discount_amount: undefined,
      minimum_amount: undefined,
      usage_limit: undefined,
      starts_at: "",
      expires_at: "",
      active: true,
    },
  });

  const selectedBranchName = useMemo(() => {
    return branches.find((b) => String(b.id) === selectedBranchId)?.name || t("selectedBranchFallback");
  }, [branches, selectedBranchId]);

  const loadPromoCodes = async (branchId: string) => {
    try {
      const response = await fetchPromoCodes(branchId);
      if (response?.data) {
        setPromoCodes(
          response.data.map((item: any) => ({
            id: item.id,
            ...item.attributes,
          })),
        );
      } else {
        setPromoCodes([]);
      }
    } catch {
      toast.error(t("toasts.loadPromoCodesError"));
      setPromoCodes([]);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoadingPage(true);
      const result = await fetchBranches({ per_page: 500 });

      if (!result.success) {
        toast.error(t("toasts.loadBranchesError"));
        setLoadingPage(false);
        return;
      }

      setLoadingPage(false);
    };

    init();
  }, [fetchBranches]);

  useEffect(() => {
    if (!branches.length || selectedBranchId) return;

    const queryBranchId = searchParams.get("branch_id");
    const hasQueryBranch = queryBranchId && branches.some((b) => String(b.id) === queryBranchId);

    setSelectedBranchId(hasQueryBranch ? String(queryBranchId) : String(branches[0].id));
  }, [branches, selectedBranchId, searchParams]);

  useEffect(() => {
    if (!selectedBranchId) return;
    loadPromoCodes(selectedBranchId);
  }, [selectedBranchId]);

  const openCreate = () => {
    setEditing(null);
    form.reset({
      code: "",
      description: "",
      discount_type: "percentage",
      discount_percentage: undefined,
      discount_amount: undefined,
      minimum_amount: undefined,
      usage_limit: undefined,
      starts_at: "",
      expires_at: "",
      active: true,
    });
    setOpen(true);
  };

  const openEdit = (promoCode: PromoCode) => {
    setEditing(promoCode);
    form.reset({
      code: promoCode.code,
      description: promoCode.description,
      discount_type: promoCode.discount_percentage ? "percentage" : "amount",
      discount_percentage: promoCode.discount_percentage || undefined,
      discount_amount: promoCode.discount_amount || undefined,
      minimum_amount: promoCode.minimum_amount || undefined,
      usage_limit: promoCode.usage_limit || undefined,
      starts_at: toLocalDateTime(promoCode.starts_at),
      expires_at: toLocalDateTime(promoCode.expires_at),
      active: promoCode.active,
    });
    setOpen(true);
  };

  const onSubmit = async (data: PromoCodeFormData) => {
    if (!selectedBranchId) return;

    const payload = {
      ...data,
      code: data.code.trim().toUpperCase(),
      discount_percentage: data.discount_type === "percentage" ? data.discount_percentage : undefined,
      discount_amount: data.discount_type === "amount" ? data.discount_amount : undefined,
      expires_at: data.expires_at || undefined,
    };

    try {
      if (editing) {
        await updatePromoCode(selectedBranchId, editing.id, payload);
        toast.success(t("toasts.updated"));
      } else {
        await createPromoCode(selectedBranchId, payload);
        toast.success(t("toasts.created"));
      }
      setOpen(false);
      await loadPromoCodes(selectedBranchId);
    } catch {
      toast.error(t("toasts.saveError"));
    }
  };

  const handleDelete = async (promoCodeId: string) => {
    if (!selectedBranchId) return;

    try {
      await deletePromoCode(selectedBranchId, promoCodeId);
      toast.success(t("toasts.deleted"));
      await loadPromoCodes(selectedBranchId);
    } catch {
      toast.error(t("toasts.deleteError"));
    }
  };

  if (loadingPage) {
    return (
      <div className="space-y-4">
        <div className="h-8 rounded bg-muted animate-pulse" />
        <div className="h-40 rounded bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder={t("selectBranch")} />
            </SelectTrigger>
            <SelectContent>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={String(branch.id)}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={openCreate} disabled={!selectedBranchId}>
            <Plus className="mr-2 h-4 w-4" />
            {t("addPromoCode")}
          </Button>
        </div>
      </div>

      {promoCodes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Percent className="h-10 w-10 text-muted-foreground/50 mb-4" />
            <h2 className="text-lg font-semibold">{t("emptyTitle", { branch: selectedBranchName })}</h2>
            <p className="text-muted-foreground text-center mt-1 mb-4">{t("emptyDescription")}</p>
            <Button onClick={openCreate} disabled={!selectedBranchId}>
              <Plus className="mr-2 h-4 w-4" />
              {t("createPromoCode")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {promoCodes.map((promoCode) => (
            <Card key={promoCode.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{promoCode.code}</h3>
                      <Badge variant={promoCode.active ? "default" : "secondary"}>
                        {promoCode.active ? t("status.active") : t("status.inactive")}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">{promoCode.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        {promoCode.discount_percentage ? (
                          <>
                            <Percent className="h-4 w-4 text-primary-text" />
                            <span>{t("discountPercent", { value: promoCode.discount_percentage })}</span>
                          </>
                        ) : (
                          <>
                            <DollarSign className="h-4 w-4 text-primary-text" />
                            <span>{t("discountAmount", { value: formatCurrency(Number(promoCode.discount_amount || 0)) })}</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>{t("minimumAmount", { value: formatCurrency(Number(promoCode.minimum_amount || 0)) })}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {t("usage", {
                            used: promoCode.used_count,
                            limit: promoCode.usage_limit || t("unlimited"),
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {formatDate(promoCode.starts_at)}
                          {promoCode.expires_at ? ` - ${formatDate(promoCode.expires_at)}` : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(promoCode)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <ConfirmDialog
                      title={t("deleteTitle")}
                      description={t("deleteDescription", { code: promoCode.code })}
                      onConfirm={() => handleDelete(promoCode.id)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? t("form.editTitle") : t("form.addTitle")}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.codeLabel")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("form.codePlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discount_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.discountTypeLabel")}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("form.discountTypePlaceholder")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="percentage">{t("form.discountTypePercentage")}</SelectItem>
                          <SelectItem value="amount">{t("form.discountTypeAmount")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.descriptionLabel")}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t("form.descriptionPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="discount_percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.discountPercentageLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          step="0.01"
                          disabled={form.watch("discount_type") !== "percentage"}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discount_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.discountAmountLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0.01"
                          step="0.01"
                          disabled={form.watch("discount_type") !== "amount"}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="minimum_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.minimumAmountLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="usage_limit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.usageLimitLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="starts_at"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.startsAtLabel")}</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expires_at"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.expiresAtLabel")}</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <FormLabel>{t("form.activeLabel")}</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  {t("form.cancel")}
                </Button>
                <Button type="submit">{editing ? t("form.update") : t("form.create")}</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
