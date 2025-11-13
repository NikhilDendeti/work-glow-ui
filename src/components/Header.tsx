import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Role } from '@/types';

interface HeaderProps {
  currentMonth: string;
  onMonthChange: (month: string) => void;
  currentRole: Role;
  onRoleChange: (role: Role) => void;
}

export function Header({ currentMonth, onMonthChange, currentRole, onRoleChange }: HeaderProps) {
  const [date, setDate] = useState(new Date(currentMonth + '-01'));

  const formatMonth = (dateStr: string) => {
    const d = new Date(dateStr + '-01');
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    const d = new Date(date);
    if (direction === 'prev') {
      d.setMonth(d.getMonth() - 1);
    } else {
      d.setMonth(d.getMonth() + 1);
    }
    setDate(d);
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    onMonthChange(monthStr);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">O</span>
          </div>
          <h1 className="text-xl font-bold">OrgContributions</h1>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => changeMonth('prev')}
            className="h-9 w-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="min-w-[200px] justify-start gap-2">
                <Calendar className="h-4 w-4" />
                {formatMonth(currentMonth)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="center">
              <div className="text-sm text-muted-foreground">
                Month selector calendar would go here
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => changeMonth('next')}
            className="h-9 w-9"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Role Selector */}
        <div className="flex items-center gap-3">
          <Select value={currentRole} onValueChange={(value) => onRoleChange(value as Role)}>
            <SelectTrigger className="w-[140px]">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CEO">CEO</SelectItem>
              <SelectItem value="HOD">HOD</SelectItem>
              <SelectItem value="PodLead">Pod Lead</SelectItem>
              <SelectItem value="Employee">Employee</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
}
