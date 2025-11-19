import { create } from 'zustand';
import { apiRequest, ApiError } from '@/api/client';
import type {
  CreateTrainerRequest,
  CreateTrainerResponse,
  UpdateTrainerRequest,
  UpdateTrainerResponse,
  GetTrainerResponse,
  CreateExperienceRequest,
  UpdateExperienceRequest,
  ExperienceResponse,
  DeleteExperienceResponse,
  Trainer,
  Experience,
} from '@/types/trainer.types';

interface TrainerState {
  isLoading: boolean;
  error: string | null;
  trainer: Trainer | null;
  experience: Experience | null;

  createTrainer: (data: CreateTrainerRequest) => Promise<boolean>;
  updateTrainer: (data: UpdateTrainerRequest) => Promise<boolean>;
  getMyTrainer: () => Promise<boolean>;
  getTrainerById: (id: string) => Promise<Trainer | null>;
  addExperience: (data: CreateExperienceRequest) => Promise<boolean>;
  updateExperience: (experienceId: string, data: UpdateExperienceRequest) => Promise<boolean>;
  deleteExperience: (experienceId: string) => Promise<boolean>;
  clearError: () => void;
}

export const useTrainerStore = create<TrainerState>((set, get) => ({
  isLoading: false,
  error: null,
  trainer: null,
  experience: null,

  createTrainer: async (data: CreateTrainerRequest) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ isLoading: false, error: 'Missing token' });
        return false;
      }

      const response = await apiRequest<CreateTrainerResponse>('/trainers', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      set({ isLoading: false, trainer: response.trainer });
      return true;
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Failed to create trainer profile';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  updateTrainer: async (data: UpdateTrainerRequest) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ isLoading: false, error: 'Missing token' });
        return false;
      }

      const response = await apiRequest<UpdateTrainerResponse>('/trainers/me', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      set({ isLoading: false, trainer: response.trainer });
      return true;
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Failed to update trainer profile';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  getMyTrainer: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ isLoading: false, error: 'Missing token' });
        return false;
      }

      const response = await apiRequest<GetTrainerResponse>('/trainers/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set({ isLoading: false, trainer: response.trainer });
      return true;
    } catch (error) {
      console.error('getMyTrainer failed', error);
      const message = error instanceof ApiError ? error.message : 'Failed to fetch trainer profile';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  getTrainerById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest<GetTrainerResponse>(`/trainers/${id}`);

      set({ isLoading: false, trainer: response.trainer });
      return response.trainer;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to fetch trainer profile';
      set({ isLoading: false, error: message });
      return null;
    }
  },

  addExperience: async (data: CreateExperienceRequest) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ isLoading: false, error: 'Missing token' });
        return false;
      }

      const response = await apiRequest<ExperienceResponse>('/trainers/me/experience', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const { trainer } = get();
      if (trainer) {
        const updatedExperience = trainer.experience
          ? [...trainer.experience, response.experience]
          : [response.experience];
        set({
          isLoading: false,
          experience: response.experience,
          trainer: {
            ...trainer,
            experience: updatedExperience,
          },
        });
      } else {
        set({ isLoading: false, experience: response.experience });
      }

      return true;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to add experience';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  updateExperience: async (experienceId: string, data: UpdateExperienceRequest) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ isLoading: false, error: 'Missing token' });
        return false;
      }

      const response = await apiRequest<ExperienceResponse>(
        `/trainers/me/experience/${experienceId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      const { trainer } = get();
      if (trainer && trainer.experience) {
        const updatedExperience = trainer.experience.map(exp =>
          exp.id === experienceId ? response.experience : exp
        );
        set({
          isLoading: false,
          experience: response.experience,
          trainer: {
            ...trainer,
            experience: updatedExperience,
          },
        });
      } else {
        set({ isLoading: false, experience: response.experience });
      }

      return true;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to update experience';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  deleteExperience: async (experienceId: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ isLoading: false, error: 'Missing token' });
        return false;
      }

      await apiRequest<DeleteExperienceResponse>(`/trainers/me/experience/${experienceId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { trainer } = get();
      if (trainer && trainer.experience) {
        const updatedExperience = trainer.experience.filter(exp => exp.id !== experienceId);
        set({
          isLoading: false,
          trainer: {
            ...trainer,
            experience: updatedExperience,
          },
        });
      } else {
        set({ isLoading: false });
      }

      return true;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to delete experience';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
