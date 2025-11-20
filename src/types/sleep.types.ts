export interface SleepLog {
  id: string;
  startTime: Date;
  endTime: Date;
  quality: number;
}

export interface SleepLogsResponse {
  message: string;
  logs: SleepLog[];
}

export interface CreateSleepLogsResponse {
  message: string;
  log: SleepLog;
}

export interface UpdateSleepLogsResponse {
  message: string;
  log: SleepLog;
}

export interface SleepLogsState {
  isLoading: boolean;
  error: string | null;
  sleepLogs: SleepLog[];
  getSleepLogs: () => Promise<void>;
  addSleepLog: (sleepLog: SleepLog) => Promise<void>;
  deleteSleepLog: (id: string) => Promise<void>;
  updateSleepLog: (id: string, sleepLog: SleepLog) => Promise<void>;
}
