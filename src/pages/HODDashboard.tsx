import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Upload } from 'lucide-react';
import { mockDepartmentData } from '@/lib/mockData';
import { Product } from '@/types';

const productColors: Record<Product, string> = {
  Academy: 'bg-academy',
  Intensive: 'bg-intensive',
  NIAT: 'bg-niat',
};

export default function HODDashboard() {
  return (
    <div className="container space-y-8 py-8">
      {/* Department Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{mockDepartmentData.department} Department</h2>
          <p className="text-muted-foreground">Manage pods and upload contributions</p>
        </div>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Upload CSV
        </Button>
      </div>

      {/* Department Stats */}
      <Card className="p-6">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold">{mockDepartmentData.total_hours.toLocaleString()}</span>
          <span className="text-lg text-muted-foreground">total hours</span>
        </div>
      </Card>

      {/* Pods List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Pods</h3>
        <div className="grid gap-4">
          {mockDepartmentData.pods.map((pod) => {
            const total = pod.hours;
            return (
              <Card key={pod.pod_id} className="card-hover group p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold">{pod.pod_name}</h4>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">{pod.hours.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground">hrs</span>
                      </div>
                    </div>

                    {/* Product breakdown mini-bars */}
                    <div className="space-y-2">
                      {Object.entries(pod.by_product).map(([product, hours]) => {
                        const percent = (hours / total) * 100;
                        return (
                          <div key={product} className="flex items-center gap-3">
                            <span className="w-20 text-sm text-muted-foreground">{product}</span>
                            <div className="flex-1">
                              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                                <div
                                  className={`h-full rounded-full ${productColors[product as Product]}`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                            <span className="w-16 text-right text-sm font-medium">
                              {hours.toLocaleString()}
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
