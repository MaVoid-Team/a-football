"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "@/i18n/navigation";
import { ChevronDown, ChevronUp, Lightbulb, Users, MessageSquare, Zap, CheckCircle2 } from "lucide-react";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  link: string;
  linkText: string;
}

interface ChecklistSection {
  id: string;
  icon: React.ReactNode;
  title: string;
  items: ChecklistItem[];
}

export function CrmOnboardingChecklist() {
  const t = useTranslations("crm.onboarding");
  const [expandedSections, setExpandedSections] = useState<string[]>(["what-is-crm"]);
  const [completedItems, setCompletedItems] = useState<string[]>([]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  const toggleItem = (itemId: string) => {
    setCompletedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const sections: ChecklistSection[] = [
    {
      id: "what-is-crm",
      icon: <Lightbulb className="h-5 w-5 text-amber-500" />,
      title: t("sections.whatIsCrm.title"),
      items: [
        {
          id: "understand-crm",
          title: t("sections.whatIsCrm.items.understand.title"),
          description: t("sections.whatIsCrm.items.understand.description"),
          link: "",
          linkText: "",
        },
      ],
    },
    {
      id: "players",
      icon: <Users className="h-5 w-5 text-blue-500" />,
      title: t("sections.players.title"),
      items: [
        {
          id: "browse-players",
          title: t("sections.players.items.browse.title"),
          description: t("sections.players.items.browse.description"),
          link: "/crm/players",
          linkText: t("sections.players.items.browse.linkText"),
        },
        {
          id: "filter-players",
          title: t("sections.players.items.filter.title"),
          description: t("sections.players.items.filter.description"),
          link: "/crm/players",
          linkText: t("sections.players.items.filter.linkText"),
        },
        {
          id: "tag-players",
          title: t("sections.players.items.tag.title"),
          description: t("sections.players.items.tag.description"),
          link: "/crm/players",
          linkText: t("sections.players.items.tag.linkText"),
        },
        {
          id: "send-whatsapp",
          title: t("sections.players.items.whatsapp.title"),
          description: t("sections.players.items.whatsapp.description"),
          link: "/crm/players",
          linkText: t("sections.players.items.whatsapp.linkText"),
        },
      ],
    },
    {
      id: "templates",
      icon: <MessageSquare className="h-5 w-5 text-green-500" />,
      title: t("sections.templates.title"),
      items: [
        {
          id: "create-template",
          title: t("sections.templates.items.create.title"),
          description: t("sections.templates.items.create.description"),
          link: "/crm/templates",
          linkText: t("sections.templates.items.create.linkText"),
        },
        {
          id: "use-variables",
          title: t("sections.templates.items.variables.title"),
          description: t("sections.templates.items.variables.description"),
          link: "/crm/templates",
          linkText: t("sections.templates.items.variables.linkText"),
        },
      ],
    },
    {
      id: "actions",
      icon: <CheckCircle2 className="h-5 w-5 text-purple-500" />,
      title: t("sections.actions.title"),
      items: [
        {
          id: "view-actions",
          title: t("sections.actions.items.view.title"),
          description: t("sections.actions.items.view.description"),
          link: "/crm/actions",
          linkText: t("sections.actions.items.view.linkText"),
        },
        {
          id: "complete-actions",
          title: t("sections.actions.items.complete.title"),
          description: t("sections.actions.items.complete.description"),
          link: "/crm/actions",
          linkText: t("sections.actions.items.complete.linkText"),
        },
      ],
    },
    {
      id: "automations",
      icon: <Zap className="h-5 w-5 text-orange-500" />,
      title: t("sections.automations.title"),
      items: [
        {
          id: "create-rules",
          title: t("sections.automations.items.rules.title"),
          description: t("sections.automations.items.rules.description"),
          link: "/crm/automations",
          linkText: t("sections.automations.items.rules.linkText"),
        },
        {
          id: "understand-segments",
          title: t("sections.automations.items.segments.title"),
          description: t("sections.automations.items.segments.description"),
          link: "/crm/automations",
          linkText: t("sections.automations.items.segments.linkText"),
        },
        {
          id: "scoring",
          title: t("sections.automations.items.scoring.title"),
          description: t("sections.automations.items.scoring.description"),
          link: "/crm/automations",
          linkText: t("sections.automations.items.scoring.linkText"),
        },
      ],
    },
  ];

  const totalItems = sections.reduce((acc, section) => acc + section.items.length, 0);
  const progress = Math.round((completedItems.length / totalItems) * 100);

  if (progress === 100) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-medium text-green-900">{t("completed.title")}</p>
              <p className="text-sm text-green-700">{t("completed.description")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("subtitle")}</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{progress}%</p>
            <p className="text-xs text-muted-foreground">
              {completedItems.length}/{totalItems} {t("completedCount")}
            </p>
          </div>
        </div>
        <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {sections.map((section) => {
          const isExpanded = expandedSections.includes(section.id);
          const sectionCompletedItems = section.items.filter((item) =>
            completedItems.includes(item.id)
          ).length;

          return (
            <div key={section.id} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {section.icon}
                  <span className="font-medium">{section.title}</span>
                  <span className="text-xs text-muted-foreground">
                    ({sectionCompletedItems}/{section.items.length})
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {isExpanded && (
                <div className="border-t">
                  {section.items.map((item) => {
                    const isCompleted = completedItems.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`p-3 border-b last:border-b-0 ${
                          isCompleted ? "bg-muted/30" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isCompleted}
                            onCheckedChange={() => toggleItem(item.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <p className={`font-medium ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                              {item.title}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                            {item.link && (
                              <Button asChild variant="link" size="sm" className="mt-2 h-auto p-0">
                                <Link href={item.link}>{item.linkText} →</Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
