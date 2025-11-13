import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useLogout } from '@/hooks/api/useAuth';
import { Role } from '@/types';

interface HeaderProps {
  currentMonth: string;
  onMonthChange: (month: string) => void;
  currentRole: Role;
}

export function Header({ currentMonth, onMonthChange, currentRole }: HeaderProps) {
  const [date, setDate] = useState(new Date(currentMonth + '-01'));
  const { user } = useAuth();
  const logout = useLogout();

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

        {/* User Menu */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted">
            <span className="text-sm font-medium text-muted-foreground">Role:</span>
            <span className="text-sm font-semibold">{currentRole}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user?.employee_code || 'User'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.employee_code}</p>
                  <p className="text-xs text-muted-foreground">{currentRole}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
