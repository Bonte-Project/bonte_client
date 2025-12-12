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
  GetAllTrainersResponse,
} from '@/types/trainer.types';
import type {
  TrainingSession,
  CreateTrainingSessionRequest,
  UpdateTrainingSessionRequest,
  GetTrainingSessionsResponse,
  CreateTrainingSessionResponse,
  UpdateTrainingSessionResponse,
  DeleteTrainingSessionResponse,
} from '@/types/training-sessions.types';

interface TrainerState {
  isLoading: boolean;
  error: string | null;
  trainer: Trainer | null;
  experience: Experience | null;
  trainingSessions: TrainingSession[];
  isLoadingSession: boolean;

  createTrainer: (data: CreateTrainerRequest) => Promise<boolean>;
  updateTrainer: (data: UpdateTrainerRequest) => Promise<boolean>;
  getMyTrainer: () => Promise<boolean>;
  getTrainerById: (id: string) => Promise<Trainer | null>;
  addExperience: (data: CreateExperienceRequest) => Promise<boolean>;
  updateExperience: (experienceId: string, data: UpdateExperienceRequest) => Promise<boolean>;
  deleteExperience: (experienceId: string) => Promise<boolean>;
  getAllTrainers: () => Promise<Trainer[] | null>;
  getTrainingSessions: () => Promise<boolean>;
  createTrainingSession: (data: CreateTrainingSessionRequest) => Promise<boolean>;
  updateTrainingSession: (
    sessionId: string,
    data: UpdateTrainingSessionRequest
  ) => Promise<boolean>;
  deleteTrainingSession: (sessionId: string) => Promise<boolean>;
  clearError: () => void;
}

export const useTrainerStore = create<TrainerState>((set, get) => ({
  isLoading: false,
  error: null,
  trainer: null,
  experience: null,
  trainingSessions: [],
  isLoadingSession: false,

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

  getAllTrainers: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiRequest<GetAllTrainersResponse>('/trainers');

      set({ isLoading: false });
      return response.trainers;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to fetch trainers';

      set({ isLoading: false, error: message });
      return null;
    }
  },

  getTrainingSessions: async () => {
    set({ isLoadingSession: true, error: null });
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ isLoadingSession: false, error: 'Missing token' });
        return false;
      }

      const response = await apiRequest<GetTrainingSessionsResponse>('/training-sessions/trainer', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set({ isLoadingSession: false, trainingSessions: response.sessions });
      return true;
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Failed to fetch training sessions';
      set({ isLoadingSession: false, error: message });
      return false;
    }
  },

  createTrainingSession: async (data: CreateTrainingSessionRequest) => {
    set({ isLoadingSession: true, error: null });
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ isLoadingSession: false, error: 'Missing token' });
        return false;
      }

      const response = await apiRequest<CreateTrainingSessionResponse>('/training-sessions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      set(state => ({
        isLoadingSession: false,
        trainingSessions: [...state.trainingSessions, response.session],
      }));

      return true;
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Failed to create training session';
      set({ isLoadingSession: false, error: message });
      return false;
    }
  },

  updateTrainingSession: async (sessionId: string, data: UpdateTrainingSessionRequest) => {
    set({ isLoadingSession: true, error: null });
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ isLoadingSession: false, error: 'Missing token' });
        return false;
      }

      const response = await apiRequest<UpdateTrainingSessionResponse>(
        `/training-sessions/${sessionId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      set(state => ({
        isLoadingSession: false,
        trainingSessions: state.trainingSessions.map(session =>
          session.id === sessionId ? response.session : session
        ),
      }));

      return true;
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Failed to update training session';
      set({ isLoadingSession: false, error: message });
      return false;
    }
  },

  deleteTrainingSession: async (sessionId: string) => {
    set({ isLoadingSession: true, error: null });
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ isLoadingSession: false, error: 'Missing token' });
        return false;
      }

      await apiRequest<DeleteTrainingSessionResponse>(`/training-sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set(state => ({
        isLoadingSession: false,
        trainingSessions: state.trainingSessions.filter(session => session.id !== sessionId),
      }));

      return true;
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Failed to delete training session';
      set({ isLoadingSession: false, error: message });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
