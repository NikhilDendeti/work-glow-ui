import { useMutation } from '@tanstack/react-query';
import { useAuth as useAuthContext } from '@/hooks/useAuth';
import { authApi } from '@/lib/api/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export function useLogin() {
  const { login: setAuth } = useAuthContext();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (employeeCode: string) => {
      return authApi.login(employeeCode);
    },
    onSuccess: async (tokens, employeeCode) => {
      // Extract user info from token and set in context
      await setAuth(employeeCode);
      navigate('/');
      toast({
        title: 'Login successful',
        description: 'Welcome back!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid employee code',
        variant: 'destructive',
      });
    },
  });
}

export function useLogout() {
  const { logout } = useAuthContext();
  const navigate = useNavigate();

  return () => {
    logout();
    navigate('/login');
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully',
    });
  };
}

