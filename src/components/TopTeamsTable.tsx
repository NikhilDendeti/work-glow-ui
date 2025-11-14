import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TeamData {
  pod_id: number;
  department: string;
  pod: string;
  hours: number;
  percent: number;
}

interface TopTeamsTableProps {
  teams: TeamData[];
  onDrill?: (team: TeamData) => void;
}

export function TopTeamsTable({ teams, onDrill }: TopTeamsTableProps) {
  return (
    <Card className="p-6 card-hover fade-in bg-gradient-to-br from-card via-card to-primary/5 border-primary/10 shadow-md">
      <div className="mb-6">
        <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Top Teams
        </h3>
        <p className="text-sm text-muted-foreground mt-1">Highest contributing pods this month</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/40 border-b-2 border-primary/20">
            <TableHead className="font-semibold text-foreground">Department</TableHead>
            <TableHead className="font-semibold text-foreground">Pod</TableHead>
            <TableHead className="text-right font-semibold text-foreground">Hours</TableHead>
            <TableHead className="text-right font-semibold text-foreground">% of Total</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team, idx) => (
            <TableRow 
              key={team.pod_id} 
              className={cn(
                "group cursor-pointer transition-all duration-200 hover:bg-primary/5 fade-in stagger-item",
                onDrill && "hover:shadow-sm"
              )}
              style={{ animationDelay: `${idx * 0.05}s` }}
              onClick={() => onDrill?.(team)}
            >
              <TableCell className="font-medium">{team.department}</TableCell>
              <TableCell className="font-semibold">{team.pod}</TableCell>
              <TableCell className="text-right font-mono font-bold text-primary">
                {team.hours.toLocaleString()}
              </TableCell>
              <TableCell className="text-right font-semibold">
                <span className="px-2 py-1 rounded-md bg-primary/10 text-primary">
                  {team.percent.toFixed(1)}%
                </span>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDrill?.(team);
                  }}
                  className="opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-primary/15 hover:scale-110"
                >
                  <ArrowRight className="h-4 w-4 text-primary" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
