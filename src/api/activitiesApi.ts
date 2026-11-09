import api from './axios';

export interface ProjectSiteItem {
  id: number;
  project_id: number;
  site_name: string;
  site_code?: string;
  address?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type TaskStatus = 'pending' | 'completed' | 'not_completed' | 'no_response';
export type TaskType = 'service' | 'project' | 'both';
export type ActivityStatus = 'open' | 'closed';

export interface DailyActivityTaskItem {
  id: number;
  daily_activity_id: number;
  task_description: string;
  status: TaskStatus;
  worker_note?: string | null;
  updated_by_user_id?: number | null;
  updated_by?: {
    id: number;
    name: string;
    role: string;
  } | null;
  updated_at_timestamp?: string | null;
  reminder_sent_at?: string | null;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface DailyActivityItem {
  id: number;
  activity_code: string;
  assigned_to_user_id: number;
  created_by_user_id: number;
  project_id: number;
  project_site_id: number;
  activity_date: string;
  task_type: TaskType;
  status: ActivityStatus;
  closed_at?: string | null;
  closed_by?: string | null;
  reminder_sent_at?: string | null;
  created_at?: string;
  updated_at?: string;
  assigned_to?: {
    id: number;
    name: string;
    email: string;
    role: string;
    phone?: string;
  };
  created_by?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  project?: {
    id: number;
    project_code: string;
    name: string;
    client: string;
    site_location?: string;
  };
  site?: ProjectSiteItem;
  tasks?: DailyActivityTaskItem[];
}

export interface DailyActivityEventItem {
  id: number;
  event_type: string;
  title: string;
  description?: string | null;
  status_before?: string | null;
  status_after?: string | null;
  worker_note?: string | null;
  actor_name: string;
  actor_role: string;
  event_timestamp: string;
}

export interface ActivityTimelineResponse {
  status: boolean;
  data: {
    activity: {
      id: number;
      activity_code: string;
      activity_date: string;
      status: ActivityStatus;
      task_type: TaskType;
      technician?: { id: number; name: string; role: string };
      project?: { id: number; name: string; project_code: string };
      site?: { id: number; site_name: string };
      closed_at?: string | null;
      closed_by?: string | null;
      summary: {
        total_tasks: number;
        completed: number;
        not_completed: number;
        no_response: number;
        pending: number;
      };
    };
    tasks: DailyActivityTaskItem[];
    timeline_events: DailyActivityEventItem[];
  };
}

export interface CreateActivityPayload {
  assigned_to_user_id: number | string;
  project_id: number | string;
  project_site_id: number | string;
  activity_date: string;
  task_type: TaskType;
  tasks: { task_description: string }[];
}

export interface NotificationItem {
  id: string;
  type: string;
  data: {
    title?: string;
    message: string;
    activity_id?: number;
    task_id?: number;
    activity_code?: string;
    technician_name?: string;
    created_at?: string;
  };
  read_at?: string | null;
  created_at: string;
}

export const activitiesApi = {
  // Sites under project
  getSites: async (projectId: number | string): Promise<{ status: boolean; sites: ProjectSiteItem[] }> => {
    const res = await api.get(`/projects/${projectId}/sites`);
    return res.data;
  },

  createSite: async (projectId: number | string, payload: { site_name: string; site_code?: string; address?: string }): Promise<{ status: boolean; site: ProjectSiteItem }> => {
    const res = await api.post(`/projects/${projectId}/sites`, payload);
    return res.data;
  },

  // Activities
  getActivities: async (params?: { date?: string; technician_id?: number | string; project_id?: number | string; status?: string; task_type?: string }): Promise<{ status: boolean; count: number; data: DailyActivityItem[] }> => {
    const res = await api.get('/activities', { params });
    return res.data;
  },

  getActivity: async (id: number | string): Promise<{ status: boolean; data: DailyActivityItem }> => {
    const res = await api.get(`/activities/${id}`);
    return res.data;
  },

  createActivity: async (payload: CreateActivityPayload): Promise<{ status: boolean; message: string; data: DailyActivityItem }> => {
    const res = await api.post('/activities', payload);
    return res.data;
  },

  updateTaskStatus: async (activityId: number | string, taskId: number | string, payload: { status: 'completed' | 'not_completed'; worker_note?: string }): Promise<{ status: boolean; message: string; task: DailyActivityTaskItem }> => {
    const res = await api.put(`/activities/${activityId}/tasks/${taskId}`, payload);
    return res.data;
  },

  getTimeline: async (id: number | string): Promise<ActivityTimelineResponse> => {
    const res = await api.get(`/activities/${id}/timeline`);
    return res.data;
  },

  closeActivity: async (id: number | string): Promise<{ status: boolean; message: string; data: DailyActivityItem }> => {
    const res = await api.post(`/activities/${id}/close`);
    return res.data;
  },

  // Notifications
  getNotifications: async (): Promise<{ status: boolean; unread_count: number; data: NotificationItem[] }> => {
    const res = await api.get('/notifications');
    return res.data;
  },

  markNotificationRead: async (id: string): Promise<{ status: boolean }> => {
    const res = await api.post(`/notifications/${id}/read`);
    return res.data;
  },

  markAllNotificationsRead: async (): Promise<{ status: boolean }> => {
    const res = await api.post('/notifications/read-all');
    return res.data;
  },
};
