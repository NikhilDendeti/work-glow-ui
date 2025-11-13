import { useState } from 'react';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';
import CEODashboard from './CEODashboard';
import HODDashboard from './HODDashboard';
import PodView from './PodView';
import EmployeeDashboard from './EmployeeDashboard';
import AdminDashboard from './AdminDashboard';

const Index = () => {
  const [currentMonth, setCurrentMonth] = useState('2025-10');
  const { user } = useAuth();
  
  // Normalize role - handle case variations
  const userRole = user?.role;
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
  
  // Debug logging
  console.log('Index - User:', user);
  console.log('Index - User Role:', userRole);
  console.log('Index - Normalized Role:', normalizedRole);
  console.log('Index - Current Role:', currentRole);

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'CEO':
        return 'Chief Executive Officer';
      case 'HOD':
        return 'Head of Department';
      case 'PodLead':
        return 'Pod Lead';
      case 'Admin':
        return 'Administrator';
      case 'Automation':
        return 'Automation User';
      case 'Employee':
        return 'Employee';
      default:
        return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'CEO':
        return 'default';
      case 'HOD':
        return 'secondary';
      case 'PodLead':
        return 'outline';
      case 'Admin':
        return 'default';
      case 'Automation':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const renderDashboard = () => {
    switch (currentRole) {
      case 'CEO':
        return <CEODashboard month={currentMonth} />;
      case 'HOD':
        return <HODDashboard month={currentMonth} />;
      case 'PodLead':
        // Pod Lead sees their pod contributions
        return <PodView month={currentMonth} />;
      case 'Admin':
      case 'Automation':
        // Admin and Automation see Admin Dashboard
        return <AdminDashboard month={currentMonth} />;
      case 'Employee':
        // Employee sees their own contributions using employee_id
        return <EmployeeDashboard month={currentMonth} />;
      default:
        // Fallback: if role is unknown, try EmployeeDashboard first (safer than CEO)
        console.warn('Unknown role, defaulting to EmployeeDashboard:', currentRole);
        return <EmployeeDashboard month={currentMonth} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
        currentRole={currentRole}
      />
      <main>
        {/* Role Indicator Banner */}
        <div className="border-b bg-muted/30">
          <div className="container py-4">
            <Alert className="border-primary/50 bg-primary/5">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <AlertTitle className="flex items-center gap-3">
                <span>Logged in as:</span>
                <Badge variant={getRoleBadgeVariant(currentRole)} className="text-sm font-semibold">
                  {currentRole}
                </Badge>
              </AlertTitle>
              <AlertDescription className="mt-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{getRoleDisplayName(currentRole)}</span>
                  {user?.employee_code && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">Employee Code: {user.employee_code}</span>
                    </>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
        {renderDashboard()}
      </main>
    </div>
  );
};

export default Index;
