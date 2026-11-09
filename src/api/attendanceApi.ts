import api from './axios';

export interface SalaryPeriod {
  month: string; // 'YYYY-MM'
  start_date: string;
  end_date: string;
}

export interface SalarySummary {
  configured: boolean;
  reason?: string;
  monthly_salary: number;
  daily_salary: number;
  effective_from?: string;
  joining_date?: string;
  is_mid_month_join?: boolean;
  absent_days_count: number;
  absent_deduction: number;
  payable_salary: number;
}

export interface AbsentRecord {
  id: number;
  user_id: number;
  attendance_date: string;
  status: string;
  reason?: string | null;
  marked_by?: {
    id: number;
    name: string;
    role: string;
  } | null;
  created_at: string;
}

export interface EmployeeAttendanceData {
  user: {
    id: number;
    name: string;
    role: string;
    email: string;
    phone?: string | null;
    joining_date: string;
  };
  salary_period: SalaryPeriod;
  salary_summary: SalarySummary;
  absent_dates: string[];
  absent_records: AbsentRecord[];
}

export interface EmployeeSalaryItem {
  id: number;
  user_id: number;
  monthly_salary: string | number;
  daily_salary: string | number;
  effective_from: string;
  notes?: string | null;
  created_by?: {
    id: number;
    name: string;
    role: string;
  } | null;
  created_at?: string;
}

export interface AttendanceAuditLogItem {
  id: number;
  user_id: number;
  attendance_date: string;
  action: 'marked_absent' | 'removed_absent';
  actor_id?: number | null;
  actor_name: string;
  actor_role: string;
  reason?: string | null;
  created_at: string;
}

export const attendanceApi = {
  // Employee Attendance & Salary Summary
  getEmployeeAttendance: async (userId: number | string, month?: string): Promise<{ status: boolean; data: EmployeeAttendanceData }> => {
    const res = await api.get(`/employees/${userId}/attendance`, {
      params: { month },
    });
    return res.data;
  },

  // Mark Single Date or Range as Absent
  markAbsent: async (
    userId: number | string,
    payload: { start_date: string; end_date: string; reason?: string }
  ): Promise<{ status: boolean; message: string; marked_count: number; dates: string[] }> => {
    const res = await api.post(`/employees/${userId}/attendance/absent`, payload);
    return res.data;
  },

  // Remove/Correct an Absent Record
  removeAbsent: async (
    userId: number | string,
    payload: { attendance_date: string; reason?: string }
  ): Promise<{ status: boolean; message: string }> => {
    const res = await api.delete(`/employees/${userId}/attendance/absent`, { data: payload });
    return res.data;
  },

  // Salary Configuration
  configureSalary: async (
    userId: number | string,
    payload: { monthly_salary: number; effective_from: string; notes?: string }
  ): Promise<{ status: boolean; message: string; data: EmployeeSalaryItem }> => {
    const res = await api.post(`/employees/${userId}/salary`, payload);
    return res.data;
  },

  // Salary History
  getSalaryHistory: async (userId: number | string): Promise<{ status: boolean; data: EmployeeSalaryItem[] }> => {
    const res = await api.get(`/employees/${userId}/salaries`);
    return res.data;
  },

  // Audit Logs
  getAuditLogs: async (userId: number | string): Promise<{ status: boolean; data: AttendanceAuditLogItem[] }> => {
    const res = await api.get(`/employees/${userId}/attendance/audit-logs`);
    return res.data;
  },

  // Worker Self Attendance & Salary
  getMyAttendance: async (month?: string): Promise<{ status: boolean; data: EmployeeAttendanceData }> => {
    const res = await api.get('/worker/my-attendance', {
      params: { month },
    });
    return res.data;
  },
};
