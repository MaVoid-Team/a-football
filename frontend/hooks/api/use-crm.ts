"use client";

import { useCallback, useState } from "react";
import api from "@/lib/axios";
import { buildQueryString } from "@/lib/build-query-string";
import {
  CrmDashboardData,
  CrmMessageTemplate,
  CrmPlayerProfile,
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

  const fetchPlayer = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: CrmPlayerProfile }>(`/api/admin/crm/players/${id}`);
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

  return {
    loading,
    error,
    dashboard,
    players,
    player,
    segments,
    templates,
    pagination,
    fetchDashboard,
    fetchPlayers,
    fetchPlayer,
    updatePlayerTag,
    fetchSegments,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    generateWhatsappLink,
  };
}
