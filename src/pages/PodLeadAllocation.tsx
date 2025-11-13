import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, FileEdit, AlertCircle, ArrowLeft } from 'lucide-react';
import { usePodAllocations } from '@/hooks/api/useAllocations';
import { useDownloadAllocationSheet } from '@/hooks/api/useAllocations';
import { useAuth } from '@/hooks/useAuth';
import { AllocationTable } from '@/components/AllocationTable';
import { toast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import { AllocationStatus } from '@/lib/api/types';

interface PodLeadAllocationProps {
  month: string;
}

export default function PodLeadAllocation({ month: initialMonth }: PodLeadAllocationProps) {
  const [month, setMonth] = useState(initialMonth);
  const { user } = useAuth();
  const podId = user?.pod_id;
  const navigate = useNavigate();
  const { data: allocations, isLoading, isError, error } = usePodAllocations(podId, month);
  const downloadMutation = useDownloadAllocationSheet();

  const handleDownload = () => {
    if (!podId) {
      toast({
        title: 'Error',
        description: 'Pod ID is missing',
        variant: 'destructive',
      });
      return;
    }
    downloadMutation.mutate({ podId, month });
  };

  const handleEdit = () => {
    navigate('/pod-lead/allocations/form');
  };

  const handleBack = () => {
    navigate('/');
  };

  if (!podId) {
    return (
      <div className="min-h-screen bg-background">
        <Header currentMonth={month} onMonthChange={() => {}} currentRole="PodLead" />
        <div className="container py-8">
          <div className="mb-4">
            <Button variant="ghost" onClick={handleBack} className="gap-2 -ml-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
          <Card className="p-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold">Pod ID Missing</p>
                <p className="text-sm text-muted-foreground">
                  Unable to load allocations. Pod ID is required but not found in user profile.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header currentMonth={month} onMonthChange={() => {}} currentRole="PodLead" />
        <div className="container space-y-8 py-8">
          <div className="flex items-center">
            <Button variant="ghost" onClick={handleBack} className="gap-2 -ml-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
          <Skeleton className="h-12 w-64" />
          <Card className="p-6">
            <Skeleton className="h-64 w-full" />
          </Card>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <Header currentMonth={month} onMonthChange={() => {}} currentRole="PodLead" />
        <div className="container py-8">
          <div className="mb-4">
            <Button variant="ghost" onClick={handleBack} className="gap-2 -ml-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-destructive font-semibold">Failed to load allocations</p>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : 'Please try again or contact support.'}
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const allocationsList = allocations || [];
  const pendingCount = allocationsList.filter((a) => a.status === 'PENDING').length;
  const submittedCount = allocationsList.filter((a) => a.status === 'SUBMITTED').length;
  const processedCount = allocationsList.filter((a) => a.status === 'PROCESSED').length;

  const hasPending = pendingCount > 0;
  const canEdit = hasPending || submittedCount > 0;

  return (
    <div className="min-h-screen bg-background">
      <Header currentMonth={month} onMonthChange={setMonth} currentRole="PodLead" />
      <div className="container space-y-8 py-8">
        {/* Back Button */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="gap-2 -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Pod Allocations</h2>
            <p className="text-muted-foreground">Manage your pod's product allocations</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownload} disabled={downloadMutation.isPending}>
              <Download className="mr-2 h-4 w-4" />
              {downloadMutation.isPending ? 'Downloading...' : 'Download Sheet'}
            </Button>
            {canEdit && (
              <Button onClick={handleEdit}>
                <FileEdit className="mr-2 h-4 w-4" />
                Edit Allocations
              </Button>
            )}
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold">{pendingCount}</p>
              </div>
              <div className="rounded-full bg-yellow-500/10 p-3">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                <p className="text-3xl font-bold">{submittedCount}</p>
              </div>
              <div className="rounded-full bg-blue-500/10 p-3">
                <FileEdit className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processed</p>
                <p className="text-3xl font-bold">{processedCount}</p>
              </div>
              <div className="rounded-full bg-green-500/10 p-3">
                <Download className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Allocations Table */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Allocations</h3>
          <AllocationTable allocations={allocationsList} />
        </Card>
      </div>
    </div>
  );
}

