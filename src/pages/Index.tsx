import { useState } from 'react';
import { Header } from '@/components/Header';
import { Role } from '@/types';
import CEODashboard from './CEODashboard';
import HODDashboard from './HODDashboard';
import PodView from './PodView';

const Index = () => {
  const [currentMonth, setCurrentMonth] = useState('2025-10');
  const [currentRole, setCurrentRole] = useState<Role>('CEO');

  const renderDashboard = () => {
    switch (currentRole) {
      case 'CEO':
        return <CEODashboard />;
      case 'HOD':
        return <HODDashboard />;
      case 'PodLead':
      case 'Employee':
        return <PodView />;
      default:
        return <CEODashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
      />
      <main>{renderDashboard()}</main>
    </div>
  );
};

export default Index;
