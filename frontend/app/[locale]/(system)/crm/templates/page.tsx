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

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const onCreate = async () => {
    const result = await createTemplate({ name, content, whatsapp_number: whatsappNumber, active: true });
    if (!result.success) {
      toast.error(t("templates.createFailed"));
      return;
    }

    setName("");
    setContent("");
    setWhatsappNumber("");
    await fetchTemplates();
    toast.success(t("templates.created"));
  };

  const toggleActive = async (id: number, active: boolean) => {
    const result = await updateTemplate(id, { active: !active });
    if (!result.success) {
      toast.error(t("templates.updateFailed"));
      return;
    }

    await fetchTemplates();
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
        <CardContent className="space-y-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("templates.namePlaceholder")} />
          <Input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder={t("templates.numberPlaceholder")} />
          <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder={t("templates.contentPlaceholder")} rows={5} />
          <Button disabled={loading || !name || !content || !whatsappNumber} onClick={onCreate}>{t("templates.save")}</Button>
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
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{template.name}</p>
                    <p className="text-xs text-muted-foreground">{template.whatsapp_number}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => toggleActive(template.id, template.active)}>
                    {template.active ? t("templates.deactivate") : t("templates.activate")}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{template.content}</p>
              </div>
            ))}
            {!templates.length && <p className="text-sm text-muted-foreground">{t("templates.empty")}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
