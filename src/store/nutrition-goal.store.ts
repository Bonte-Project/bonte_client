import { ApiError, apiRequest } from '@/api/client';
import type {
  NutritionGoal,
  NutritionGoalResponse,
  NutritionGoalState,
} from '@/types/nutrition.types';
import { create } from 'zustand';

export const useNutritionGoalStore = create<NutritionGoalState>(set => ({
  isLoading: false,
  error: null,
  nutritionGoal: null,

  getNutritionGoal: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await apiRequest<NutritionGoalResponse>('/nutrition-goals', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ nutritionGoal: response.goal, isLoading: false });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        set({ nutritionGoal: null, isLoading: false });
        return;
      }
      const message = error instanceof ApiError ? error.message : 'Failed to load nutrition goals';
      set({ isLoading: false, error: message });
    }
  },

  setNutritionGoal: async (goal: NutritionGoal) => {
    set({ error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await apiRequest<NutritionGoalResponse>('/nutrition-goals', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goal),
      });
      set({ nutritionGoal: response.goal });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to save nutrition goals';
      set({ error: message });
      throw error;
    }
  },
}));
