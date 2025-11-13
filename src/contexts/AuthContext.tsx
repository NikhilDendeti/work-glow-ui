import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, decodeJWT } from '@/lib/api/auth';
import { STORAGE_KEYS } from '@/lib/api/config';
import type { User } from '@/lib/api/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (employeeCode: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize user - always fetch from /api/me/ to get current pod_id
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    if (accessToken) {
      // Always fetch fresh user data from /api/me/ to ensure pod_id is current
      authApi.getCurrentUser()
        .then((profile) => {
          console.log('Init - Fetched user profile from /api/me/:', profile);
          const newUser: User = {
            employee_code: profile.employee_code,
            employee_id: profile.id,
            role: profile.role as User['role'],
            department_id: profile.department_id,
            department_name: profile.department_name,
            pod_id: profile.pod_id, // Always use pod_id from /api/me/
            pod_name: profile.pod_name,
          };
          console.log('Init - Created user object with pod_id:', newUser.pod_id);
          setUser(newUser);
          authApi.setStoredUser(newUser);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Init - Failed to fetch user profile from /api/me/:', error);
          // Fallback: try stored user or JWT
          const storedUser = authApi.getStoredUser();
          if (storedUser) {
            console.warn('Init - Using stored user as fallback:', storedUser);
            setUser(storedUser);
          } else {
            const decoded = decodeJWT(accessToken);
            if (decoded) {
              const userFromToken: User = {
                employee_code: decoded.employee_code || '',
                employee_id: decoded.employee_id,
                role: decoded.role || 'Employee',
                department_id: decoded.department_id,
                pod_id: decoded.pod_id,
              };
              console.warn('Init - Using JWT data as fallback:', userFromToken);
              setUser(userFromToken);
              authApi.setStoredUser(userFromToken);
            }
          }
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (employeeCode: string) => {
    // Clear any cached user data first
    authApi.logout();
    
    // Get tokens from login
    const tokens = await authApi.login(employeeCode);
    
    // ALWAYS call /api/me/ after login to get current pod_id and other user info
    // This ensures we have the most up-to-date information from the backend
    try {
      const profile = await authApi.getCurrentUser();
      console.log('Login - Fetched user profile from /api/me/:', profile);
      
      const newUser: User = {
        employee_code: profile.employee_code,
        employee_id: profile.id,
        role: profile.role as User['role'],
        department_id: profile.department_id,
        department_name: profile.department_name,
        pod_id: profile.pod_id, // Always use pod_id from /api/me/
        pod_name: profile.pod_name,
      };
      
      console.log('Login - Created user object with pod_id:', newUser.pod_id);
      setUser(newUser);
      authApi.setStoredUser(newUser);
    } catch (error) {
      console.error('Failed to fetch user profile from /api/me/:', error);
      // Fallback: try to extract from JWT token
      const decoded = decodeJWT(tokens.access);
      if (decoded) {
        const fallbackUser: User = {
          employee_code: decoded.employee_code || employeeCode,
          employee_id: decoded.employee_id,
          role: decoded.role || 'Employee',
          department_id: decoded.department_id,
          pod_id: decoded.pod_id,
        };
        console.warn('Login - Using JWT fallback data:', fallbackUser);
        setUser(fallbackUser);
        authApi.setStoredUser(fallbackUser);
      } else {
        // Last resort: create basic user
        const defaultUser: User = {
          employee_code: employeeCode,
          role: 'Employee',
        };
        console.error('Login - Failed to get user data, using default:', defaultUser);
        setUser(defaultUser);
        authApi.setStoredUser(defaultUser);
      }
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

