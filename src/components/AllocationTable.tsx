import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PodLeadAllocation, AllocationStatus } from '@/lib/api/types';
import { cn } from '@/lib/utils';

interface AllocationTableProps {
  allocations: PodLeadAllocation[];
  editable?: boolean;
  onAllocationChange?: (
    id: number,
    field: 'academy_percent' | 'intensive_percent' | 'niat_percent' | 'is_verified_description',
    value: number | boolean
  ) => void;
}

const statusColors: Record<AllocationStatus, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  SUBMITTED: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  PROCESSED: 'bg-green-500/10 text-green-700 dark:text-green-400',
};

export function AllocationTable({
  allocations,
  editable = false,
  onAllocationChange,
}: AllocationTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Academy %</TableHead>
            <TableHead className="text-right">Intensive %</TableHead>
            <TableHead className="text-right">NIAT %</TableHead>
            <TableHead className="text-right">Total %</TableHead>
            <TableHead>Status</TableHead>
            {editable && <TableHead>Verified</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {allocations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={editable ? 9 : 8} className="text-center text-muted-foreground">
                No allocations found
              </TableCell>
            </TableRow>
          ) : (
            allocations.map((allocation) => {
              const totalPercent =
                allocation.academy_percent +
                allocation.intensive_percent +
                allocation.niat_percent;
              const isValid = totalPercent <= 100;

              return (
                <TableRow key={allocation.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{allocation.employee_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {allocation.employee_code}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{allocation.product}</TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={allocation.product_description}>
                      {allocation.product_description}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {editable ? (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={allocation.academy_percent}
                        onChange={(e) =>
                          onAllocationChange?.(
                            allocation.id,
                            'academy_percent',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-20 rounded border px-2 py-1 text-right"
                        disabled={allocation.status === 'PROCESSED'}
                      />
                    ) : (
                      <span className="font-mono">{allocation.academy_percent.toFixed(1)}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editable ? (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={allocation.intensive_percent}
                        onChange={(e) =>
                          onAllocationChange?.(
                            allocation.id,
                            'intensive_percent',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-20 rounded border px-2 py-1 text-right"
                        disabled={allocation.status === 'PROCESSED'}
                      />
                    ) : (
                      <span className="font-mono">{allocation.intensive_percent.toFixed(1)}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editable ? (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={allocation.niat_percent}
                        onChange={(e) =>
                          onAllocationChange?.(
                            allocation.id,
                            'niat_percent',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-20 rounded border px-2 py-1 text-right"
                        disabled={allocation.status === 'PROCESSED'}
                      />
                    ) : (
                      <span className="font-mono">{allocation.niat_percent.toFixed(1)}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        'font-mono font-semibold',
                        !isValid && 'text-destructive'
                      )}
                    >
                      {totalPercent.toFixed(1)}
                    </span>
                    {!isValid && editable && (
                      <div className="text-xs text-destructive">Exceeds 100%</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[allocation.status]}>
                      {allocation.status}
                    </Badge>
                  </TableCell>
                  {editable && (
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={allocation.is_verified_description}
                        onChange={(e) =>
                          onAllocationChange?.(
                            allocation.id,
                            'is_verified_description',
                            e.target.checked
                          )
                        }
                        disabled={allocation.status === 'PROCESSED'}
                        className="h-4 w-4"
                      />
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

