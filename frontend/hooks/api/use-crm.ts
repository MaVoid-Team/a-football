"use client";

import { useCallback, useState } from "react";
import api from "@/lib/axios";
import { buildQueryString } from "@/lib/build-query-string";
import {
  CrmActionItem,
  CrmAutomationRule,
  CrmDashboardData,
  CrmMessageTemplate,
  CrmPlayerProfile,
  CrmScoringSetting,
  CrmPlayerSummary,
  CrmSegment,
} from "@/schemas/crm.schema";
import { PaginationMeta } from "@/schemas/api.schema";

interface PlayerListParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  tags?: string;
  segment_id?: number;
}

export function useCrmAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dashboard, setDashboard] = useState<CrmDashboardData | null>(null);
  const [players, setPlayers] = useState<CrmPlayerSummary[]>([]);
  const [player, setPlayer] = useState<CrmPlayerProfile | null>(null);
  const [segments, setSegments] = useState<CrmSegment[]>([]);
  const [templates, setTemplates] = useState<CrmMessageTemplate[]>([]);
  const [automationRules, setAutomationRules] = useState<CrmAutomationRule[]>([]);
  const [actionItems, setActionItems] = useState<CrmActionItem[]>([]);
  const [scoringSetting, setScoringSetting] = useState<CrmScoringSetting | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const parsePagination = (headers: any): PaginationMeta => ({
    totalCount: Number(headers["x-total-count"] || 0),
    page: Number(headers["x-page"] || 1),
    perPage: Number(headers["x-per-page"] || 25),
    totalPages: Number(headers["x-total-pages"] || 1),
  });

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<{ total_players: number }>("/api/admin/crm/dashboard");
      setDashboard(response.data as unknown as CrmDashboardData);
      return { success: true };
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch CRM dashboard");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPlayers = useCallback(async (params?: PlayerListParams) => {
    setLoading(true);
    setError(null);
    try {
      const query = buildQueryString(params as Record<string, string | number | boolean | null | undefined>);
      const response = await api.get<{ data: CrmPlayerSummary[] }>(`/api/admin/crm/players${query}`);
      setPlayers(response.data.data || []);
      setPagination(parsePagination(response.headers));
      return { success: true, data: response.data.data || [] };
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch CRM players");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSegmentPlayers = useCallback(async (segmentId: number, params?: Omit<PlayerListParams, "segment_id">) => {
    setLoading(true);
    setError(null);
    try {
      const query = buildQueryString(params as Record<string, string | number | boolean | null | undefined>);
      const response = await api.get<{ data: CrmPlayerSummary[] }>(`/api/admin/crm/segments/${segmentId}/players${query}`);
      setPlayers(response.data.data || []);
      setPagination(parsePagination(response.headers));
      return { success: true, data: response.data.data || [] };
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch segment players");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPlayer = useCallback(async (id: string, activityType?: string, activityPage = 1, activityPerPage = 20) => {
    setLoading(true);
    setError(null);
    try {
      const query = buildQueryString({
        activity_type: activityType || undefined,
        activity_page: activityPage,
        activity_per_page: activityPerPage,
      });
      const response = await api.get<{ data: CrmPlayerProfile }>(`/api/admin/crm/players/${id}${query}`);
      setPlayer(response.data.data);
      return { success: true, data: response.data.data };
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch CRM player profile");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePlayerTag = useCallback(async (id: string, actionType: "add" | "remove", tag: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.patch(`/api/admin/crm/players/${id}/tags`, {
        action_type: actionType,
        tag,
      });
      return { success: true };
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] || "Failed to update player tag");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSegments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: CrmSegment[] }>("/api/admin/crm/segments");
      setSegments(response.data.data || []);
      return { success: true };
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch CRM segments");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const createSegment = useCallback(async (payload: Partial<CrmSegment>) => {
    setLoading(true);
    setError(null);
    try {
      await api.post("/api/admin/crm/segments", { segment: payload });
      return { success: true };
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] || "Failed to create segment");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSegment = useCallback(async (id: number, payload: Partial<CrmSegment>) => {
    setLoading(true);
    setError(null);
    try {
      await api.patch(`/api/admin/crm/segments/${id}`, { segment: payload });
      return { success: true };
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] || "Failed to update segment");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: CrmMessageTemplate[] }>("/api/admin/crm/message_templates");
      setTemplates(response.data.data || []);
      return { success: true };
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch message templates");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const createTemplate = useCallback(async (payload: Partial<CrmMessageTemplate>) => {
    setLoading(true);
    setError(null);
    try {
      await api.post("/api/admin/crm/message_templates", { message_template: payload });
      return { success: true };
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] || "Failed to create template");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTemplate = useCallback(async (id: number, payload: Partial<CrmMessageTemplate>) => {
    setLoading(true);
    setError(null);
    try {
      await api.patch(`/api/admin/crm/message_templates/${id}`, { message_template: payload });
      return { success: true };
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] || "Failed to update template");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const generateWhatsappLink = useCallback(async (templateId: number, playerKey: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post<{ data: { whatsapp_link: string } }>("/api/admin/crm/whatsapp_links", {
        template_id: templateId,
        player_key: playerKey,
      });
      return { success: true, data: response.data.data };
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] || "Failed to generate WhatsApp link");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAutomationRules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: CrmAutomationRule[] }>("/api/admin/crm/automation_rules");
      setAutomationRules(response.data.data || []);
      return { success: true, data: response.data.data || [] };
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] || "Failed to fetch automation rules");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const createAutomationRule = useCallback(async (payload: Partial<CrmAutomationRule>) => {
    setLoading(true);
    setError(null);
    try {
      await api.post("/api/admin/crm/automation_rules", { automation_rule: payload });
      return { success: true };
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] || "Failed to create automation rule");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAutomationRule = useCallback(async (id: number, payload: Partial<CrmAutomationRule>) => {
    setLoading(true);
    setError(null);
    try {
      await api.patch(`/api/admin/crm/automation_rules/${id}`, { automation_rule: payload });
      return { success: true };
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] || "Failed to update automation rule");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActionItems = useCallback(async (params?: { status?: string; player_type?: string; player_id?: number }) => {
    setLoading(true);
    setError(null);
    try {
      const query = buildQueryString(params as Record<string, string | number | boolean | null | undefined>);
      const response = await api.get<{ data: CrmActionItem[] }>(`/api/admin/crm/action_items${query}`);
      setActionItems(response.data.data || []);
      return { success: true, data: response.data.data || [] };
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] || "Failed to fetch action items");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateActionItemStatus = useCallback(async (id: number, status: "completed" | "ignored") => {
    setLoading(true);
    setError(null);
    try {
      await api.patch(`/api/admin/crm/action_items/${id}`, { status });
      return { success: true };
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] || "Failed to update action item");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const generateActionItemWhatsappLink = useCallback(async (id: number, templateId?: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post<{ data: { whatsapp_link: string } }>(`/api/admin/crm/action_items/${id}/whatsapp_link`, {
        template_id: templateId,
      });
      return { success: true, data: response.data.data };
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] || "Failed to generate action WhatsApp link");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const generateBulkWhatsappLinks = useCallback(async (segmentId: number, templateId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post<{ data: Array<{ player_key: string; whatsapp_link: string; message: string }> }>(
        "/api/admin/crm/action_items/bulk_whatsapp_links",
        {
          segment_id: segmentId,
          template_id: templateId,
        },
      );
      return { success: true, data: response.data.data || [] };
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] || "Failed to generate bulk WhatsApp links");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchScoringSetting = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: CrmScoringSetting }>("/api/admin/crm/scoring_settings");
      setScoringSetting(response.data.data);
      return { success: true, data: response.data.data };
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] || "Failed to fetch scoring settings");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateScoringSetting = useCallback(async (payload: Partial<CrmScoringSetting>) => {
    setLoading(true);
    setError(null);
    try {
      await api.patch("/api/admin/crm/scoring_settings", { scoring_setting: payload });
      return { success: true };
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] || "Failed to update scoring settings");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    dashboard,
    players,
    player,
    segments,
    templates,
    automationRules,
    actionItems,
    scoringSetting,
    pagination,
    fetchDashboard,
    fetchPlayers,
    fetchSegmentPlayers,
    fetchPlayer,
    updatePlayerTag,
    fetchSegments,
    createSegment,
    updateSegment,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    generateWhatsappLink,
    fetchAutomationRules,
    createAutomationRule,
    updateAutomationRule,
    fetchActionItems,
    updateActionItemStatus,
    generateActionItemWhatsappLink,
    generateBulkWhatsappLinks,
    fetchScoringSetting,
    updateScoringSetting,
  };
}
