import { API_BASE_URL, STORAGE_KEYS } from './config';
import type { ApiResponse, ApiError } from './types';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    console.log('apiClient.request - Full URL:', url);
    console.log('apiClient.request - Has token:', !!accessToken);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
      let response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 - try to refresh token
      if (response.status === 401 && accessToken) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry original request with new token
          const newToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
          if (newToken) {
            headers['Authorization'] = `Bearer ${newToken}`;
            response = await fetch(url, {
              ...options,
              headers,
            });
          }
        } else {
          // Refresh failed, clear auth and throw
          this.clearAuth();
          throw new Error('Authentication failed. Please login again.');
        }
      }

      const data = await response.json();

      if (!response.ok) {
        const error: ApiError = {
          success: false,
          message: data.message || 'An error occurred',
          error_code: data.error_code,
          errors: data.errors,
        };
        throw error;
      }

      return data as ApiResponse<T>;
    } catch (error) {
      if (error instanceof Error && 'success' in error) {
        throw error;
      }
      // Network or other errors
      throw {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
        error_code: 'NETWORK_ERROR',
      } as ApiError;
    }
  }

  private async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      if (data.success && data.data?.access) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.data.access);
        if (data.data.refresh) {
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.data.refresh);
        }
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  private clearAuth() {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    console.log('apiClient.get - Endpoint:', endpoint);
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async postFormData<T>(
    endpoint: string,
    formData: FormData,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    const headers: HeadersInit = {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
      let response = await fetch(url, {
        ...options,
        method: 'POST',
        headers,
        body: formData,
      });

      // Handle 401 - try to refresh token
      if (response.status === 401 && accessToken) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          const newToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
          if (newToken) {
            headers['Authorization'] = `Bearer ${newToken}`;
            response = await fetch(url, {
              ...options,
              method: 'POST',
              headers,
              body: formData,
            });
          }
        } else {
          this.clearAuth();
          throw new Error('Authentication failed. Please login again.');
        }
      }

      const data = await response.json();

      if (!response.ok) {
        const error: ApiError = {
          success: false,
          message: data.message || 'An error occurred',
          error_code: data.error_code,
          errors: data.errors,
        };
        throw error;
      }

      return data as ApiResponse<T>;
    } catch (error) {
      if (error instanceof Error && 'success' in error) {
        throw error;
      }
      throw {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
        error_code: 'NETWORK_ERROR',
      } as ApiError;
    }
  }
}

export const apiClient = new ApiClient();

