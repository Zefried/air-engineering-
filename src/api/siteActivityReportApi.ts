import api from './axios';

export interface ActivityTaskItem {
  id: number;
  task_description: string;
  status: 'pending' | 'completed' | 'not_completed' | 'no_response';
  worker_note: string | null;
  updated_at: string | null;
}

export interface SiteActivityItem {
  id: number;
  activity_code: string;
  activity_date: string;
  status: 'open' | 'closed';
  task_type: string;
  project: {
    id: number;
    name: string;
    client: string;
    project_code: string;
    site_location: string;
  } | null;
  site: {
    id: number;
    site_name: string;
    site_code: string;
    address: string;
  } | null;
  assigned_to: {
    id: number;
    name: string;
    role: string;
    phone: string;
    email: string;
  } | null;
  metrics: {
    total_tasks: number;
    completed: number;
    blockers: number;
    pending: number;
    no_response: number;
    progress_percent: number;
    has_blockers: boolean;
  };
  tasks: ActivityTaskItem[];
}

export interface ActivityKPIs {
  total_activities: number;
  total_tasks: number;
  completed_tasks: number;
  blocker_tasks: number;
  pending_tasks: number;
  no_response_tasks: number;
  active_sites_count: number;
}

export interface ActivitySummaryResponse {
  status: boolean;
  date: string;
  kpis: ActivityKPIs;
  activities: SiteActivityItem[];
}

export const siteActivityReportApi = {
  getSummary: async (params?: { date?: string; project_id?: string | number }): Promise<ActivitySummaryResponse> => {
    const res = await api.get('/reports/activities-summary', { params });
    return res.data;
  },

  closeActivity: async (id: number | string): Promise<{ status: boolean; message: string }> => {
    const res = await api.post(`/activities/${id}/close`);
    return res.data;
  },
};
