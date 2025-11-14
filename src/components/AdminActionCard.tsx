import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'outline';
  disabled?: boolean;
}

export function AdminActionCard({
  title,
  description,
  icon: Icon,
  onClick,
  variant = 'default',
  disabled = false,
}: AdminActionCardProps) {
  return (
    <Card
      className={cn(
        'card-hover cursor-pointer p-6 bg-gradient-to-br from-card via-card to-primary/5 border-primary/10 hover:border-primary/30 fade-in stagger-item',
        disabled && 'opacity-50 cursor-not-allowed hover:transform-none'
      )}
      onClick={disabled ? undefined : onClick}
    >
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 p-3 shadow-sm">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          <Button
            variant={variant}
            className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled) onClick();
            }}
          >
            Open
          </Button>
        </div>
      </div>
    </Card>
  );
}

