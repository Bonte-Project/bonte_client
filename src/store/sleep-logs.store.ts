import { ApiError, apiRequest } from '@/api/client';
import type {
  CreateSleepLogsResponse,
  SleepLog,
  SleepLogsResponse,
  SleepLogsState,
  UpdateSleepLogsResponse,
} from '@/types/sleep.types';
import { create } from 'zustand';

export const useSleepLogsStore = create<SleepLogsState>((set, get) => ({
  isLoading: false,
  error: null,
  sleepLogs: [],

  getSleepLogs: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const now = new Date().toISOString();
      const response = await apiRequest<SleepLogsResponse>(`/sleep-logs/period?date=${now}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ sleepLogs: response.logs, isLoading: false });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        set({ sleepLogs: [], isLoading: false });
        return;
      }
      const message = error instanceof ApiError ? error.message : 'Failed to load sleep logs';
      set({ isLoading: false, error: message });
    }
  },

  addSleepLog: async (sleepLog: SleepLog) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await apiRequest<CreateSleepLogsResponse>('/sleep-logs', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(sleepLog),
      });
      set({ sleepLogs: [...get().sleepLogs, response.log], isLoading: false });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to add sleep log';
      set({ isLoading: false, error: message });
    }
  },

  deleteSleepLog: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      await apiRequest(`/sleep-logs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      set({ sleepLogs: get().sleepLogs.filter(log => log.id !== id) });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to delete sleep log';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  updateSleepLog: async (id: string, sleepLog: SleepLog) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await apiRequest<UpdateSleepLogsResponse>(`/sleep-logs/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sleepLog),
      });

      set({
        sleepLogs: get().sleepLogs.map(log => (log.id === id ? response.log : log)),
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to update sleep log';
      set({ isLoading: false, error: message });
      throw error;
    }
  },
}));
