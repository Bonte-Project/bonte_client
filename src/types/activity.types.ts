export interface CreateActivityLogRequest {
  activityType: string;
  intensity: string;
  durationMinutes: number;
  completedAt: string;
}

export interface UpdateActivityLogRequest {
  activityType?: string;
  intensity?: string;
  durationMinutes?: number;
  completedAt?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  activityType: string;
  intensity: string;
  durationMinutes: number;
  completedAt: string;
}

export interface CreateActivityLogResponse {
  message: string;
  log: ActivityLog;
}

export interface GetActivityLogsResponse {
  logs: ActivityLog[];
}

export interface GetActivityLogsPeriodResponse {
  message: string;
  logs: ActivityLog[];
}

export interface UpdateActivityLogResponse {
  message: string;
  log: ActivityLog;
}

export interface DeleteActivityLogResponse {
  message: string;
}
