"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCrmAPI } from "@/hooks/api/use-crm";
import { toast } from "sonner";

const triggerTypes = [
  "inactivity",
  "booking_created",
  "match_completed",
  "tournament_joined",
  "no_show_detected",
] as const;

type ConditionOperator = "all" | "any";

type RuleCondition = {
  field: string;
  op: string;
  value: string;
};

const defaultCondition = (): RuleCondition => ({
  field: "last_activity_days",
  op: "gte",
  value: "7",
});

const conditionFields = [
  "last_activity_days",
  "total_bookings",
  "total_matches",
  "total_tournaments",
  "no_show_count",
  "cancellation_count",
  "tags",
] as const;

const conditionOps = ["gte", "lte", "gt", "lt", "eq", "includes", "excludes"] as const;

const numericFields = [
  "last_activity_days",
  "total_bookings",
  "total_matches",
  "total_tournaments",
  "no_show_count",
  "cancellation_count",
] as const;

const isNumericField = (field: string) => numericFields.includes(field as (typeof numericFields)[number]);

const allowedOpsForField = (field: string): string[] => (isNumericField(field)
  ? ["gte", "lte", "gt", "lt", "eq"]
  : ["includes", "excludes"]);

const labelize = (value: string) => value.replaceAll("_", " ");

export default function CrmAutomationsPage() {
  const t = useTranslations("crm");
  const {
    templates,
    segments,
    automationRules,
    scoringSetting,
    loading,
    fetchTemplates,
    fetchSegments,
    fetchAutomationRules,
    createAutomationRule,
    updateAutomationRule,
    updateSegment,
    fetchScoringSetting,
    updateScoringSetting,
  } = useCrmAPI();

  const [name, setName] = useState("");
  const [triggerType, setTriggerType] = useState<(typeof triggerTypes)[number]>("inactivity");
  const [conditionOperator, setConditionOperator] = useState<ConditionOperator>("all");
  const [conditions, setConditions] = useState<RuleCondition[]>([defaultCondition()]);
  const [templateId, setTemplateId] = useState("all");
  const [isActive, setIsActive] = useState(true);
  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isUpdatingSegmentId, setIsUpdatingSegmentId] = useState<number | null>(null);

  const [activityWeight, setActivityWeight] = useState("30");
  const [frequencyWeight, setFrequencyWeight] = useState("25");
  const [engagementWeight, setEngagementWeight] = useState("25");
  const [reliabilityWeight, setReliabilityWeight] = useState("20");

  useEffect(() => {
    fetchTemplates();
    fetchSegments();
    fetchAutomationRules();
    fetchScoringSetting();
  }, [fetchTemplates, fetchSegments, fetchAutomationRules, fetchScoringSetting]);

  useEffect(() => {
    if (!scoringSetting) return;

    setActivityWeight(String(scoringSetting.activity_weight));
    setFrequencyWeight(String(scoringSetting.frequency_weight));
    setEngagementWeight(String(scoringSetting.engagement_weight));
    setReliabilityWeight(String(scoringSetting.reliability_weight));
  }, [scoringSetting]);

  const activeTemplates = useMemo(() => templates.filter((template) => template.active), [templates]);

  const triggerTypeKeyMap: Record<string, string> = {
    inactivity: "automations.triggerTypes.inactivity",
    booking_created: "automations.triggerTypes.booking_created",
    match_completed: "automations.triggerTypes.match_completed",
    tournament_joined: "automations.triggerTypes.tournament_joined",
    no_show_detected: "automations.triggerTypes.no_show_detected",
  };

  const conditionFieldKeyMap: Record<string, string> = {
    last_activity_days: "automations.conditionFields.last_activity_days",
    total_bookings: "automations.conditionFields.total_bookings",
    total_matches: "automations.conditionFields.total_matches",
    total_tournaments: "automations.conditionFields.total_tournaments",
    no_show_count: "automations.conditionFields.no_show_count",
    cancellation_count: "automations.conditionFields.cancellation_count",
    tags: "automations.conditionFields.tags",
  };

  const operatorKeyMap: Record<string, string> = {
    gte: "automations.operators.gte",
    lte: "automations.operators.lte",
    gt: "automations.operators.gt",
    lt: "automations.operators.lt",
    eq: "automations.operators.eq",
    includes: "automations.operators.includes",
    excludes: "automations.operators.excludes",
  };

  const triggerLabel = (value: string) => triggerTypeKeyMap[value] ? t(triggerTypeKeyMap[value] as never) : labelize(value);
  const fieldLabel = (value: string) => conditionFieldKeyMap[value] ? t(conditionFieldKeyMap[value] as never) : labelize(value);
  const opLabel = (value: string) => operatorKeyMap[value] ? t(operatorKeyMap[value] as never) : value.toUpperCase();

  const parseWeight = (value: string) => Number(value);

  const getWeightError = (value: string): string | null => {
    const parsed = parseWeight(value);
    if (!Number.isFinite(parsed)) return "automations.invalidWeightNumber";
    if (parsed < 0) return "automations.invalidWeightNegative";
    if (parsed > 100) return "automations.invalidWeightRange";
    return null;
  };

  const activityWeightError = getWeightError(activityWeight);
  const frequencyWeightError = getWeightError(frequencyWeight);
  const engagementWeightError = getWeightError(engagementWeight);
  const reliabilityWeightError = getWeightError(reliabilityWeight);

  const hasWeightErrors = Boolean(
    activityWeightError || frequencyWeightError || engagementWeightError || reliabilityWeightError,
  );

  const totalWeight =
    (Number.isFinite(parseWeight(activityWeight)) ? parseWeight(activityWeight) : 0) +
    (Number.isFinite(parseWeight(frequencyWeight)) ? parseWeight(frequencyWeight) : 0) +
    (Number.isFinite(parseWeight(engagementWeight)) ? parseWeight(engagementWeight) : 0) +
    (Number.isFinite(parseWeight(reliabilityWeight)) ? parseWeight(reliabilityWeight) : 0);

  const totalWeightError = hasWeightErrors
    ? "automations.fixWeightErrorsFirst"
    : totalWeight <= 0
      ? "automations.invalidWeightTotal"
      : null;

  const totalWeightWarning = !totalWeightError && totalWeight !== 100 ? "automations.weightTotalRecommendation" : null;
  const totalWeightState = totalWeightError ? "error" : totalWeightWarning ? "warning" : "good";
  const totalWeightBadgeClass = totalWeightState === "error"
    ? "border-red-300 bg-red-50 text-red-800"
    : totalWeightState === "warning"
      ? "border-amber-300 bg-amber-50 text-amber-800"
      : "border-emerald-300 bg-emerald-50 text-emerald-800";

  const getConditionError = (condition: RuleCondition): string | null => {
    if (!condition.field || !condition.op) {
      return "automations.invalidConditionValue";
    }

    if (isNumericField(condition.field)) {
      const allowedOps = allowedOpsForField(condition.field);
      if (!allowedOps.includes(condition.op)) {
        return "automations.invalidConditionValue";
      }

      const numericValue = Number(condition.value);
      if (!Number.isFinite(numericValue)) {
        return "automations.invalidNumericValue";
      }
    } else {
      const allowedOps = allowedOpsForField(condition.field);
      if (!allowedOps.includes(condition.op)) {
        return "automations.invalidConditionValue";
      }

      if (!String(condition.value).trim()) {
        return "automations.invalidTagValue";
      }
    }

    return null;
  };

  const conditionErrors = useMemo(() => conditions.map((condition) => getConditionError(condition)), [conditions]);
  const hasConditionErrors = useMemo(() => conditionErrors.some(Boolean), [conditionErrors]);

  const parseExpression = (input: unknown) => {
    const text = String(input || "").trim();
    if (text.startsWith(">=")) return { op: "gte", value: text.slice(2).trim() };
    if (text.startsWith("<=")) return { op: "lte", value: text.slice(2).trim() };
    if (text.startsWith(">")) return { op: "gt", value: text.slice(1).trim() };
    if (text.startsWith("<")) return { op: "lt", value: text.slice(1).trim() };
    if (text.startsWith("==")) return { op: "eq", value: text.slice(2).trim() };
    if (text.startsWith("=")) return { op: "eq", value: text.slice(1).trim() };
    return { op: "eq", value: text };
  };

  const parseRuleConditions = (raw: Record<string, unknown> | undefined) => {
    if (!raw) {
      return { operator: "all" as ConditionOperator, rules: [defaultCondition()] };
    }

    const arrayRules = Array.isArray(raw.rules) ? raw.rules : [];
    if (arrayRules.length) {
      const normalized = arrayRules.map((rule) => {
        const item = (rule || {}) as Record<string, unknown>;
        return {
          field: String(item.field || "last_activity_days"),
          op: String(item.op || "gte"),
          value: String(item.value ?? "7"),
        };
      });

      return {
        operator: raw.operator === "any" ? ("any" as ConditionOperator) : ("all" as ConditionOperator),
        rules: normalized.length ? normalized : [defaultCondition()],
      };
    }

    const compactRules = Object.entries(raw).map(([field, expression]) => {
      const parsed = parseExpression(expression);
      return {
        field,
        op: field === "tags" ? "includes" : parsed.op,
        value: field === "tags" ? String(expression || "") : parsed.value,
      };
    });

    return {
      operator: "all" as ConditionOperator,
      rules: compactRules.length ? compactRules : [defaultCondition()],
    };
  };

  const formatRuleSummary = (raw: Record<string, unknown>) => {
    const parsed = parseRuleConditions(raw);
    const joiner = parsed.operator === "any" ? t("automations.matchAnyShort") : t("automations.matchAllShort");
    return parsed.rules.map((rule) => `${fieldLabel(rule.field)} ${opLabel(rule.op)} ${rule.value}`).join(` ${joiner} `);
  };

  const addCondition = () => {
    setConditions((prev) => [...prev, defaultCondition()]);
  };

  const updateCondition = (index: number, patch: Partial<RuleCondition>) => {
    setConditions((prev) => prev.map((item, idx) => {
      if (idx !== index) return item;

      const next = { ...item, ...patch };
      const allowedOps = allowedOpsForField(next.field);
      if (!allowedOps.includes(next.op)) {
        next.op = allowedOps[0];
      }

      return next;
    }));
  };

  const removeCondition = (index: number) => {
    setConditions((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      return next.length ? next : [defaultCondition()];
    });
  };

  const buildConditionsPayload = () => ({
    operator: conditionOperator,
    rules: conditions.map((condition) => {
      const shouldBeNumeric = isNumericField(condition.field) && condition.op !== "includes" && condition.op !== "excludes";

      return {
        field: condition.field,
        op: condition.op,
        value: shouldBeNumeric ? Number(condition.value) || 0 : condition.value,
      };
    }),
  });

  const validateConditions = () => {
    return conditionErrors.find((errorKey) => Boolean(errorKey)) || null;
  };

  const createRule = async () => {
    if (!name.trim()) {
      toast.error(t("automations.nameRequired"));
      return;
    }

    const validationError = validateConditions();
    if (validationError) {
      toast.error(t(validationError));
      return;
    }

    const payload = {
      name: name.trim(),
      trigger_type: triggerType,
      action_type: "suggest_whatsapp",
      template_id: templateId === "all" ? undefined : Number(templateId),
      is_active: isActive,
      conditions: buildConditionsPayload(),
    };

    const result = await createAutomationRule(payload);
    if (!result.success) {
      toast.error(t("automations.createFailed"));
      return;
    }

    await fetchAutomationRules();
    setName("");
    setConditions([defaultCondition()]);
    setConditionOperator("all");
    toast.success(t("automations.created"));
  };

  const startEdit = (ruleId: number) => {
    const rule = automationRules.find((item) => item.id === ruleId);
    if (!rule) return;

    const parsed = parseRuleConditions((rule.conditions || {}) as Record<string, unknown>);
    setEditingRuleId(rule.id);
    setName(rule.name);
    setTriggerType(rule.trigger_type as (typeof triggerTypes)[number]);
    setTemplateId(rule.template_id ? String(rule.template_id) : "all");
    setIsActive(rule.is_active);
    setConditionOperator(parsed.operator);
    setConditions(parsed.rules);
  };

  const cancelEdit = () => {
    setEditingRuleId(null);
    setName("");
    setTriggerType("inactivity");
    setTemplateId("all");
    setIsActive(true);
    setConditionOperator("all");
    setConditions([defaultCondition()]);
  };

  const saveEdit = async () => {
    if (!editingRuleId) return;
    if (!name.trim()) {
      toast.error(t("automations.nameRequired"));
      return;
    }

    const validationError = validateConditions();
    if (validationError) {
      toast.error(t(validationError));
      return;
    }

    setIsSavingEdit(true);
    const result = await updateAutomationRule(editingRuleId, {
      name: name.trim(),
      trigger_type: triggerType,
      action_type: "suggest_whatsapp",
      template_id: templateId === "all" ? undefined : Number(templateId),
      is_active: isActive,
      conditions: buildConditionsPayload(),
    });

    if (!result.success) {
      toast.error(t("automations.updateFailed"));
      setIsSavingEdit(false);
      return;
    }

    await fetchAutomationRules();
    cancelEdit();
    setIsSavingEdit(false);
    toast.success(t("automations.updated"));
  };

  const toggleSegment = async (segmentId: number, payload: { active?: boolean; auto_update?: boolean }) => {
    setIsUpdatingSegmentId(segmentId);
    const result = await updateSegment(segmentId, payload);
    if (!result.success) {
      toast.error(t("automations.segmentUpdateFailed"));
      setIsUpdatingSegmentId(null);
      return;
    }

    await fetchSegments();
    setIsUpdatingSegmentId(null);
    toast.success(t("automations.segmentUpdated"));
  };

  const toggleRule = async (id: number, active: boolean) => {
    const result = await updateAutomationRule(id, { is_active: !active });
    if (!result.success) {
      toast.error(t("automations.updateFailed"));
      return;
    }

    await fetchAutomationRules();
    toast.success(!active ? t("automations.activated") : t("automations.deactivated"));
  };

  const saveScoring = async () => {
    const result = await updateScoringSetting({
      activity_weight: Number(activityWeight),
      frequency_weight: Number(frequencyWeight),
      engagement_weight: Number(engagementWeight),
      reliability_weight: Number(reliabilityWeight),
    });

    if (!result.success) {
      toast.error(t("automations.scoringSaveFailed"));
      return;
    }

    await fetchScoringSetting();
    toast.success(t("automations.scoringSaved"));
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("automations.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("automations.subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("automations.createRule")}</CardTitle>
          <CardDescription>{t("automations.createRuleHint")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2 sm:col-span-2 lg:col-span-3">
            <Label>{t("automations.ruleName")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("automations.ruleNamePlaceholder")} />
          </div>

          <div className="space-y-2">
            <Label>{t("automations.trigger")}</Label>
            <Select value={triggerType} onValueChange={(value) => setTriggerType(value as (typeof triggerTypes)[number])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {triggerTypes.map((value) => (
                  <SelectItem key={value} value={value}>{triggerLabel(value)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 sm:col-span-2 lg:col-span-3">
            <div className="flex items-center justify-between">
              <Label>{t("automations.conditions")}</Label>
              <Select value={conditionOperator} onValueChange={(value) => setConditionOperator(value as ConditionOperator)}>
                <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("automations.matchAll")}</SelectItem>
                  <SelectItem value="any">{t("automations.matchAny")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              {conditions.map((condition, index) => (
                <div key={`condition-${index}`} className="grid gap-2 sm:grid-cols-4">
                  <Select value={condition.field} onValueChange={(value) => updateCondition(index, { field: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {conditionFields.map((value) => (
                        <SelectItem key={value} value={value}>{fieldLabel(value)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={condition.op} onValueChange={(value) => updateCondition(index, { op: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {conditionOps
                        .filter((value) => allowedOpsForField(condition.field).includes(value))
                        .map((value) => (
                        <SelectItem key={value} value={value}>{opLabel(value)}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  <Input
                    value={condition.value}
                    onChange={(e) => updateCondition(index, { value: e.target.value })}
                    className={conditionErrors[index] ? "border-destructive" : undefined}
                  />

                  <Button variant="outline" onClick={() => removeCondition(index)}>
                    {t("automations.removeCondition")}
                  </Button>

                  <div className="sm:col-span-4 flex justify-start">
                    <Badge variant="outline">
                      {isNumericField(condition.field) ? t("automations.numericFieldLabel") : t("automations.tagFieldLabel")}
                    </Badge>
                  </div>

                  {conditionErrors[index] && (
                    <p className="sm:col-span-4 text-sm text-destructive">
                      {t(conditionErrors[index] as string)}
                    </p>
                  )}
                </div>
              ))}
              <Button variant="outline" onClick={addCondition}>{t("automations.addCondition")}</Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("automations.template")}</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("automations.noTemplate")}</SelectItem>
                {activeTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id.toString()}>{template.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button variant={isActive ? "default" : "outline"} onClick={() => setIsActive((prev) => !prev)}>
              {isActive ? t("automations.active") : t("automations.inactive")}
            </Button>
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            {editingRuleId ? (
              <div className="flex gap-2">
                <Button disabled={loading || isSavingEdit || hasConditionErrors} onClick={saveEdit}>{t("automations.saveEdit")}</Button>
                <Button variant="outline" onClick={cancelEdit}>{t("automations.cancelEdit")}</Button>
              </div>
            ) : (
              <Button disabled={loading || hasConditionErrors} onClick={createRule}>{t("automations.create")}</Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("automations.existingRules")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {automationRules.map((rule) => (
            <div key={rule.id} className="rounded-lg border border-border p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{rule.name}</p>
                  <p className="text-xs text-muted-foreground">{triggerLabel(rule.trigger_type)} • {t("automations.actionSuggestWhatsapp")}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatRuleSummary(rule.conditions)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={rule.is_active ? "secondary" : "outline"}>{rule.is_active ? t("automations.active") : t("automations.inactive")}</Badge>
                  <Button size="sm" variant="outline" onClick={() => startEdit(rule.id)}>
                    {t("automations.edit")}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toggleRule(rule.id, rule.is_active)}>
                    {rule.is_active ? t("automations.deactivate") : t("automations.activate")}
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {!automationRules.length && <p className="text-sm text-muted-foreground">{t("automations.empty")}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("automations.segmentManagementTitle")}</CardTitle>
          <CardDescription>{t("automations.segmentManagementHint")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {segments.map((segment) => (
            <div key={segment.id} className="rounded-lg border border-border p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{segment.name}</p>
                  <Badge variant={segment.active ? "secondary" : "outline"}>{segment.active ? t("automations.active") : t("automations.inactive")}</Badge>
                  <Badge variant={segment.auto_update ? "secondary" : "outline"}>
                    {segment.auto_update ? t("automations.autoUpdateOn") : t("automations.autoUpdateOff")}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isUpdatingSegmentId === segment.id}
                    onClick={() => toggleSegment(segment.id, { active: !segment.active })}
                  >
                    {segment.active ? t("automations.deactivate") : t("automations.activate")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isUpdatingSegmentId === segment.id}
                    onClick={() => toggleSegment(segment.id, { auto_update: !segment.auto_update })}
                  >
                    {segment.auto_update ? t("automations.disableAutoUpdate") : t("automations.enableAutoUpdate")}
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {!segments.length && <p className="text-sm text-muted-foreground">{t("automations.noSegments")}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("automations.scoringTitle")}</CardTitle>
          <CardDescription>{t("automations.scoringHint")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>{t("automations.activityWeight")}</Label>
            <Input
              value={activityWeight}
              onChange={(e) => setActivityWeight(e.target.value)}
              className={activityWeightError ? "border-destructive" : undefined}
            />
            {activityWeightError && <p className="text-sm text-destructive">{t(activityWeightError)}</p>}
          </div>
          <div className="space-y-2">
            <Label>{t("automations.frequencyWeight")}</Label>
            <Input
              value={frequencyWeight}
              onChange={(e) => setFrequencyWeight(e.target.value)}
              className={frequencyWeightError ? "border-destructive" : undefined}
            />
            {frequencyWeightError && <p className="text-sm text-destructive">{t(frequencyWeightError)}</p>}
          </div>
          <div className="space-y-2">
            <Label>{t("automations.engagementWeight")}</Label>
            <Input
              value={engagementWeight}
              onChange={(e) => setEngagementWeight(e.target.value)}
              className={engagementWeightError ? "border-destructive" : undefined}
            />
            {engagementWeightError && <p className="text-sm text-destructive">{t(engagementWeightError)}</p>}
          </div>
          <div className="space-y-2">
            <Label>{t("automations.reliabilityWeight")}</Label>
            <Input
              value={reliabilityWeight}
              onChange={(e) => setReliabilityWeight(e.target.value)}
              className={reliabilityWeightError ? "border-destructive" : undefined}
            />
            {reliabilityWeightError && <p className="text-sm text-destructive">{t(reliabilityWeightError)}</p>}
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={totalWeightBadgeClass}>
                {t("automations.weightTotalLabel", { total: totalWeight })}
              </Badge>
              {totalWeightError && <p className="text-sm text-destructive">{t(totalWeightError)}</p>}
              {totalWeightWarning && <p className="text-sm text-muted-foreground">{t(totalWeightWarning)}</p>}
            </div>
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="cursor-help border-emerald-300 bg-emerald-50 text-emerald-800">{t("automations.legendGood")}</Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("automations.legendGoodHint")}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="cursor-help border-amber-300 bg-amber-50 text-amber-800">{t("automations.legendWarning")}</Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("automations.legendWarningHint")}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="cursor-help border-red-300 bg-red-50 text-red-800">{t("automations.legendError")}</Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("automations.legendErrorHint")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Button disabled={Boolean(totalWeightError)} onClick={saveScoring}>{t("automations.saveScoring")}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
