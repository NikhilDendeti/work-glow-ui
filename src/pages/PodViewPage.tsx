import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import PodView from './PodView';

export default function PodViewPage() {
  const [currentMonth, setCurrentMonth] = useState('2025-10');
  const { user } = useAuth();
  const currentRole = user?.role || 'Employee';
  const navigate = useNavigate();

  const handleBack = () => {
    // Use browser history if available, otherwise navigate based on role
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback: navigate based on user role
      if (user?.role === 'HOD') {
        navigate('/hod');
      } else if (user?.role === 'CEO') {
        navigate('/ceo');
      } else {
        navigate('/');
      }
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
        {/* Back Button - Top Left */}
        <div className="border-b bg-background">
          <div className="container py-3">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="gap-2 -ml-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        </div>
        <PodView month={currentMonth} />
      </main>
    </div>
  );
}

