import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, Download } from 'lucide-react';
import { usePodContributions } from '@/hooks/api/useDashboards';
import { useEmployeeContributions } from '@/hooks/api/useDashboards';
import { useDownloadFile } from '@/hooks/api/useUploads';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Product } from '@/types';

interface PodViewProps {
  month?: string;
}

export default function PodView({ month: monthProp }: PodViewProps) {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  // Get podId priority:
  // 1. URL params (when navigating from HOD dashboard via /pod/:id)
  // 2. user.pod_id from /api/me/ (when Pod Lead logs in directly)
  // Note: Always use pod_id from /api/me/ - never hardcode
  const podIdFromUrl = id ? parseInt(id, 10) : undefined;
  const podIdFromUser = user?.pod_id; // This comes from /api/me/ after login
  const podId = podIdFromUrl || podIdFromUser;
  
  // Debug logging
  console.log('PodView - User:', user);
  console.log('PodView - podIdFromUrl (from route):', podIdFromUrl);
  console.log('PodView - podIdFromUser (from /api/me/):', podIdFromUser);
  console.log('PodView - Final podId:', podId);
  
  if (!podId && user?.role === 'PodLead') {
    console.error('PodView - Pod Lead missing pod_id! User should have pod_id from /api/me/');
  }
  
  // Get month from prop, URL query param, or default to current month
  const [searchParams] = useSearchParams();
  const monthFromUrl = searchParams.get('month');
  const month = monthProp || monthFromUrl || new Date().toISOString().slice(0, 7); // Default to current month YYYY-MM
  
  // Validate month format - must be YYYY-MM
  const isValidMonth = /^\d{4}-\d{2}$/.test(month);
  const validMonth = isValidMonth ? month : new Date().toISOString().slice(0, 7);
  
  // Log warning if invalid month format
  if (!isValidMonth && month !== validMonth) {
    console.warn(`Invalid month format: "${month}". Using default: "${validMonth}"`);
  }
  
  const { data, isLoading, isError, error } = usePodContributions(podId, validMonth);
  const downloadMutation = useDownloadFile();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [employeeFeatures, setEmployeeFeatures] = useState<
    Record<number, Array<{ name: string; hours: number; description: string }>>
  >({});

  const toggleRow = async (employeeCode: string, employeeId: number) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(employeeCode)) {
      newSet.delete(employeeCode);
      setExpandedRows(newSet);
    } else {
      newSet.add(employeeCode);
      setExpandedRows(newSet);

      // Fetch employee details if not already loaded
      if (!employeeFeatures[employeeId]) {
        try {
          const { dashboardApi } = await import('@/lib/api/dashboards');
          const empData = await dashboardApi.getEmployeeContributions(employeeId, validMonth);
          setEmployeeFeatures((prev) => ({
            ...prev,
            [employeeId]: empData.features.map((f) => ({
              name: f.feature_name,
              hours: f.hours,
              description: f.description || '',
            })),
          }));
        } catch (err) {
          toast({
            title: 'Error loading features',
            description: 'Failed to load employee features',
            variant: 'destructive',
          });
        }
      }
    }
  };

  const handleExport = () => {
    // For now, we'll need to implement a proper export endpoint
    // This is a placeholder
    toast({
      title: 'Export',
      description: 'Export functionality will be available soon',
    });
  };

  // Show error if podId is missing
  if (!podId) {
    return (
      <div className="container py-8">
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-destructive font-semibold">Pod ID Missing</p>
            <p className="text-sm text-muted-foreground">
              Unable to load pod contributions. Pod ID is required but not found.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              User: {user?.employee_code} | Role: {user?.role} | Pod ID: {podId || 'Not found'}
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
      title: 'Error loading pod data',
      description: error instanceof Error ? error.message : 'Failed to load pod contributions',
      variant: 'destructive',
    });
    return (
      <div className="container py-8">
        <Card className="p-6">
          <p className="text-destructive">Failed to load pod data. Please try again.</p>
        </Card>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Transform API response to component format
  const employees = data.employees.map((emp) => {
    const byProduct: Partial<Record<Product, number>> = {};
    emp.products.forEach((p) => {
      byProduct[p.product_name as Product] = p.hours;
    });

    return {
      employee_code: emp.employee_code,
      employee_id: emp.employee_id,
      name: emp.employee_name,
      total_hours: emp.total_hours,
      by_product: byProduct,
      features: employeeFeatures[emp.employee_id] || [],
    };
  });

  return (
    <div className="container space-y-8 py-8">
      {/* Pod Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{data.pod_name}</h2>
          <p className="text-muted-foreground">Employee contributions breakdown</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Employees Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead>Employee</TableHead>
              <TableHead className="text-right">Total Hours</TableHead>
              <TableHead className="text-right">Academy</TableHead>
              <TableHead className="text-right">Intensive</TableHead>
              <TableHead className="text-right">NIAT</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => {
              const isExpanded = expandedRows.has(employee.employee_code);
              return (
                <Collapsible key={employee.employee_code} asChild open={isExpanded}>
                  <>
                    <TableRow className="group">
                      <TableCell>
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRow(employee.employee_code, employee.employee_id)}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronDown
                              className={cn(
                                'h-4 w-4 transition-transform',
                                isExpanded && 'rotate-180'
                              )}
                            />
                          </Button>
                        </CollapsibleTrigger>
                      </TableCell>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {employee.total_hours}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {employee.by_product.Academy || '-'}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {employee.by_product.Intensive || '-'}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {employee.by_product.NIAT || '-'}
                      </TableCell>
                    </TableRow>

                    <CollapsibleContent asChild>
                      <TableRow>
                        <TableCell colSpan={6} className="bg-muted/30 p-0">
                          <div className="space-y-2 p-4">
                            <h4 className="text-sm font-semibold">Features</h4>
                            <div className="space-y-2">
                              {employee.features.length > 0 ? (
                                employee.features.map((feature, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-start gap-4 rounded-lg border bg-card p-3"
                                  >
                                    <div className="flex-1">
                                      <div className="font-medium">{feature.name}</div>
                                      {feature.description && (
                                        <div className="text-sm text-muted-foreground">
                                          {feature.description}
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <div className="font-mono text-sm font-semibold">
                                        {feature.hours}h
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-muted-foreground">No features available</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    </CollapsibleContent>
                  </>
                </Collapsible>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
