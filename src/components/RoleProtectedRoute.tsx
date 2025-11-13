import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@/types';

interface RoleProtectedRouteProps {
  children: ReactNode;
  allowedRoles: Role[];
}

export function RoleProtectedRoute({ children, allowedRoles }: RoleProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Normalize role for comparison
  const userRole = user.role;
  const normalizedRole = userRole?.toLowerCase();
  let currentRole: string;

  if (normalizedRole === 'ceo') {
    currentRole = 'CEO';
  } else if (normalizedRole === 'hod') {
    currentRole = 'HOD';
  } else if (normalizedRole === 'podlead' || normalizedRole === 'pod_lead') {
    currentRole = 'PodLead';
  } else if (normalizedRole === 'admin') {
    currentRole = 'Admin';
  } else if (normalizedRole === 'automation') {
    currentRole = 'Automation';
  } else {
    currentRole = 'Employee';
  }

  // Check if user role is in allowed roles
  const isAllowed = allowedRoles.some((role) => {
    // Admin and Automation can both access Admin routes
    if (role === 'Admin' && (currentRole === 'Admin' || currentRole === 'Automation')) {
      return true;
    }
    return role === currentRole;
  });

  if (!isAllowed) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

