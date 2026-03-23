"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { usePackagesAPI } from "@/hooks/api/use-packages";
import { usePackageRequestsAPI } from "@/hooks/api/use-package-requests";
import { useBranchesAPI } from "@/hooks/api/use-branches";
import { packageRequestFormSchema } from "@/schemas/package-request.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format-currency";
import { ChevronLeft, Mail, Phone, User } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Skeleton } from "@/components/ui/skeleton";

interface PackageDetailProps {
    packageId: string;
}

export function PackageDetail({ packageId }: PackageDetailProps) {
    const t = useTranslations("packageDetail");
    const { packageItem: pkg, loading: packageLoading, fetchPackage } = usePackagesAPI();
    const { submitRequest, loading: submitLoading } = usePackageRequestsAPI();
    const { branches } = useBranchesAPI();
    const [formSubmitted, setFormSubmitted] = useState(false);

    const form = useForm({
        resolver: zodResolver(packageRequestFormSchema),
        defaultValues: {
            package_id: packageId,
            customer_name: "",
            customer_email: "",
            customer_phone: "",
            special_needs: "",
        },
    });

    useEffect(() => {
        if (packageId) {
            // Use admin fetch to get package details
            fetchPackage(packageId);
        }
    }, [packageId, fetchPackage]);

    const onSubmit = async (data: any) => {
        const result = await submitRequest({
            ...data,
            package_id: packageId,
            branch_id: pkg?.branch_id || null,
        });

        if (result.success) {
            toast.success(t("form.success"));
            setFormSubmitted(true);
            form.reset();
            setTimeout(() => setFormSubmitted(false), 3000);
        } else {
            toast.error(result.message || t("form.error"));
        }
    };

    if (packageLoading) {
        return (
            <div className="w-full max-w-4xl mx-auto py-20">
                <Skeleton className="h-10 w-20 mb-8" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-3/4" />
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (!pkg) {
        return (
            <div className="w-full max-w-4xl mx-auto py-20 text-center">
                <h2 className="text-2xl font-bold text-destructive mb-4">{t("notFound")}</h2>
                <Button asChild variant="outline">
                    <Link href="/packages">{t("backToPackages")}</Link>
                </Button>
            </div>
        );
    }

    const branchName = pkg.branch_id ? branches.find(b => Number(b.id) === pkg.branch_id)?.name : null;

    return (
        <div className="w-full max-w-6xl mx-auto">
            <Button variant="ghost" className="mb-8 -ml-4" asChild>
                <Link href="/packages">
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    {t("backToPackages")}
                </Link>
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Package Details */}
                <Card className="lg:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="text-3xl">{formatCurrency(Number(pkg.price))}</CardTitle>
                        {branchName && (
                            <Badge variant="secondary" className="w-fit mt-2">
                                {branchName}
                            </Badge>
                        )}
                        {!pkg.branch_id && (
                            <Badge variant="outline" className="w-fit mt-2 uppercase text-[10px] tracking-wider">
                                {t("globalPackage")}
                            </Badge>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="font-semibold mb-2">{t("description")}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {pkg.description || t("noDescription")}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Form */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>{t("contactTitle")}</CardTitle>
                        <CardDescription>{t("contactDescription")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {formSubmitted ? (
                            <div className="text-center py-8 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                                <div className="text-green-600 dark:text-green-400 text-lg font-semibold">
                                    ✓ {t("form.successMessage")}
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {t("form.successDescription")}
                                </p>
                            </div>
                        ) : (
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="customer_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("form.name")}</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            placeholder={t("form.namePlaceholder")}
                                                            {...field}
                                                            className="pl-10"
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="customer_email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("form.email")}</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            type="email"
                                                            placeholder={t("form.emailPlaceholder")}
                                                            {...field}
                                                            className="pl-10"
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="customer_phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("form.phone")}</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            placeholder={t("form.phonePlaceholder")}
                                                            {...field}
                                                            className="pl-10"
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="special_needs"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("form.specialNeeds")}</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder={t("form.specialNeedsPlaceholder")}
                                                        className="min-h-[120px] resize-none"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    {t("form.specialNeedsHint")}
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="w-full"
                                        disabled={submitLoading}
                                    >
                                        {submitLoading ? t("form.submitting") : t("form.submit")}
                                    </Button>
                                </form>
                            </Form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
