import { create } from 'zustand';
import { apiRequest, ApiError } from '@/api/client';
import type {
  RegisterRequest,
  RegisterResponse,
  GoogleAuthResponse,
  LoginRequest,
  LoginResponse,
  MeResponse,
  User,
  RefreshResponse,
} from '@/types/auth.types';

interface AuthState {
  isLoading: boolean;
  error: string | null;
  user: User | null;
  token: string | null;
  registeredEmail: string | null;
  registeredEmailCode: string | null;

  register: (data: RegisterRequest) => Promise<boolean>;
  verifyEmail: () => Promise<boolean>;
  setRegisteredEmailCode: (code: string | null) => void;
  clearError: () => void;
  reset: () => void;
  login: (data: LoginRequest) => Promise<boolean>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  loginWithGoogle: (token: string) => Promise<string | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoading: false,
  error: null,
  user: null,
  token: localStorage.getItem('token'),
  registeredEmail: null,
  registeredEmailCode: null,

  register: async (data: RegisterRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest<RegisterResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      set({
        isLoading: false,
        registeredEmail: response.email,
      });
      return true;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Unexpected error';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  setRegisteredEmailCode: code => set({ registeredEmailCode: code }),

  verifyEmail: async () => {
    set({ isLoading: true, error: null });
    const { registeredEmail, registeredEmailCode } = get();
    if (!registeredEmail || !registeredEmailCode) {
      set({ isLoading: false, error: 'Missing email or verification code' });
      return false;
    }
    try {
      await apiRequest<RegisterResponse>('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email: registeredEmail, code: registeredEmailCode }),
      });
      set({
        isLoading: false,
        registeredEmail: null,
        registeredEmailCode: null,
      });
      return true;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Unexpected error';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  login: async (data: LoginRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      console.log('Access token:', response.accessToken);
      localStorage.setItem('token', response.accessToken);

      await get().fetchMe();

      set({ isLoading: false });
      return true;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Login failed';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  fetchMe: async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Access token fetchMe:', token);
      if (!token) return;
      const response = await apiRequest<MeResponse>('/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ user: response.user, token });
    } catch (error) {
      console.error('fetchMe failed', error);
      get().logout();
    }
  },

  refreshToken: async () => {
    try {
      const response = await apiRequest<RefreshResponse>('/auth/refresh', {
        method: 'POST',
      });
      localStorage.setItem('token', response.accessToken);
      set({ token: response.accessToken });
      return true;
    } catch (error) {
      console.error('refreshToken failed', error);
      get().logout();
      return false;
    }
  },

  loginWithGoogle: async (token: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest<GoogleAuthResponse>('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
      localStorage.setItem('token', response.token);
      await get().fetchMe();
      set({ isLoading: false });
      return response.token;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Google login failed';
      set({ isLoading: false, error: message });
      return null;
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set({ isLoading: false, error: null, registeredEmail: null }),
}));
