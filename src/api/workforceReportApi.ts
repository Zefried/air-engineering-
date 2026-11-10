import api from './axios';

export interface WorkforceKPIs {
  total_roster: number;
  present_count: number;
  absent_count: number;
  today_labor_cost: number;
  absent_deductions: number;
}

export interface WorkforceEmployeeItem {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  joining_date: string;
  status: 'present' | 'absent';
  absence_record: {
    id: number;
    reason: string | null;
    marked_by: {
      id: number;
      name: string;
      role: string;
    } | null;
  } | null;
  salary: {
    configured: boolean;
    daily_salary: number;
    monthly_salary: number;
  };
  assigned_tools_count: number;
}

export interface WorkforceSummaryResponse {
  status: boolean;
  date: string;
  kpis: WorkforceKPIs;
  workers: WorkforceEmployeeItem[];
}

export const workforceReportApi = {
  getSummary: async (date?: string): Promise<WorkforceSummaryResponse> => {
    const res = await api.get('/reports/workforce-summary', {
      params: date ? { date } : undefined,
    });
    return res.data;
  },

  markAbsent: async (
    userId: number | string,
    data: { start_date: string; end_date: string; reason?: string }
  ): Promise<{ status: boolean; message: string }> => {
    const res = await api.post(`/attendance/${userId}/absent`, data);
    return res.data;
  },

  removeAbsent: async (
    userId: number | string,
    data: { attendance_date: string; reason?: string }
  ): Promise<{ status: boolean; message: string }> => {
    const res = await api.delete(`/attendance/${userId}/absent`, { data });
    return res.data;
  },
};
