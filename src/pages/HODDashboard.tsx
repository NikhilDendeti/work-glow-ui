import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Upload } from 'lucide-react';
import { useDepartmentDashboard } from '@/hooks/api/useDashboards';
import { useAuth } from '@/hooks/useAuth';
import { useUploadCSV } from '@/hooks/api/useUploads';
import { Product } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const productColors: Record<Product, string> = {
  Academy: 'bg-academy',
  Intensive: 'bg-intensive',
  NIAT: 'bg-niat',
};

interface HODDashboardProps {
  month: string;
}

export default function HODDashboard({ month }: HODDashboardProps) {
  const { user } = useAuth();
  const deptId = user?.department_id;
  
  // Debug logging
  console.log('HODDashboard - User:', user);
  console.log('HODDashboard - Department ID:', deptId);
  console.log('HODDashboard - Month:', month);
  
  const { data, isLoading, isError, error } = useDepartmentDashboard(deptId, month);
  const uploadMutation = useUploadCSV();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  // Show error if department_id is missing
  if (!deptId) {
    return (
      <div className="container py-8">
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-destructive font-semibold">Department ID Missing</p>
            <p className="text-sm text-muted-foreground">
              Unable to load department dashboard. Department ID is required but not found in user profile.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              User: {user?.employee_code} | Role: {user?.role}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container space-y-8 py-8">
        <div className="space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-24 w-full" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    toast({
      title: 'Error loading dashboard',
      description: error instanceof Error ? error.message : 'Failed to load department data',
      variant: 'destructive',
    });
    return (
      <div className="container py-8">
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-destructive font-semibold">Failed to load dashboard data</p>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'Please try again or contact support.'}
            </p>
            {error instanceof Error && error.message.includes('403') && (
              <p className="text-xs text-muted-foreground mt-2">
                Access denied. You may not have permission to view this department.
              </p>
            )}
          </div>
        </Card>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="container space-y-8 py-8">
      {/* Department Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{data.department_name} Department</h2>
          <p className="text-muted-foreground">Manage pods and upload contributions</p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            className="gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
          >
            <Upload className="h-4 w-4" />
            {uploadMutation.isPending ? 'Uploading...' : 'Upload CSV'}
          </Button>
        </div>
      </div>

      {/* Department Stats */}
      <Card className="p-6">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold">{data.total_hours.toLocaleString()}</span>
          <span className="text-lg text-muted-foreground">total hours</span>
        </div>
      </Card>

      {/* Pods List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Pods</h3>
        <div className="grid gap-4">
          {data.pods.map((pod) => {
            const total = pod.total_hours;
            return (
              <Card key={pod.pod_id} className="card-hover group p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold">{pod.pod_name}</h4>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">{pod.total_hours.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground">hrs</span>
                      </div>
                    </div>

                    {/* Product breakdown mini-bars */}
                    <div className="space-y-2">
                      {pod.products.map((product) => {
                        const percent = total > 0 ? (product.hours / total) * 100 : 0;
                        return (
                          <div key={product.product_id} className="flex items-center gap-3">
                            <span className="w-20 text-sm text-muted-foreground">
                              {product.product_name}
                            </span>
                            <div className="flex-1">
                              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                                <div
                                  className={`h-full rounded-full ${
                                    productColors[product.product_name as Product] || 'bg-primary'
                                  }`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                            <span className="w-16 text-right text-sm font-medium">
                              {product.hours.toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-4 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => navigate(`/pod/${pod.pod_id}`)}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
