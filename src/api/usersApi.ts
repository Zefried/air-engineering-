import api from "./axios";

export interface UserPayload {
  name: string;
  email: string;
  role: "admin" | "manager" | "subadmin" | "worker" | "technician";
  phone?: string;
  password?: string;
}

export interface UserItem {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedUsersResponse {
  status: boolean;
  kpis: {
    total_users: number;
    managers: number;
    workers: number;
    admins: number;
  };
  data: {
    current_page: number;
    data: UserItem[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

export const usersApi = {
  getAll: async (params?: { page?: number; per_page?: number; search?: string; role?: string }) => {
    const response = await api.get<PaginatedUsersResponse>("/users", { params });
    return response.data;
  },

  getById: async (id: number | string) => {
    const response = await api.get<{ status: boolean; data: UserItem }>(`/users/${id}`);
    return response.data;
  },

  create: async (payload: UserPayload) => {
    const response = await api.post<{ status: boolean; message: string; data: UserItem }>("/users", payload);
    return response.data;
  },

  update: async (id: number | string, payload: Partial<UserPayload>) => {
    const response = await api.put<{ status: boolean; message: string; data: UserItem }>(`/users/${id}`, payload);
    return response.data;
  },

  delete: async (id: number | string) => {
    const response = await api.delete<{ status: boolean; message: string }>(`/users/${id}`);
    return response.data;
  },
};
