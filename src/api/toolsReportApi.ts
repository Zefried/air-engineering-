import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8005";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ToolReportKPIs {
  overdue_count: number;
  in_field_count: number;
  in_field_total_value: number;
  in_store_count: number;
  damaged_count: number;
  total_fleet_count: number;
  total_fleet_value: number;
}

export interface OverdueToolItem {
  id: number;
  tool_code: string;
  name: string;
  category: string;
  brand: string;
  assigned_worker_id: number;
  worker_name: string;
  worker_phone: string;
  project_name: string;
  assigned_date: string | null;
  expected_return_date: string | null;
  days_overdue: number;
  purchase_cost: number;
  current_condition: string;
}

export interface WorkerHoldingTool {
  id: number;
  tool_code: string;
  name: string;
  category: string;
  brand?: string;
  assigned_date: string | null;
  expected_return_date: string | null;
  project_name: string;
  purchase_cost: number;
  condition: string;
  is_overdue: boolean;
  days_overdue?: number;
}

export interface WorkerHoldingItem {
  worker_id: number;
  worker_name: string;
  worker_phone: string;
  active_tools_count: number;
  total_holding_value: number;
  has_overdue: boolean;
  tools: WorkerHoldingTool[];
}

export interface TechnicianOptionItem {
  id: number;
  name: string;
  phone: string;
  role?: string;
  active_tools_count: number;
  has_overdue: boolean;
}

export interface DamagedHistoryItem {
  journey_id: number;
  tool_id: number;
  tool_code: string;
  name: string;
  event_type?: string;
  title?: string;
  condition_before: string;
  condition_after: string;
  worker_name?: string;
  project_name?: string;
  event_timestamp: string | null;
  formatted_date: string;
  note_text: string;
}

export interface WorkerProfile {
  id: number;
  name: string;
  phone: string;
  email: string;
  role: string;
}

export interface WorkerKPIs {
  active_tools_count: number;
  overdue_count: number;
  total_holding_value: number;
  active_sites: string[];
}

export interface ToolsReportSummaryResponse {
  is_worker_specific: boolean;
  // Present in Overall Fleet mode
  kpis?: ToolReportKPIs;
  overdue_tools?: OverdueToolItem[];
  worker_holdings?: WorkerHoldingItem[];
  technicians_list?: TechnicianOptionItem[];
  damaged_history?: DamagedHistoryItem[];
  whatsapp_summary_text?: string;
  // Present in Dynamic Worker mode
  worker_profile?: WorkerProfile;
  worker_kpis?: WorkerKPIs;
  active_tools?: WorkerHoldingTool[];
  journey_history?: DamagedHistoryItem[];
}

export const toolsReportApi = {
  getSummary: async (workerId?: number | string): Promise<ToolsReportSummaryResponse> => {
    const params: Record<string, any> = {};
    if (workerId && workerId !== "all") {
      params.worker_id = workerId;
    }
    const response = await api.get<ToolsReportSummaryResponse>("/reports/tools-summary", { params });
    return response.data;
  },
};

export default toolsReportApi;
