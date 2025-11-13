import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Product } from '@/types';

interface ProductChartProps {
  data: Array<{
    department: string;
    Academy: number;
    Intensive: number;
    NIAT: number;
  }>;
}

const COLORS: Record<Product, string> = {
  Academy: 'hsl(var(--academy))',
  Intensive: 'hsl(var(--intensive))',
  NIAT: 'hsl(var(--niat))',
};

export function ProductChart({ data }: ProductChartProps) {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Department Breakdown</h3>
        <p className="text-sm text-muted-foreground">Hours by product across departments</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="department" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Bar dataKey="Academy" stackId="a" fill={COLORS.Academy} radius={[0, 0, 0, 0]} />
          <Bar dataKey="Intensive" stackId="a" fill={COLORS.Intensive} radius={[0, 0, 0, 0]} />
          <Bar dataKey="NIAT" stackId="a" fill={COLORS.NIAT} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
