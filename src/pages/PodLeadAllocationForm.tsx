import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Save, ArrowLeft, AlertCircle } from 'lucide-react';
import { usePodAllocations } from '@/hooks/api/useAllocations';
import { useSubmitAllocations } from '@/hooks/api/useAllocations';
import { useAuth } from '@/hooks/useAuth';
import { AllocationTable } from '@/components/AllocationTable';
import { Header } from '@/components/Header';
import { PodLeadAllocation } from '@/lib/api/types';
import { toast } from '@/hooks/use-toast';

interface PodLeadAllocationFormProps {
  month: string;
}

export default function PodLeadAllocationForm({ month: initialMonth }: PodLeadAllocationFormProps) {
  const [month, setMonth] = useState(initialMonth);
  const { user } = useAuth();
  const podId = user?.pod_id;
  const navigate = useNavigate();
  const { data: allocations, isLoading, isError } = usePodAllocations(podId, month);
  const submitMutation = useSubmitAllocations(podId);

  const [localAllocations, setLocalAllocations] = useState<PodLeadAllocation[]>([]);

  useEffect(() => {
    if (allocations) {
      // Filter to only pending/submitted allocations that can be edited
      const editable = allocations.filter(
        (a) => a.status === 'PENDING' || a.status === 'SUBMITTED'
      );
      setLocalAllocations(editable);
    }
  }, [allocations]);

  const handleAllocationChange = (
    id: number,
    field: 'academy_percent' | 'intensive_percent' | 'niat_percent' | 'is_verified_description',
    value: number | boolean
  ) => {
    setLocalAllocations((prev) =>
      prev.map((alloc) =>
        alloc.id === id
          ? {
              ...alloc,
              [field]: value,
              total_percent:
                field === 'academy_percent' || field === 'intensive_percent' || field === 'niat_percent'
                  ? (field === 'academy_percent'
                      ? (value as number)
                      : alloc.academy_percent) +
                    (field === 'intensive_percent'
                      ? (value as number)
                      : alloc.intensive_percent) +
                    (field === 'niat_percent' ? (value as number) : alloc.niat_percent)
                  : alloc.total_percent,
            }
          : alloc
      )
    );
  };

  const validateAllocations = (): boolean => {
    for (const alloc of localAllocations) {
      const total =
        alloc.academy_percent + alloc.intensive_percent + alloc.niat_percent;
      if (total > 100) {
        toast({
          title: 'Validation Error',
          description: `Allocation for ${alloc.employee_name} - ${alloc.product} exceeds 100%`,
          variant: 'destructive',
        });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateAllocations()) {
      return;
    }

    if (!podId) {
      toast({
        title: 'Error',
        description: 'Pod ID is missing',
        variant: 'destructive',
      });
      return;
    }

    const submissionData = localAllocations.map((alloc) => ({
      employee_id: alloc.employee_id,
      product: alloc.product,
      product_description: alloc.product_description,
      academy_percent: alloc.academy_percent,
      intensive_percent: alloc.intensive_percent,
      niat_percent: alloc.niat_percent,
      is_verified_description: alloc.is_verified_description,
    }));

    submitMutation.mutate(
      {
        month,
        allocations: submissionData,
      },
      {
        onSuccess: () => {
          navigate('/pod-lead/allocations');
        },
      }
    );
  };

  if (!podId) {
    return (
      <div className="min-h-screen bg-background">
        <Header currentMonth={month} onMonthChange={() => {}} currentRole="PodLead" />
        <div className="container py-8">
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
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-destructive font-semibold">Failed to load allocations</p>
              <p className="text-sm text-muted-foreground">
                Please try again or contact support.
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (localAllocations.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header currentMonth={month} onMonthChange={() => {}} currentRole="PodLead" />
        <div className="container py-8">
          <Card className="p-6">
            <div className="text-center">
              <p className="text-muted-foreground">
                No editable allocations found. All allocations may have been processed.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate('/pod-lead/allocations')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Allocations
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const hasInvalidAllocations = localAllocations.some((alloc) => {
    const total = alloc.academy_percent + alloc.intensive_percent + alloc.niat_percent;
    return total > 100;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header currentMonth={month} onMonthChange={setMonth} currentRole="PodLead" />
      <div className="container space-y-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Edit Allocations</h2>
            <p className="text-muted-foreground">
              Update percentages for Academy, Intensive, and NIAT products
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/pod-lead/allocations')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={hasInvalidAllocations || submitMutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {submitMutation.isPending ? 'Submitting...' : 'Submit Allocations'}
            </Button>
          </div>
        </div>

        {/* Validation Warning */}
        {hasInvalidAllocations && (
          <Card className="border-destructive bg-destructive/10 p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold">Validation Error</p>
                <p className="text-sm">
                  Some allocations have percentages that exceed 100%. Please correct them before
                  submitting.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Instructions */}
        <Card className="p-6">
          <h3 className="mb-2 font-semibold">Instructions</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Enter percentages for Academy, Intensive, and NIAT for each allocation</li>
            <li>The sum of percentages must not exceed 100%</li>
            <li>Check the "Verified" checkbox to confirm the product description is accurate</li>
            <li>Click "Submit Allocations" when you're done</li>
          </ul>
        </Card>

        {/* Allocations Table */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Allocations</h3>
          <AllocationTable
            allocations={localAllocations}
            editable
            onAllocationChange={handleAllocationChange}
          />
        </Card>
      </div>
    </div>
  );
}

