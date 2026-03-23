"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useCrmAPI } from "@/hooks/api/use-crm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function CrmTemplatesPage() {
  const t = useTranslations("crm");
  const { templates, loading, fetchTemplates, createTemplate, updateTemplate } = useCrmAPI();

  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [togglingTemplateId, setTogglingTemplateId] = useState<number | null>(null);

  const isCreateDisabled = !name.trim() || !content.trim() || !whatsappNumber.trim() || loading || isCreating;

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const onCreate = async () => {
    setIsCreating(true);
    const result = await createTemplate({ name, content, whatsapp_number: whatsappNumber, active: true });
    if (!result.success) {
      toast.error(t("templates.createFailed"));
      setIsCreating(false);
      return;
    }

    setName("");
    setContent("");
    setWhatsappNumber("");
    await fetchTemplates();
    toast.success(t("templates.created"));
    setIsCreating(false);
  };

  const toggleActive = async (id: number, active: boolean) => {
    setTogglingTemplateId(id);
    const result = await updateTemplate(id, { active: !active });
    if (!result.success) {
      toast.error(t("templates.updateFailed"));
      setTogglingTemplateId(null);
      return;
    }

    await fetchTemplates();
    toast.success(active ? t("templates.deactivated") : t("templates.activated"));
    setTogglingTemplateId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("templates.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("templates.subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("templates.create")}</CardTitle>
        </CardHeader>
        <CardContent id="template-create-form" className="space-y-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("templates.namePlaceholder")} />
          <Input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder={t("templates.numberPlaceholder")} />
          <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder={t("templates.contentPlaceholder")} rows={5} />
          <Button disabled={isCreateDisabled} onClick={onCreate}>{isCreating ? t("templates.saving") : t("templates.save")}</Button>
          {isCreateDisabled && (
            <p className="text-xs text-muted-foreground">{t("templates.requiredHint")}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("templates.existing")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {templates.map((template) => (
              <div key={template.id} className="rounded-lg border border-border p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{template.name}</p>
                    <p className="text-xs text-muted-foreground">{template.whatsapp_number}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={togglingTemplateId === template.id}
                    onClick={() => toggleActive(template.id, template.active)}
                  >
                    {togglingTemplateId === template.id
                      ? t("templates.updating")
                      : template.active
                        ? t("templates.deactivate")
                        : t("templates.activate")}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{template.content}</p>
              </div>
            ))}
            {!templates.length && (
              <div className="rounded-lg border border-dashed p-4">
                <p className="text-sm text-muted-foreground">{t("templates.empty")}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("templates.emptyHint")}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => document.getElementById("template-create-form")?.scrollIntoView({ behavior: "smooth" })}
                >
                  {t("templates.createFirst")}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
