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
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';

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
  const queryClient = useQueryClient();
  
  // Debug logging
  console.log('HODDashboard - User:', user);
  console.log('HODDashboard - Department ID:', deptId);
  console.log('HODDashboard - Month:', month);
  
  const { data, isLoading, isError, error } = useDepartmentDashboard(deptId, month);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Extract month from filename (e.g., "organization_contributions_2025-10.xlsx" -> "2025-10")
  const extractMonthFromFilename = (filename: string): string | null => {
    // Pattern: organization_contributions_YYYY-MM.xlsx or similar
    const match = filename.match(/(\d{4}-\d{2})/);
    return match ? match[1] : null;
  };

  // Handle successful upload - refetch dashboard with extracted month
  const handleUploadSuccess = async (uploadData: any, file: File) => {
    const extractedMonth = extractMonthFromFilename(file.name);
    
    if (!deptId) {
      return;
    }

    if (extractedMonth) {
      // Invalidate and refetch the department dashboard for the extracted month
      await queryClient.invalidateQueries({ 
        queryKey: ['departmentDashboard', deptId, extractedMonth] 
      });
      
      // If the extracted month matches the current month, also refetch the current dashboard
      if (extractedMonth === month) {
        await queryClient.refetchQueries({ 
          queryKey: ['departmentDashboard', deptId, month] 
        });
      }
      
      toast({
        title: 'Dashboard updated',
        description: `Refreshing dashboard for ${extractedMonth}`,
      });
    } else {
      // If month extraction fails, refetch current month dashboard
      await queryClient.invalidateQueries({ 
        queryKey: ['departmentDashboard', deptId, month] 
      });
      await queryClient.refetchQueries({ 
        queryKey: ['departmentDashboard', deptId, month] 
      });
      
      toast({
        title: 'Upload successful',
        description: 'Refreshing dashboard...',
      });
    }
  };

  const uploadMutation = useUploadCSV(handleUploadSuccess);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
    // Reset input to allow re-uploading the same file
    e.target.value = '';
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
    <div className="container space-y-8 py-8 smooth-scroll">
      {/* Department Header */}
      <div className="flex items-center justify-between fade-in">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">{data.department_name} Department</h2>
          <p className="text-muted-foreground text-lg">Manage pods and upload contributions</p>
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
            className="gap-2 shadow-md"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
          >
            <Upload className="h-4 w-4" />
            {uploadMutation.isPending ? 'Uploading...' : 'Upload CSV'}
          </Button>
        </div>
      </div>

      {/* Department Stats */}
      <Card className="p-8 card-hover bg-gradient-to-br from-primary/8 via-primary/4 to-transparent border-primary/15 fade-in shadow-md">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Department Hours</p>
            <div className="flex items-baseline gap-3">
              <span className="text-6xl font-bold bg-gradient-to-br from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                {data.total_hours.toLocaleString()}
              </span>
              <span className="text-xl text-muted-foreground font-medium">hours</span>
            </div>
          </div>
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            <span className="text-4xl">📊</span>
          </div>
        </div>
      </Card>

      {/* Pods List */}
      <div className="space-y-6 fade-in">
        <div className="flex items-center justify-between pb-2 border-b border-border/50">
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Pods
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {data.pods.length} pod{data.pods.length !== 1 ? 's' : ''} in department
            </p>
          </div>
        </div>
        <div className="grid gap-5">
          {data.pods.map((pod, index) => {
            const total = pod.total_hours;
            // Sort products by hours (descending) for better visual hierarchy
            const sortedProducts = [...pod.products].sort((a, b) => b.hours - a.hours);
            
            return (
              <Card 
                key={pod.pod_id} 
                className="card-hover group p-7 bg-gradient-to-br from-card via-card/95 to-muted/20 border-border/60 hover:border-primary/30 fade-in stagger-item shadow-sm" 
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 space-y-5 min-w-0">
                    {/* Pod Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="text-2xl font-bold text-foreground truncate">{pod.pod_name}</h4>
                          <span className="px-2.5 py-0.5 rounded-md bg-muted text-xs font-medium text-muted-foreground whitespace-nowrap">
                            ID: {pod.pod_id}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span className="text-4xl font-bold bg-gradient-to-br from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                          {pod.total_hours.toLocaleString()}
                        </span>
                        <span className="text-sm text-muted-foreground font-medium">total hours</span>
                      </div>
                    </div>

                    {/* Product breakdown - Enhanced */}
                    <div className="space-y-4 pt-4 border-t border-border/40">
                      {sortedProducts.map((product, prodIndex) => {
                        const percent = total > 0 ? (product.hours / total) * 100 : 0;
                        const productColor = productColors[product.product_name as Product] || 'bg-primary';
                        const productTextColor = product.product_name === 'Academy' ? 'text-academy' : 
                                                product.product_name === 'Intensive' ? 'text-intensive' : 
                                                product.product_name === 'NIAT' ? 'text-niat' : 'text-primary';
                        const productBgColor = product.product_name === 'Academy' ? 'bg-academy-light/40' : 
                                              product.product_name === 'Intensive' ? 'bg-intensive-light/40' : 
                                              product.product_name === 'NIAT' ? 'bg-niat-light/40' : 'bg-primary/10';
                        
                        return (
                          <div 
                            key={product.product_id} 
                            className="space-y-2 fade-in stagger-item"
                            style={{ animationDelay: `${prodIndex * 0.05}s` }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={cn("h-2.5 w-2.5 rounded-full", productColor)} />
                                <span className={cn("text-sm font-semibold", productTextColor)}>
                                  {product.product_name}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={cn("text-base font-bold tabular-nums", productTextColor)}>
                                  {product.hours.toLocaleString()}
                                </span>
                                <span className={cn(
                                  "px-2.5 py-1 rounded-md text-xs font-semibold tabular-nums",
                                  productBgColor,
                                  productTextColor
                                )}>
                                  {percent.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            <div className="relative">
                              <div className="h-3 overflow-hidden rounded-full bg-muted/50 shadow-inner">
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all duration-700 ease-out shadow-sm",
                                    productColor
                                  )}
                                  style={{ 
                                    width: `${percent}%`,
                                    transitionDelay: `${prodIndex * 0.1}s`
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 mt-1 opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-primary/15 hover:scale-110 hover:shadow-md flex-shrink-0"
                    onClick={() => navigate(`/pod/${pod.pod_id}?month=${month}`)}
                  >
                    <ArrowRight className="h-5 w-5 text-primary" />
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
