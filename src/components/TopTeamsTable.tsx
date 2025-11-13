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

interface TeamData {
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
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Top Teams</h3>
        <p className="text-sm text-muted-foreground">Highest contributing pods this month</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Department</TableHead>
            <TableHead>Pod</TableHead>
            <TableHead className="text-right">Hours</TableHead>
            <TableHead className="text-right">% of Total</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team, idx) => (
            <TableRow key={idx} className="group">
              <TableCell className="font-medium">{team.department}</TableCell>
              <TableCell>{team.pod}</TableCell>
              <TableCell className="text-right font-mono">
                {team.hours.toLocaleString()}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {team.percent.toFixed(1)}%
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDrill?.(team)}
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
