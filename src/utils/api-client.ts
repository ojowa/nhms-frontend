/**
 * API Client Configuration
 * Aligned with backend response format and validation
 */

import axios, { AxiosError, AxiosResponse } from 'axios';
import { backendApiUrl } from './runtimeConfig';

// Standardized API Response format from backend
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Array<{ field: string; message: string }>;
  timestamp: string;
  requestId?: string;
}

// Extended Axios response with our API response type
export type ApiSuccessResponse<T> = AxiosResponse<ApiResponse<T>>;
export type ApiErrorResponse = AxiosError<ApiResponse>;

// Base configuration for API calls to the backend
const api = axios.create({
  baseURL: backendApiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle standardized response format
api.interceptors.response.use(
  (response) => {
    // Check if response has our standardized format
    const apiResponse = response.data as ApiResponse;
    
    if (apiResponse.success !== undefined && !apiResponse.success) {
      // Backend returned an error in standardized format
      return Promise.reject(createApiError(response, apiResponse));
    }
    
    // For successful responses, extract the data wrapper if present
    if (apiResponse.success === true && apiResponse.data !== undefined) {
      response.data = apiResponse.data;
    }
    
    return response;
  },
  (error: AxiosError) => {
    // Handle HTTP errors
    if (error.response) {
      const apiResponse = error.response.data as ApiResponse;
      
      // If it's a validation error, preserve the detailed errors
      if (error.response.status === 400 && apiResponse.errors) {
        return Promise.reject(createApiError(error.response, apiResponse));
      }
      
      // Handle other error formats
      if (apiResponse.error) {
        return Promise.reject(createApiError(error.response, apiResponse));
      }
    }
    
    // Handle network errors
    if (!error.response && error.code === 'ECONNABORTED') {
      return Promise.reject(
        new ApiError(
          'Request timeout. Please try again.',
          408,
          undefined,
          'TIMEOUT'
        )
      );
    }
    
    return Promise.reject(error);
  }
);

// Custom API Error class
export class ApiError extends Error {
  status: number;
  code?: string;
  errors?: Array<{ field: string; message: string }>;
  requestId?: string;
  timestamp?: string;

  constructor(
    message: string,
    status: number,
    errors?: Array<{ field: string; message: string }>,
    code?: string,
    requestId?: string,
    timestamp?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
    this.code = code;
    this.requestId = requestId;
    this.timestamp = timestamp;
  }

  // Check if error is a validation error
  isValidationError(): boolean {
    return this.status === 400 && this.errors !== undefined;
  }

  // Get field-specific error message
  getFieldError(fieldName: string): string | undefined {
    return this.errors?.find((e) => e.field === fieldName)?.message;
  }

  // Get all error messages as a single string
  getAllErrorMessages(): string {
    if (!this.errors || this.errors.length === 0) {
      return this.message;
    }
    return this.errors.map((e) => e.message).join('; ');
  }
}

// Helper function to create API error from response
function createApiError(
  response: AxiosResponse | ApiErrorResponse['response'],
  apiResponse: ApiResponse
): ApiError {
  return new ApiError(
    apiResponse.error || apiResponse.message || 'An error occurred',
    response?.status || 500,
    apiResponse.errors,
    undefined,
    apiResponse.requestId,
    apiResponse.timestamp
  );
}

// Type-safe HTTP methods
export const apiClient = {
  get<T = unknown>(url: string, config?: object): Promise<T> {
    return api.get<T>(url, config).then((res) => res.data as T);
  },

  post<T = unknown>(url: string, data?: unknown, config?: object): Promise<T> {
    return api.post<T>(url, data, config).then((res) => res.data as T);
  },

  put<T = unknown>(url: string, data?: unknown, config?: object): Promise<T> {
    return api.put<T>(url, data, config).then((res) => res.data as T);
  },

  patch<T = unknown>(url: string, data?: unknown, config?: object): Promise<T> {
    return api.patch<T>(url, data, config).then((res) => res.data as T);
  },

  delete<T = unknown>(url: string, config?: object): Promise<T> {
    return api.delete<T>(url, config).then((res) => res.data as T);
  },

  // File upload with FormData
  upload<T = unknown>(
    url: string,
    formData: FormData,
    config?: Record<string, unknown>
  ): Promise<T> {
    return api.post<T>(url, formData, {
      ...config,
      headers: {
        ...(config as any)?.headers,
        'Content-Type': 'multipart/form-data',
      },
    }).then((res) => res.data as T);
  },

  // Download file as blob
  download(url: string, config?: object): Promise<Blob> {
    return api
      .get(url, {
        ...config,
        responseType: 'blob',
      })
      .then((res) => res.data as Blob);
  },
};

// Export the axios instance for direct use if needed
export default api;

// Helper to handle validation errors in forms
export const handleValidationError = (
  error: unknown,
  setFieldError?: (field: string, message: string) => void
): string | null => {
  if (error instanceof ApiError && error.isValidationError()) {
    if (setFieldError && error.errors) {
      error.errors.forEach((err) => {
        setFieldError(err.field, err.message);
      });
    }
    return error.getAllErrorMessages();
  }
  return error instanceof Error ? error.message : 'An unexpected error occurred';
};

// Helper to check if error is authentication-related
export const isAuthError = (error: unknown): boolean => {
  return error instanceof ApiError && (error.status === 401 || error.status === 403);
};

// Helper to check if error is not found
export const isNotFoundError = (error: unknown): boolean => {
  return error instanceof ApiError && error.status === 404;
};
