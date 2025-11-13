import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useEmployeeContributions } from '@/hooks/api/useDashboards';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Product } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface EmployeeDashboardProps {
  month: string;
}

const productColors: Record<Product, string> = {
  Academy: 'bg-academy',
  Intensive: 'bg-intensive',
  NIAT: 'bg-niat',
};

export default function EmployeeDashboard({ month }: EmployeeDashboardProps) {
  const { user } = useAuth();
  const employeeId = user?.employee_id;
  
  // Debug logging
  console.log('EmployeeDashboard - User object:', user);
  console.log('EmployeeDashboard - Employee ID:', employeeId);
  console.log('EmployeeDashboard - Employee Code:', user?.employee_code);
  console.log('EmployeeDashboard - Month:', month);
  console.log('EmployeeDashboard - Will call: GET /api/employees/' + employeeId + '/contributions/?month=' + month);
  
  const { data, isLoading, isError, error } = useEmployeeContributions(employeeId, month);
  
  // Log API response
  if (data) {
    console.log('EmployeeDashboard - API Response:', data);
    console.log('EmployeeDashboard - Total Hours:', data.total_hours);
    console.log('EmployeeDashboard - Products count:', data.products?.length || 0);
    console.log('EmployeeDashboard - Features count:', data.features?.length || 0);
  }

  // Show error if employee_id is missing
  if (!employeeId) {
    return (
      <div className="container py-8">
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-destructive font-semibold">Employee ID Missing</p>
            <p className="text-sm text-muted-foreground">
              Unable to load employee contributions. Employee ID is required but not found in user profile.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              User: {user?.employee_code} | Role: {user?.role} | Employee ID: {employeeId || 'Not found'}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container space-y-8 py-8">
        <Skeleton className="h-12 w-64" />
        <Card className="p-6">
          <Skeleton className="h-64 w-full" />
        </Card>
      </div>
    );
  }

  if (isError) {
    toast({
      title: 'Error loading contributions',
      description: error instanceof Error ? error.message : 'Failed to load employee contributions',
      variant: 'destructive',
    });
    return (
      <div className="container py-8">
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-destructive font-semibold">Failed to load contributions</p>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'Please try again or contact support.'}
            </p>
            {error instanceof Error && error.message.includes('403') && (
              <p className="text-xs text-muted-foreground mt-2">
                Access denied. You may not have permission to view this data.
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

  const totalHours = data.total_hours || 0;

  return (
    <div className="container space-y-8 py-8">
      {/* Employee Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Contributions</h2>
        <p className="text-muted-foreground">
          {data.employee_name} ({data.employee_code}) - {month}
        </p>
      </div>

      {/* Total Hours Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
            <p className="text-3xl font-bold">{totalHours.toLocaleString()}</p>
          </div>
        </div>
      </Card>

      {/* Product Summary */}
      {data.products && data.products.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Product Breakdown</h3>
          <div className="space-y-4">
            {data.products.map((product) => {
              // Use percent from API response, or calculate if missing
              const percent = product.percent !== undefined ? product.percent : (totalHours > 0 ? (product.hours / totalHours) * 100 : 0);
              return (
                <div key={product.product_id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{product.product_name}</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-semibold">{product.hours.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground">hrs</span>
                      <span className="text-sm text-muted-foreground">({percent.toFixed(2)}%)</span>
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full rounded-full ${
                        productColors[product.product_name as Product] || 'bg-primary'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Features/Contributions Table */}
      {data.features && data.features.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Feature Contributions</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Hours</TableHead>
                <TableHead className="text-right">Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.features.map((feature) => {
                // Use percent from API response, or calculate if missing
                const percent = feature.percent !== undefined ? feature.percent : (totalHours > 0 ? (feature.hours / totalHours) * 100 : 0);
                return (
                  <TableRow key={feature.feature_id}>
                    <TableCell className="font-medium">{feature.feature_name}</TableCell>
                    <TableCell className="text-muted-foreground">{feature.description || '-'}</TableCell>
                    <TableCell className="text-right font-medium">{feature.hours.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{percent.toFixed(2)}%</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Empty State */}
      {(!data.features || data.features.length === 0) && (
        <Card className="p-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">No contributions found for this month.</p>
          </div>
        </Card>
      )}
    </div>
  );
}

