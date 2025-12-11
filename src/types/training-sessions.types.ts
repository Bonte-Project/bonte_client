export type SessionStatus = 'scheduled' | 'completed' | 'cancelled';

export interface TrainingSession {
  id: string;
  name: string;
  userId: string;
  trainerId: string;
  scheduledAt: string;
  status: SessionStatus;
}

export interface CreateTrainingSessionRequest {
  name: string;
  userId: string;
  scheduledAt: string;
}

export interface UpdateTrainingSessionRequest {
  name?: string;
  scheduledAt?: string;
  status?: SessionStatus;
}

export interface GetTrainingSessionsResponse {
  message: string;
  sessions: TrainingSession[];
}

export interface CreateTrainingSessionResponse {
  message: string;
  session: TrainingSession;
}

export interface UpdateTrainingSessionResponse {
  message: string;
  session: TrainingSession;
}

export interface DeleteTrainingSessionResponse {
  message: string;
}
