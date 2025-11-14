import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { AdminActionCard } from '@/components/AdminActionCard';
import {
  Upload,
  FileCheck,
  FileText,
  Users,
  FileSpreadsheet,
  Download,
} from 'lucide-react';

interface AdminDashboardProps {
  month: string;
  onMonthChange?: (month: string) => void;
}

export default function AdminDashboard({ month, onMonthChange }: AdminDashboardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Determine current role
  const userRole = user?.role?.toLowerCase();
  const isAutomation = userRole === 'automation';
  const isAdmin = userRole === 'admin';

  // Automation users can only upload initial XLSX
  const automationActions = [
    {
      title: 'Upload Initial XLSX',
      description: 'Upload initial XLSX file and generate allocation sheets for Pod Leads',
      icon: Upload,
      onClick: () => navigate('/admin/upload-initial-xlsx'),
    },
  ];

  // Admin users can access all operations
  const adminActions = [
    {
      title: 'Upload Initial XLSX',
      description: 'Upload initial XLSX file and generate allocation sheets for Pod Leads',
      icon: Upload,
      onClick: () => navigate('/admin/upload-initial-xlsx'),
    },
    {
      title: 'Process Allocations',
      description: 'Process submitted Pod Lead allocations into contribution records',
      icon: FileCheck,
      onClick: () => navigate('/admin/process-allocations'),
    },
    {
      title: 'Final Master List',
      description: 'Generate and download the final master list for the selected month',
      icon: FileText,
      onClick: () => navigate('/admin/final-master-list'),
    },
    {
      title: 'Import Employee Data',
      description: 'Import employee master data from CSV file',
      icon: Users,
      onClick: () => navigate('/admin/import-employees'),
    },
    {
      title: 'Upload Feature CSV',
      description: 'Upload feature CSV and generate allocation sheets',
      icon: FileSpreadsheet,
      onClick: () => navigate('/admin/upload-features'),
    },
    {
      title: 'Generate All Pod Sheets',
      description: 'Generate allocation sheets for all pods',
      icon: Download,
      onClick: () => navigate('/admin/generate-sheets'),
    },
  ];

  // Select actions based on role
  const actions = isAutomation ? automationActions : adminActions;
  const dashboardTitle = isAutomation ? 'Automation Dashboard' : 'Admin Dashboard';
  const dashboardDescription = isAutomation 
    ? 'Upload initial XLSX and generate allocation sheets' 
    : 'Manage allocations, uploads, and master lists';

  return (
    <>
      {/* Header */}
      <div className="container space-y-8 py-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">{dashboardTitle}</h2>
          <p className="text-muted-foreground text-lg">{dashboardDescription}</p>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6 card-hover bg-gradient-to-br from-primary/5 to-primary/0 border-primary/20 fade-in stagger-item">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Current Month</p>
                <p className="text-3xl font-bold text-primary">{month}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center transition-transform duration-300 hover:scale-110">
                <span className="text-2xl">📅</span>
              </div>
            </div>
          </Card>
          <Card className="p-6 card-hover bg-gradient-to-br from-info/5 to-info/0 border-info/20 fade-in stagger-item">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Admin Operations</p>
                <p className="text-3xl font-bold text-info">{actions.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-info/10 flex items-center justify-center transition-transform duration-300 hover:scale-110">
                <span className="text-2xl">⚙️</span>
              </div>
            </div>
          </Card>
          <Card className="p-6 card-hover bg-gradient-to-br from-success/5 to-success/0 border-success/20 fade-in stagger-item">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Status</p>
                <p className="text-3xl font-bold text-success">Active</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center transition-transform duration-300 hover:scale-110">
                <span className="text-2xl">✓</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="fade-in">
          <h3 className="mb-4 text-xl font-semibold">Quick Actions</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {actions.map((action, index) => (
              <AdminActionCard key={index} {...action} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

