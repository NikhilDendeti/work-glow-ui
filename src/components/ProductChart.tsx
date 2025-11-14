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

// Custom tooltip component with enhanced styling
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card/95 backdrop-blur-sm shadow-lg p-4 min-w-[200px]">
        <p className="font-semibold text-base mb-3 text-foreground border-b border-border pb-2">{label}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => {
            const productName = entry.dataKey as Product;
            const color = COLORS[productName] || entry.color;
            return (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-medium text-foreground">{entry.dataKey}</span>
                </div>
                <span className="text-sm font-bold" style={{ color }}>
                  {entry.value?.toLocaleString() || 0} hrs
                </span>
              </div>
            );
          })}
          <div className="pt-2 mt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Total</span>
              <span className="text-sm font-bold text-primary">
                {payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0).toLocaleString()} hrs
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Custom legend component
const CustomLegend = (props: any) => {
  const { payload } = props;
  return (
    <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
      {payload?.map((entry: any, index: number) => {
        const productName = entry.value as Product;
        const color = COLORS[productName] || entry.color;
        return (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded" 
              style={{ backgroundColor: color }}
            />
            <span className="text-sm font-medium text-foreground">{entry.value}</span>
          </div>
        );
      })}
    </div>
  );
};

export function ProductChart({ data }: ProductChartProps) {
  return (
    <Card className="p-6 card-hover fade-in bg-gradient-to-br from-card via-card to-primary/5 border-primary/10 shadow-lg">
      <div className="mb-6">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Department Breakdown
        </h3>
        <p className="text-sm text-muted-foreground mt-1">Hours by product across departments</p>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={550}>
        <BarChart 
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="hsl(var(--muted))" 
            opacity={0.3}
            vertical={false}
          />
          <XAxis 
            dataKey="department" 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 500 }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
            height={60}
            angle={-15}
            textAnchor="end"
          />
          <YAxis 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 500 }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
            width={80}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          <Bar 
            dataKey="Academy" 
            stackId="a" 
            fill={COLORS.Academy}
            radius={[0, 0, 0, 0]}
            isAnimationActive={true}
            animationBegin={0}
            animationDuration={1800}
            animationEasing="ease-out"
          />
          <Bar 
            dataKey="Intensive" 
            stackId="a" 
            fill={COLORS.Intensive}
            radius={[0, 0, 0, 0]}
            isAnimationActive={true}
            animationBegin={300}
            animationDuration={1800}
            animationEasing="ease-out"
          />
          <Bar 
            dataKey="NIAT" 
            stackId="a" 
            fill={COLORS.NIAT}
            radius={[4, 4, 0, 0]}
            isAnimationActive={true}
            animationBegin={600}
            animationDuration={1800}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
      </div>
    </Card>
  );
}
