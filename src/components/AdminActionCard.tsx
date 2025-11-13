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
        'card-hover cursor-pointer p-6 transition-all',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      onClick={disabled ? undefined : onClick}
    >
      <div className="flex items-start gap-4">
        <div className="rounded-lg bg-primary/10 p-3">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          <Button
            variant={variant}
            className="mt-4"
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

