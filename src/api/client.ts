const API_BASE_URL = import.meta.env.VITE_API_URL as string;

interface ApiErrorData {
  message?: string;
  [key: string]: unknown;
}

export class ApiError extends Error {
  status: number;
  data?: ApiErrorData;

  constructor(status: number, message: string, data?: ApiErrorData) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options?.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = (await response.json()) as ApiErrorData;

    if (!response.ok) {
      throw new ApiError(response.status, (data.message as string) || 'Request failed', data);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Network error. Please try again.');
  }
}
