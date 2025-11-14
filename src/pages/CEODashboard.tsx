import { useNavigate } from 'react-router-dom';
import { ProductCard } from '@/components/ProductCard';
import { TopTeamsTable } from '@/components/TopTeamsTable';
import { ProductChart } from '@/components/ProductChart';
import { useOrgDashboard } from '@/hooks/api/useDashboards';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileCheck, FileText } from 'lucide-react';
import { Product } from '@/types';
import { toast } from '@/hooks/use-toast';

interface CEODashboardProps {
  month: string;
}

export default function CEODashboard({ month }: CEODashboardProps) {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useOrgDashboard(month);

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="space-y-8">
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-48" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    toast({
      title: 'Error loading dashboard',
      description: error instanceof Error ? error.message : 'Failed to load organization data',
      variant: 'destructive',
    });
    return (
      <div className="container py-8">
        <Card className="p-6">
          <p className="text-destructive">Failed to load dashboard data. Please try again.</p>
        </Card>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Transform API response to component props
  const productCards = data.products.map((p) => ({
    product: p.product_name as Product,
    hours: p.hours,
    percent: p.percent,
  }));

  // Transform top pods for table
  const topTeams = data.top_pods?.map((pod) => ({
    pod_id: pod.pod_id,
    department: pod.department_name || 'Unknown',
    pod: pod.pod_name,
    hours: pod.hours,
    percent: data.total_hours > 0 ? (pod.hours / data.total_hours) * 100 : 0,
  })) || [];

  // Handle pod drill-down navigation
  const handlePodDrill = (team: { pod_id: number; department: string; pod: string; hours: number; percent: number }) => {
    navigate(`/pod/${team.pod_id}?month=${month}`);
  };

  // Transform department_breakdown for chart
  // Use department_breakdown which includes product breakdown per department
  const chartData = data.department_breakdown?.map((dept) => {
    // Initialize product hours to 0
    const productHours: Record<Product, number> = {
      Academy: 0,
      Intensive: 0,
      NIAT: 0,
    };
    
    // Map product hours from API response
    dept.products.forEach((product) => {
      const productName = product.product_name as Product;
      if (productName in productHours) {
        productHours[productName] = product.hours;
      }
    });
    
    return {
      department: dept.department_name,
      Academy: productHours.Academy,
      Intensive: productHours.Intensive,
      NIAT: productHours.NIAT,
    };
  }) || [];

  return (
    <div className="container space-y-8 py-8 smooth-scroll">
      {/* Quick Actions */}
      <div className="flex gap-4 fade-in">
        <Button
          variant="outline"
          onClick={() => navigate('/admin/process-allocations')}
          className="gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/30 text-primary font-medium"
        >
          <FileCheck className="h-4 w-4" />
          Process Allocations
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/admin/final-master-list')}
          className="gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/30 text-primary font-medium"
        >
          <FileText className="h-4 w-4" />
          Final Master List
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="fade-in">
        <div className="mb-6 space-y-2">
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Organization Overview</h2>
          <p className="text-muted-foreground text-lg">Total contributions across all products</p>
        </div>

        <Card className="mb-6 p-8 card-hover bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
          <div className="flex items-baseline gap-3">
            <span className="text-6xl font-bold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">{data.total_hours.toLocaleString()}</span>
            <span className="text-xl text-muted-foreground font-medium">total hours</span>
          </div>
        </Card>
      </div>

      {/* Product Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {productCards.map((product, index) => (
          <div key={product.product} className="fade-in stagger-item" style={{ animationDelay: `${index * 0.1}s` }}>
            <ProductCard
              product={product.product}
              hours={product.hours}
              percent={product.percent}
              onClick={() => console.log('Product clicked:', product.product)}
            />
          </div>
        ))}
      </div>

      {/* Charts & Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {chartData.length > 0 && (
          <div className="lg:col-span-1">
            <ProductChart data={chartData} />
          </div>
        )}
        {topTeams.length > 0 && (
          <div className="lg:col-span-1">
            <TopTeamsTable
              teams={topTeams}
              onDrill={handlePodDrill}
            />
          </div>
        )}
      </div>
    </div>
  );
}
