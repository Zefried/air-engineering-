import api from './axios';

export type ReminderStatus = 'pending' | 'notified' | 'resolved' | 'cancelled';

export interface PaymentReminderItem {
  id: number;
  project_id: number;
  created_by_user_id?: number | null;
  title: string;
  amount?: string | number | null;
  reminder_datetime: string;
  notes?: string | null;
  status: ReminderStatus;
  notified_at?: string | null;
  resolved_at?: string | null;
  resolved_by_user_id?: number | null;
  created_at: string;
  updated_at: string;
  project?: {
    id: number;
    project_code: string;
    name: string;
    client: string;
    site_location?: string;
  };
  created_by?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  resolved_by?: {
    id: number;
    name: string;
    role: string;
  };
}

export interface PaymentReminderKPIs {
  total_count: number;
  pending_count: number;
  notified_count: number;
  resolved_count: number;
  pending_amount: number;
  resolved_amount: number;
}

export interface CreatePaymentReminderPayload {
  project_id: number | string;
  title: string;
  amount?: number | string | null;
  reminder_datetime: string;
  notes?: string;
}

export const paymentRemindersApi = {
  getAll: async (params?: { status?: string; project_id?: number | string }): Promise<{
    status: boolean;
    kpis: PaymentReminderKPIs;
    data: PaymentReminderItem[];
  }> => {
    const res = await api.get('/admin/payment-reminders', { params });
    return res.data;
  },

  getById: async (id: number | string): Promise<{ status: boolean; data: PaymentReminderItem }> => {
    const res = await api.get(`/admin/payment-reminders/${id}`);
    return res.data;
  },

  create: async (payload: CreatePaymentReminderPayload): Promise<{
    status: boolean;
    message: string;
    data: PaymentReminderItem;
  }> => {
    const res = await api.post('/admin/payment-reminders', payload);
    return res.data;
  },

  update: async (
    id: number | string,
    payload: Partial<CreatePaymentReminderPayload> & { status?: ReminderStatus }
  ): Promise<{ status: boolean; message: string; data: PaymentReminderItem }> => {
    const res = await api.put(`/admin/payment-reminders/${id}`, payload);
    return res.data;
  },

  resolve: async (id: number | string): Promise<{ status: boolean; message: string; data: PaymentReminderItem }> => {
    const res = await api.post(`/admin/payment-reminders/${id}/resolve`);
    return res.data;
  },

  delete: async (id: number | string): Promise<{ status: boolean; message: string }> => {
    const res = await api.delete(`/admin/payment-reminders/${id}`);
    return res.data;
  },

  testNotify: async (id: number | string): Promise<{ status: boolean; message: string }> => {
    const res = await api.post(`/admin/payment-reminders/${id}/test-notify`);
    return res.data;
  },
};
