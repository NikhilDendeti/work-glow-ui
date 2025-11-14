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
    <div className="container space-y-8 py-8 smooth-scroll">
      {/* Pod Header */}
      <div className="flex items-center justify-between fade-in">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">{data.pod_name}</h2>
          <p className="text-muted-foreground text-lg">Employee contributions breakdown</p>
        </div>
        <Button variant="outline" className="gap-2 shadow-sm" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Employees Table */}
      <Card className="overflow-hidden card-hover fade-in shadow-lg border-primary/10">
        <div className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-foreground">Employee Contributions</h3>
          <p className="text-sm text-muted-foreground mt-1">Click to expand and view feature details</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/40 border-b-2 border-primary/20">
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="font-semibold text-foreground">Employee</TableHead>
              <TableHead className="text-right font-semibold text-foreground">Total Hours</TableHead>
              <TableHead className="text-right font-semibold text-academy">Academy</TableHead>
              <TableHead className="text-right font-semibold text-intensive">Intensive</TableHead>
              <TableHead className="text-right font-semibold text-niat">NIAT</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee, index) => {
              const isExpanded = expandedRows.has(employee.employee_code);
              const totalHours = employee.total_hours;
              const academyHours = employee.by_product.Academy || 0;
              const intensiveHours = employee.by_product.Intensive || 0;
              const niatHours = employee.by_product.NIAT || 0;
              
              return (
                <Collapsible key={employee.employee_code} asChild open={isExpanded}>
                  <>
                    <TableRow 
                      className={cn(
                        "group transition-all duration-200 hover:bg-primary/5 border-b border-border/50",
                        isExpanded && "bg-primary/5",
                        "fade-in stagger-item"
                      )}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <TableCell>
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRow(employee.employee_code, employee.employee_id)}
                            className="h-8 w-8 p-0 hover:bg-primary/10 transition-all duration-200"
                          >
                            <ChevronDown
                              className={cn(
                                'h-4 w-4 transition-all duration-300 text-primary',
                                isExpanded && 'rotate-180'
                              )}
                            />
                          </Button>
                        </CollapsibleTrigger>
                      </TableCell>
                      <TableCell className="font-semibold text-base">{employee.name}</TableCell>
                      <TableCell className="text-right">
                        <span className="font-mono font-bold text-lg text-primary">
                          {employee.total_hours.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {academyHours > 0 ? (
                          <span className="font-mono font-semibold text-academy bg-academy-light/50 px-2 py-1 rounded">
                            {academyHours.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {intensiveHours > 0 ? (
                          <span className="font-mono font-semibold text-intensive bg-intensive-light/50 px-2 py-1 rounded">
                            {intensiveHours.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {niatHours > 0 ? (
                          <span className="font-mono font-semibold text-niat bg-niat-light/50 px-2 py-1 rounded">
                            {niatHours.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>

                    <CollapsibleContent asChild>
                      <TableRow>
                        <TableCell colSpan={6} className="bg-gradient-to-br from-muted/20 via-muted/10 to-transparent p-0 border-b border-border/50">
                          <div className="space-y-4 p-6">
                            <div className="flex items-center gap-2">
                              <div className="h-1 w-1 rounded-full bg-primary"></div>
                              <h4 className="text-sm font-semibold text-foreground">Feature Contributions</h4>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                              {employee.features.length > 0 ? (
                                employee.features.map((feature, idx) => {
                                  // Determine product type from description
                                  let productType: Product | null = null;
                                  let productColor = '';
                                  if (feature.description?.toLowerCase().includes('academy')) {
                                    productType = 'Academy';
                                    productColor = 'bg-academy-light border-academy/30 text-academy';
                                  } else if (feature.description?.toLowerCase().includes('intensive')) {
                                    productType = 'Intensive';
                                    productColor = 'bg-intensive-light border-intensive/30 text-intensive';
                                  } else if (feature.description?.toLowerCase().includes('niat')) {
                                    productType = 'NIAT';
                                    productColor = 'bg-niat-light border-niat/30 text-niat';
                                  }
                                  
                                  return (
                                    <div
                                      key={idx}
                                      className={cn(
                                        "flex flex-col gap-2 rounded-lg border p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
                                        productColor || "bg-card border-border/50",
                                        "fade-in stagger-item"
                                      )}
                                      style={{ animationDelay: `${idx * 0.05}s` }}
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                          <div className="font-semibold text-sm mb-1 truncate">{feature.name}</div>
                                          {feature.description && (
                                            <div className="text-xs text-muted-foreground line-clamp-2">
                                              {feature.description}
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex-shrink-0">
                                          <div className={cn(
                                            "font-mono text-base font-bold px-2 py-1 rounded",
                                            productType === 'Academy' && "bg-academy/10 text-academy",
                                            productType === 'Intensive' && "bg-intensive/10 text-intensive",
                                            productType === 'NIAT' && "bg-niat/10 text-niat",
                                            !productType && "bg-primary/10 text-primary"
                                          )}>
                                            {feature.hours}h
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="col-span-full">
                                  <div className="rounded-lg border border-dashed border-muted-foreground/30 p-6 text-center">
                                    <p className="text-sm text-muted-foreground">No features available</p>
                                  </div>
                                </div>
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
