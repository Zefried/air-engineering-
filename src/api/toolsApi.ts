import api from "./axios";
import type { ToolItem, ToolCondition } from "../Pages/Tools/toolTypes";

export interface ToolFilters {
  status?: string;
  category?: string;
  search?: string;
}

export interface ToolsResponse {
  tools: ToolItem[];
  kpis: {
    total_tools: number;
    in_field: number;
    available: number;
    needs_repair: number;
  };
}

export interface CreateToolPayload {
  tool_code: string;
  name: string;
  category: string;
  brand?: string;
  model_no?: string;
  serial_no?: string;
  image_url?: string;
  purchase_date?: string;
  purchase_cost?: number;
  current_condition?: ToolCondition;
  storage_location?: string;
}

export interface AssignToolPayload {
  worker_id: number | string;
  project_name: string;
  project_short_name?: string;
  condition?: ToolCondition;
  expected_return_date?: string;
  notes?: string;
  handled_by?: string;
}

export interface ReturnToolPayload {
  condition: ToolCondition;
  storage_location?: string;
  note_text?: string;
  note_image?: string;
  handled_by?: string;
}

export const toolsApi = {
  getAll: async (params?: ToolFilters): Promise<ToolsResponse> => {
    const response = await api.get<ToolsResponse>("/tools", { params });
    return response.data;
  },

  getById: async (id: string | number): Promise<{ tool: ToolItem }> => {
    const response = await api.get<{ tool: ToolItem }>(`/tools/${id}`);
    return response.data;
  },

  create: async (payload: CreateToolPayload): Promise<{ message: string; tool: ToolItem }> => {
    const response = await api.post<{ message: string; tool: ToolItem }>("/tools", payload);
    return response.data;
  },

  update: async (id: string | number, payload: Partial<CreateToolPayload>): Promise<{ message: string; tool: ToolItem }> => {
    const response = await api.put<{ message: string; tool: ToolItem }>(`/tools/${id}`, payload);
    return response.data;
  },

  assign: async (id: string | number, payload: AssignToolPayload): Promise<{ message: string; tool: ToolItem }> => {
    const response = await api.post<{ message: string; tool: ToolItem }>(`/tools/${id}/assign`, payload);
    return response.data;
  },

  returnTool: async (id: string | number, payload: ReturnToolPayload): Promise<{ message: string; tool: ToolItem }> => {
    const response = await api.post<{ message: string; tool: ToolItem }>(`/tools/${id}/return`, payload);
    return response.data;
  },

  addNote: async (id: string | number, payload: { author?: string; text: string }): Promise<{ message: string; note: any }> => {
    const response = await api.post<{ message: string; note: any }>(`/tools/${id}/notes`, payload);
    return response.data;
  },

  delete: async (id: string | number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/tools/${id}`);
    return response.data;
  },
};
