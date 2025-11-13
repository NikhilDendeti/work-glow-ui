import { apiClient } from './client';
import { STORAGE_KEYS } from './config';
import type { LoginRequest, TokenResponse, User } from './types';

export interface UserProfile {
  id: number;
  employee_code: string;
  name: string;
  email: string;
  role: string;
  department_id: number;
  department_name: string;
  pod_id: number;
  pod_name: string;
}

export const authApi = {
  async login(employeeCode: string): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>('/token/', {
      employee_code: employeeCode,
    } as LoginRequest);

    if (response.success && response.data) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.access);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.refresh);
      return response.data;
    }

    throw new Error('Login failed');
  },

  async getCurrentUser(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>('/me/');
    return response.data;
  },

  async refreshToken(refresh: string): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>('/token/refresh/', {
      refresh,
    });

    if (response.success && response.data) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.access);
      if (response.data.refresh) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.refresh);
      }
      return response.data;
    }

    throw new Error('Token refresh failed');
  },

  logout() {
    // Clear all cached auth data including pod_id
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    console.log('Auth - Cleared all cached data (tokens and user info)');
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (userStr) {
      try {
        return JSON.parse(userStr) as User;
      } catch {
        return null;
      }
    }
    return null;
  },

  setStoredUser(user: User) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },
};

// Helper to decode JWT and extract user info
export function decodeJWT(token: string): Partial<User> | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    
    // Map JWT payload to User type (JWT uses snake_case)
    return {
      employee_code: decoded.employee_code,
      employee_id: decoded.employee_id,
      role: decoded.role,
      department_id: decoded.department_id, // This should be in JWT
      pod_id: decoded.pod_id,
    };
  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
}

