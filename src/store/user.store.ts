import { create } from 'zustand';
import { apiRequest, ApiError } from '@/api/client';
import type { UpdateUserRequest } from '@/types/user.types';
import type { MeResponse, User } from '@/types/auth.types';

interface UserState {
  isLoading: boolean;
  error: string | null;
  updatedUser: User | null;

  updateUser: (data: UpdateUserRequest) => Promise<boolean>;
  clearError: () => void;
}

export const useUserStore = create<UserState>(set => ({
  isLoading: false,
  error: null,
  updatedUser: null,

  updateUser: async (data: UpdateUserRequest) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ isLoading: false, error: 'Missing token' });
        return false;
      }

      const response = await apiRequest<MeResponse>('/users/me', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      set({ isLoading: false, updatedUser: response.user });

      const { useAuthStore } = await import('@/store/auth.store');
      useAuthStore.setState({ user: response.user });

      return true;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Update failed';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
