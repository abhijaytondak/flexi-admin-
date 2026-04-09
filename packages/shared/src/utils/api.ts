import axios, { type AxiosRequestConfig } from "axios";

const projectId = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID || "";
const publicAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-f011a1b3`;

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${publicAnonKey}`,
  },
});

async function request<T>(path: string, options: AxiosRequestConfig = {}): Promise<T> {
  const res = await apiClient.request<T>({
    url: path,
    ...options,
  });
  return res.data;
}

// Claims
export const getClaims = () => request<{ data: any[]; setupRequired?: boolean }>("/claims");
export const updateClaimStatus = (id: string, status: "approved" | "rejected", actionNote: string, actionBy = "Admin") =>
  request<{ data: any }>(`/claims/${id}/status`, { method: "PUT", data: { status, actionNote, actionBy } });
export const bulkImportClaims = (claims: any[]) =>
  request<{ data: any[]; count: number }>("/claims/bulk", { method: "POST", data: { claims } });

// Dashboard
export const getDashboard = () => request<{ data: { kpis: any; recentActivity: any[]; planDistribution?: any } }>("/dashboard");

// Employees
export const getEmployees = () => request<{ data: any[]; setupRequired?: boolean }>("/employees");
export const getEmployee = (id: string) => request<{ data: any }>(`/employees/${id}`);
export const createEmployee = (employee: any) => request<{ data: any }>("/employees", { method: "POST", data: employee });
export const updateEmployee = (id: string, patch: any) => request<{ data: any }>(`/employees/${id}`, { method: "PUT", data: patch });
export const deleteEmployee = (id: string) => request<{ data: any }>(`/employees/${id}`, { method: "DELETE" });
export const bulkImportEmployees = (employees: any[]) =>
  request<{ data: any[]; count: number }>("/employees/bulk", { method: "POST", data: { employees } });

// Policy
export const getPolicy = () => request<{ data: any[]; setupRequired?: boolean }>("/policy");
export const savePolicy = (brackets: any[]) => request<{ data: any[] }>("/policy", { method: "PUT", data: { brackets } });
export const createBracket = (bracket: any) => request<{ data: any; all: any[] }>("/policy/bracket", { method: "POST", data: bracket });
export const updateBracket = (id: string, patch: any) => request<{ data: any; all: any[] }>(`/policy/bracket/${id}`, { method: "PUT", data: patch });
export const deleteBracket = (id: string) => request<{ data: any[] }>(`/policy/bracket/${id}`, { method: "DELETE" });
export const bulkImportPolicy = (brackets: any[]) =>
  request<{ data: any[]; count: number }>("/policy/bulk", { method: "POST", data: { brackets } });

// Settings
export const getSettings = () => request<{ data: any }>("/settings");
export const saveSettings = (settings: any) => request<{ data: any }>("/settings", { method: "PUT", data: settings });

// Profile
export const getProfile = () => request<{ data: any }>("/profile");
export const saveProfile = (profile: any) => request<{ data: any }>("/profile", { method: "PUT", data: profile });

// Notifications
export const getNotifications = () => request<{ data: any[] }>("/notifications");
export const markNotificationRead = (id: string) => request<{ data: any }>(`/notifications/${id}/read`, { method: "PUT" });
export const markAllNotificationsRead = () => request<{ data: any[] }>("/notifications/read-all", { method: "PUT" });
export const dismissNotification = (id: string) => request<{ data: any[] }>(`/notifications/${id}`, { method: "DELETE" });

// Employee Levels
export const getEmployeeLevels = () => request<{ data: any }>("/employee-levels");
export const saveEmployeeLevels = (payload: any) => request<{ data: any }>("/employee-levels", { method: "PUT", data: payload });
