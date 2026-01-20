import { Task, CreateTaskRequest, UpdateTaskRequest } from '../types/task';
import { User, CreateUserRequest, LoginRequest, LoginResponse as UserLoginResponse } from '../types/user';
import { ApiResponse, ListParams } from '../types/api';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7860';

export class ApiError extends Error {
  public status: number;
  public data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

// Type guard functions
function isApiResponse<T>(response: any): response is ApiResponse<T> {
  return response && typeof response === 'object' && 'data' in response;
}

// Base API configuration and utility functions
const apiConfig = {
  baseUrl: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Helper function to get auth token from localStorage or cookies
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

// Helper function to add auth headers
const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  return {
    ...apiConfig.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Main API utility functions
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${apiConfig.baseUrl}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // Handle different response status codes
    if (!response.ok) {
      let errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
      let errorData: any;

      try {
        errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (isApiResponse(errorData)) {
          errorMessage = errorData.message || errorMessage;
        }
      } catch (jsonError) {
        // If response is not JSON, use status text
        errorData = await response.text();
      }

      throw new ApiError(errorMessage, response.status, errorData);
    }

    // Handle empty response body for certain status codes
    if (response.status === 204) {
      return {} as T;
    }

    const responseData = await response.json();

    // Validate response structure
    if (isApiResponse<T>(responseData)) {
      return responseData.data;
    }

    return responseData;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof TypeError) {
      throw new ApiError('Network error or invalid URL', 0, error.message);
    }

    throw new ApiError('An unexpected error occurred', 500, error);
  }
};

// Authenticated GET request
export const get = async <T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> => {
  let url = endpoint;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });
    url += `?${searchParams.toString()}`;
  }

  return apiRequest<T>(url, {
    method: 'GET',
  });
};

// Authenticated POST request
export const post = async <T, R = T>(endpoint: string, data?: T): Promise<R> => {
  return apiRequest<R>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
};

// Authenticated PUT request
export const put = async <T, R = T>(endpoint: string, data: T): Promise<R> => {
  return apiRequest<R>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// Authenticated PATCH request
export const patch = async <T, R = T>(endpoint: string, data: T): Promise<R> => {
  return apiRequest<R>(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

// Authenticated DELETE request
export const del = async (endpoint: string): Promise<void> => {
  await apiRequest(endpoint, {
    method: 'DELETE',
  });
};

// Specific API endpoints for tasks
export const taskApi = {
  getAll: (params?: { is_completed?: boolean } & ListParams) =>
    get<Task[]>('/tasks', params),

  getById: (id: string) => get<Task>(`/tasks/${id}`),

  create: (userId: string, task: CreateTaskRequest) =>
    post<CreateTaskRequest, Task>(`/api/${userId}/tasks`, task),

  update: (id: string, task: UpdateTaskRequest) =>
    put<UpdateTaskRequest, Task>(`/tasks/${id}`, task),

  patch: (id: string, task: UpdateTaskRequest) =>
    patch<UpdateTaskRequest, Task>(`/tasks/${id}`, task),

  delete: (id: string) => del(`/tasks/${id}`),

  updateCompletion: (id: string, is_completed: boolean) =>
    patch<UpdateTaskRequest, Task>(`/tasks/${id}`, { is_completed }),
};

// Specific API endpoints for users
export const userApi = {
  getCurrentUser: () => get<User>('/api/v1/auth/me'),

  updateProfile: (userData: Partial<User>) =>
    put<Partial<User>, User>('/api/v1/users/me', userData),
};

// Authentication API endpoints
export const authApi = {
  login: (credentials: LoginRequest) =>
    post<LoginRequest, UserLoginResponse>('/api/v1/auth/login', credentials),

  register: (userData: CreateUserRequest) =>
    post<CreateUserRequest, UserLoginResponse>('/api/v1/auth/register', userData),

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  },

  verifyToken: () => get<{ valid: boolean }>('/api/v1/auth/verify'),
};

// API utility object
export const api = {
  get,
  post,
  put,
  patch,
  delete: del,
  task: taskApi,
  user: userApi,
  auth: authApi,
};

export default api;