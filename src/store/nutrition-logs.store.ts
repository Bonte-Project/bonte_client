import { ApiError, apiRequest } from '@/api/client';
import type {
  CreateNutritionLogResponse,
  Meal,
  NutritionLogsResponse,
  NutritionState,
  UpdateNutritionLogResponse,
} from '@/types/nutrition.types';
import { create } from 'zustand';

export const useNutritionLogsStore = create<NutritionState>((set, get) => ({
  isLoading: false,
  error: null,
  logs: [],

  getNutritionLogs: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const now = new Date().toISOString();
      const response = await apiRequest<NutritionLogsResponse>(
        `/nutrition-logs/period?date=${now}`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      set({ logs: response.logs, isLoading: false });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        set({ logs: [], isLoading: false });
        return;
      }
      const message = error instanceof ApiError ? error.message : 'Failed to load nutrition logs';
      set({ isLoading: false, error: message });
    }
  },

  addNutritionLog: async (meal: Omit<Meal, 'id'>) => {
    set({ error: null });
    try {
      const token = localStorage.getItem('token');
      const weightMultiplier = meal.weightInGrams / 100;
      const adjustedMeal = {
        name: meal.name,
        mealType: meal.mealType,
        calories: meal.calories,
        protein: Math.round(meal.protein * weightMultiplier),
        carbs: Math.round(meal.carbs * weightMultiplier),
        fat: Math.round(meal.fat * weightMultiplier),
        weightInGrams: meal.weightInGrams,
        eatenAt: meal.eatenAt.toISOString(),
      };
      const response = await apiRequest<CreateNutritionLogResponse>('/nutrition-logs', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adjustedMeal),
      });
      set({ logs: [...get().logs, response.log] });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to add nutrition log';
      set({ error: message });
      throw error;
    }
  },

  deleteNutritionLog: async (id: string) => {
    set({ error: null });
    try {
      const token = localStorage.getItem('token');
      await apiRequest(`/nutrition-logs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      set({ logs: get().logs.filter(log => log.id !== id) });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to delete nutrition log';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  updateNutritionLog: async (id: string, nutritionLog: Meal) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await apiRequest<UpdateNutritionLogResponse>(`/nutrition-logs/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nutritionLog),
      });

      set({
        logs: get().logs.map(log => (log.id === id ? response.log : log)),
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to update nutrition log';
      set({ isLoading: false, error: message });
      throw error;
    }
  },
}));
