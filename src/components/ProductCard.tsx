import { Product } from '@/types';
import { Card } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  hours: number;
  percent: number;
  onClick?: () => void;
}

const productColors: Record<Product, { bg: string; text: string; gradient: string }> = {
  Academy: {
    bg: 'bg-academy-light',
    text: 'text-academy',
    gradient: 'gradient-academy',
  },
  Intensive: {
    bg: 'bg-intensive-light',
    text: 'text-intensive',
    gradient: 'gradient-intensive',
  },
  NIAT: {
    bg: 'bg-niat-light',
    text: 'text-niat',
    gradient: 'gradient-niat',
  },
};

export function ProductCard({ product, hours, percent, onClick }: ProductCardProps) {
  const colors = productColors[product];

  return (
    <Card
      className={cn(
        'card-hover cursor-pointer overflow-hidden p-6',
        onClick && 'hover:shadow-xl'
      )}
      onClick={onClick}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">{product}</h3>
          <div className={cn('rounded-lg p-2', colors.bg)}>
            <TrendingUp className={cn('h-4 w-4', colors.text)} />
          </div>
        </div>

        {/* Hours */}
        <div>
          <div className="number-large">{hours.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">total hours</div>
        </div>

        {/* Percentage Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">of total</span>
            <span className={cn('font-semibold', colors.text)}>{percent.toFixed(1)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className={cn('h-full rounded-full transition-all duration-500', colors.gradient)}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
