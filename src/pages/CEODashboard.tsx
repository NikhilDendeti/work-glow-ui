import { ProductCard } from '@/components/ProductCard';
import { TopTeamsTable } from '@/components/TopTeamsTable';
import { ProductChart } from '@/components/ProductChart';
import { mockOrgData, mockTopTeams } from '@/lib/mockData';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Mock chart data
const chartData = [
  { department: 'Tech', Academy: 2100, Intensive: 1200, NIAT: 700 },
  { department: 'Design', Academy: 1500, Intensive: 800, NIAT: 500 },
  { department: 'Product', Academy: 1200, Intensive: 1000, NIAT: 600 },
  { department: 'Marketing', Academy: 1200, Intensive: 1000, NIAT: 545 },
];

export default function CEODashboard() {
  const isLoading = false;

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

  return (
    <div className="container space-y-8 py-8">
      {/* Overview Stats */}
      <div>
        <div className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Organization Overview</h2>
          <p className="text-muted-foreground">Total contributions across all products</p>
        </div>

        <div className="mb-6 rounded-lg border bg-card p-6">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">{mockOrgData.total_hours.toLocaleString()}</span>
            <span className="text-xl text-muted-foreground">total hours</span>
          </div>
        </div>
      </div>

      {/* Product Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {mockOrgData.products.map((product) => (
          <ProductCard
            key={product.product}
            product={product.product}
            hours={product.hours}
            percent={product.percent}
            onClick={() => console.log('Product clicked:', product.product)}
          />
        ))}
      </div>

      {/* Charts & Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ProductChart data={chartData} />
        <TopTeamsTable
          teams={mockTopTeams}
          onDrill={(team) => console.log('Drill into:', team)}
        />
      </div>
    </div>
  );
}
