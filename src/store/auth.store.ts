import { create } from 'zustand';
import { apiRequest, ApiError } from '@/api/client';
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  MeResponse,
  User,
  RefreshResponse,
  ForgotPasswordResponse,
  UserRole,
} from '@/types/auth.types';

interface AuthState {
  isLoading: boolean;
  error: string | null;
  user: User | null;
  token: string | null;
  registeredEmail: string | null;
  registeredEmailCode: string | null;
  registeredRole: UserRole | null;
  resetCode: string | null;
  resetEmail: string | null;

  register: (data: RegisterRequest) => Promise<boolean>;
  verifyEmail: () => Promise<boolean>;
  setRegisteredEmailCode: (code: string | null) => void;
  clearError: () => void;
  reset: () => void;
  login: (data: LoginRequest) => Promise<boolean>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  loginWithGoogle: (idToken: string, role?: UserRole) => Promise<string | null>;
  sendResetEmail: (email: string) => Promise<string | null>;
  verifyResetCode: (email: string, code: string) => Promise<boolean>;
  setResetEmail: (email: string | null) => void;
  resetPassword: (email: string, newPassword: string) => Promise<boolean>;
  setResetCode: (code: string | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoading: false,
  error: null,
  user: null,
  token: localStorage.getItem('token'),
  registeredEmail: null,
  registeredEmailCode: null,
  registeredRole: null,
  resetCode: null,
  resetEmail: null,

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
        registeredRole: data.role,
      });
      return true;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Unexpected error';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  setRegisteredEmailCode: code => set({ registeredEmailCode: code }),
  setResetEmail: email => set({ resetEmail: email }),
  setResetCode: code => set({ resetCode: code }),

  verifyEmail: async () => {
    set({ isLoading: true, error: null });
    const { registeredEmail, registeredEmailCode, registeredRole } = get();
    if (!registeredEmail || !registeredEmailCode) {
      set({ isLoading: false, error: 'Missing email or verification code' });
      return false;
    }
    try {
      await apiRequest<RegisterResponse>('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email: registeredEmail, code: registeredEmailCode }),
      });

      if (registeredRole === 'trainer') {
        const token = localStorage.getItem('token');
        if (token) {
          const emptyTrainerProfile = {
            bio: '',
            certification: JSON.stringify([]),
            specialization: '',
            location: '',
            experience: [],
          };

          try {
            await apiRequest('/trainers', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(emptyTrainerProfile),
            });
          } catch (trainerError) {
            console.error('Failed to create trainer profile:', trainerError);
          }
        }
      }

      set({
        isLoading: false,
        registeredEmail: null,
        registeredEmailCode: null,
        registeredRole: null,
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

  loginWithGoogle: async (idToken: string, role?: UserRole) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Sending Google auth request with ID token and role:', role);

      const response = await apiRequest<{
        accessToken: string;
        user: User;
        isNewUser: boolean;
        message: string;
      }>('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ idToken, role }),
      });

      console.log('Google auth response:', response.message);

      localStorage.setItem('token', response.accessToken);

      if (response.isNewUser && role === 'trainer') {
        const emptyTrainerProfile = {
          bio: '',
          certification: JSON.stringify([]),
          specialization: '',
          location: '',
          experience: [],
        };

        try {
          await apiRequest('/trainers', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${response.accessToken}`,
            },
            body: JSON.stringify(emptyTrainerProfile),
          });
        } catch (trainerError) {
          console.error('Failed to create trainer profile:', trainerError);
        }
      }

      set({
        user: response.user,
        token: response.accessToken,
        isLoading: false,
      });

      return response.accessToken;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Google login failed';
      console.error('Google login error:', message);
      set({ isLoading: false, error: message });
      return null;
    }
  },

  sendResetEmail: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest<ForgotPasswordResponse>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      set({ isLoading: false });
      return response.message;
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Failed to send the password reset email. Please try again later.';
      set({ isLoading: false, error: message });
      return null;
    }
  },

  verifyResetCode: async (email: string, code: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiRequest('/auth/verify-reset-code', {
        method: 'POST',
        body: JSON.stringify({ email, code }),
      });
      set({ isLoading: false, resetCode: code });
      return true;
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Invalid or expired verification code';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  resetPassword: async (email: string, newPassword: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, newPassword }),
      });
      set({
        isLoading: false,
        resetEmail: null,
        resetCode: null,
      });
      return true;
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Failed to reset password. Please try again.';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  clearError: () => set({ error: null }),
  reset: () =>
    set({
      isLoading: false,
      error: null,
      registeredEmail: null,
      registeredRole: null,
      resetEmail: null,
      resetCode: null,
    }),
}));
