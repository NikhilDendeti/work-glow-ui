import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, Download } from 'lucide-react';
import { mockPodData } from '@/lib/mockData';
import { cn } from '@/lib/utils';

export default function PodView() {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (employeeCode: string) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(employeeCode)) {
      newSet.delete(employeeCode);
    } else {
      newSet.add(employeeCode);
    }
    setExpandedRows(newSet);
  };

  return (
    <div className="container space-y-8 py-8">
      {/* Pod Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{mockPodData.pod_name}</h2>
          <p className="text-muted-foreground">Employee contributions breakdown</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Employees Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead>Employee</TableHead>
              <TableHead className="text-right">Total Hours</TableHead>
              <TableHead className="text-right">Academy</TableHead>
              <TableHead className="text-right">Intensive</TableHead>
              <TableHead className="text-right">NIAT</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockPodData.employees.map((employee) => {
              const isExpanded = expandedRows.has(employee.employee_code);
              return (
                <Collapsible key={employee.employee_code} asChild open={isExpanded}>
                  <>
                    <TableRow className="group">
                      <TableCell>
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRow(employee.employee_code)}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronDown
                              className={cn(
                                'h-4 w-4 transition-transform',
                                isExpanded && 'rotate-180'
                              )}
                            />
                          </Button>
                        </CollapsibleTrigger>
                      </TableCell>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {employee.total_hours}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {employee.by_product.Academy || '-'}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {employee.by_product.Intensive || '-'}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {employee.by_product.NIAT || '-'}
                      </TableCell>
                    </TableRow>

                    <CollapsibleContent asChild>
                      <TableRow>
                        <TableCell colSpan={6} className="bg-muted/30 p-0">
                          <div className="space-y-2 p-4">
                            <h4 className="text-sm font-semibold">Features</h4>
                            <div className="space-y-2">
                              {employee.features.map((feature, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-start gap-4 rounded-lg border bg-card p-3"
                                >
                                  <div className="flex-1">
                                    <div className="font-medium">{feature.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {feature.description}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-mono text-sm font-semibold">
                                      {feature.hours}h
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    </CollapsibleContent>
                  </>
                </Collapsible>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
