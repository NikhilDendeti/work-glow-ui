import { useState } from 'react';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import AdminDashboard from './AdminDashboard';

export default function AdminDashboardPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));
  const { user } = useAuth();

  // Determine current role for header
  const userRole = user?.role?.toLowerCase();
  const currentRole = userRole === 'automation' ? 'Automation' : 'Admin';

  return (
    <div className="min-h-screen bg-background">
      <Header currentMonth={currentMonth} onMonthChange={setCurrentMonth} currentRole={currentRole} />
      <main>
        <AdminDashboard month={currentMonth} onMonthChange={setCurrentMonth} />
      </main>
    </div>
  );
}

