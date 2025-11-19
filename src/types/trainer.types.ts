export interface Experience {
  id: string;
  trainerId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface CreateExperienceRequest {
  title: string;
  description: string;
  startDate: string | null;
  endDate: string | null;
}

export interface UpdateExperienceRequest {
  title: string;
  description: string;
  startDate: string | null;
  endDate: string | null;
}

export interface CreateTrainerRequest {
  bio: string;
  certification: string;
  specialization: string;
  location: string;
  experience: CreateExperienceRequest[];
}

export interface UpdateTrainerRequest {
  bio?: string;
  certification?: string;
  specialization?: string;
  location?: string;
  isActive?: boolean;
}

export interface Trainer {
  id: string;
  userId: string;
  bio: string;
  certification: string;
  specialization: string;
  location: string;
  isActive: boolean;
  experience?: Experience[];
}

export interface CreateTrainerResponse {
  message: string;
  trainer: Trainer;
}

export interface UpdateTrainerResponse {
  message: string;
  trainer: Trainer;
}

export interface GetTrainerResponse {
  message: string;
  trainer: Trainer;
}

export interface ExperienceResponse {
  message: string;
  experience: Experience;
}

export interface DeleteExperienceResponse {
  message: string;
}
