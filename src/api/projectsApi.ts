import api from './axios';

export interface ProjectWorker {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  pivot?: {
    assigned_at?: string;
  };
}

export interface ProjectItem {
  id: number;
  project_code: string;
  name: string;
  client: string;
  site_location: string;
  manager_id?: number | null;
  manager?: {
    id: number;
    name: string;
    email: string;
    role: string;
  } | null;
  status: 'in_progress' | 'planning' | 'on_hold' | 'completed';
  start_date?: string | null;
  due_date?: string | null;
  description?: string | null;
  workers?: ProjectWorker[];
  inventory_transactions_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectKpis {
  total_projects: number;
  active_sites: number;
  deployed_workers: number;
  completed_projects: number;
}

export interface ProjectListResponse {
  status: boolean;
  kpis: ProjectKpis;
  data: ProjectItem[];
}

export interface ProjectPayload {
  name: string;
  project_code?: string;
  client: string;
  site_location: string;
  manager_id?: number | null;
  status?: string;
  start_date?: string | null;
  due_date?: string | null;
  description?: string | null;
  worker_ids?: number[];
}

export const projectsApi = {
  getProjects: async (params?: { search?: string; status?: string }): Promise<ProjectListResponse> => {
    const res = await api.get('/projects', { params });
    return res.data;
  },

  getAll: async (params?: { search?: string; status?: string }): Promise<ProjectListResponse> => {
    const res = await api.get('/projects', { params });
    return res.data;
  },

  getProject: async (id: number | string): Promise<{ status: boolean; data: ProjectItem }> => {
    const res = await api.get(`/projects/${id}`);
    return res.data;
  },

  createProject: async (payload: ProjectPayload): Promise<{ status: boolean; message: string; data: ProjectItem }> => {
    const res = await api.post('/projects', payload);
    return res.data;
  },

  updateProject: async (id: number | string, payload: ProjectPayload): Promise<{ status: boolean; message: string; data: ProjectItem }> => {
    const res = await api.put(`/projects/${id}`, payload);
    return res.data;
  },

  deleteProject: async (id: number | string): Promise<{ status: boolean; message: string }> => {
    const res = await api.delete(`/projects/${id}`);
    return res.data;
  },
};
