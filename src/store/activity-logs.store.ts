import { create } from 'zustand';
import { apiRequest, ApiError } from '@/api/client';
import type {
  CreateActivityLogRequest,
  UpdateActivityLogRequest,
  CreateActivityLogResponse,
  GetActivityLogsResponse,
  GetActivityLogsPeriodResponse,
  UpdateActivityLogResponse,
  DeleteActivityLogResponse,
  ActivityLog,
} from '@/types/activity.types';

interface ActivityLogsState {
  isLoading: boolean;
  error: string | null;
  logs: ActivityLog[];

  createActivityLog: (data: CreateActivityLogRequest) => Promise<void>;
  getActivityLogs: () => Promise<void>;
  getActivityLogsPeriod: (date: string) => Promise<void>;
  updateActivityLog: (id: string, data: UpdateActivityLogRequest) => Promise<void>;
  deleteActivityLog: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useActivityLogsStore = create<ActivityLogsState>((set, get) => ({
  isLoading: false,
  error: null,
  logs: [],

  createActivityLog: async (data: CreateActivityLogRequest) => {
    set({ error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await apiRequest<CreateActivityLogResponse>('/activity-logs', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      set({ logs: [...get().logs, response.log] });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to create activity log';
      set({ error: message });
      throw error;
    }
  },

  getActivityLogs: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await apiRequest<GetActivityLogsResponse>('/activity-logs', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set({ logs: response.logs, isLoading: false });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        set({ logs: [], isLoading: false });
        return;
      }
      const message = error instanceof ApiError ? error.message : 'Failed to fetch activity logs';
      set({ isLoading: false, error: message });
    }
  },

  getActivityLogsPeriod: async (date: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await apiRequest<GetActivityLogsPeriodResponse>(
        `/activity-logs/period?date=${encodeURIComponent(date)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      set({ logs: response.logs, isLoading: false });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        set({ logs: [], isLoading: false });
        return;
      }
      const message =
        error instanceof ApiError ? error.message : 'Failed to fetch activity logs for period';
      set({ isLoading: false, error: message });
    }
  },

  updateActivityLog: async (id: string, data: UpdateActivityLogRequest) => {
    set({ error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await apiRequest<UpdateActivityLogResponse>(`/activity-logs/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const updatedLogs = get().logs.map(log => (log.id === id ? response.log : log));
      set({ logs: updatedLogs });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to update activity log';
      set({ error: message });
      throw error;
    }
  },

  deleteActivityLog: async (id: string) => {
    set({ error: null });
    try {
      const token = localStorage.getItem('token');
      await apiRequest<DeleteActivityLogResponse>(`/activity-logs/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set({ logs: get().logs.filter(log => log.id !== id) });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to delete activity log';
      set({ error: message });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
