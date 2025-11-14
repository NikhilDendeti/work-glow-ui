import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, FileCheck, AlertCircle } from 'lucide-react';
import { useProcessAllocations } from '@/hooks/api/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { toast } from '@/hooks/use-toast';

export default function ProcessAllocations() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [podId, setPodId] = useState<string>('');
  const [outputFormat, setOutputFormat] = useState<'records' | 'csv'>('records');
  const navigate = useNavigate();
  const { user } = useAuth();
  const processMutation = useProcessAllocations(podId ? parseInt(podId, 10) : undefined);

  // Determine current role for header
  const userRole = user?.role?.toLowerCase();
  const currentRole = userRole === 'ceo' ? 'CEO' : userRole === 'admin' || userRole === 'automation' ? 'Admin' : 'Admin';

  const handleBack = () => {
    // CEO goes back to main dashboard, Admin/Automation go to admin dashboard
    if (userRole === 'ceo') {
      navigate('/');
    } else {
      navigate('/admin');
    }
  };

  const handleProcess = () => {
    if (!podId) {
      toast({
        title: 'Pod ID required',
        description: 'Please enter a Pod ID',
        variant: 'destructive',
      });
      return;
    }

    if (!/^\d{4}-\d{2}$/.test(month)) {
      toast({
        title: 'Invalid month format',
        description: 'Please use YYYY-MM format',
        variant: 'destructive',
      });
      return;
    }

    processMutation.mutate({ month, outputFormat });
  };

  const processData = processMutation.data;

  return (
    <div className="min-h-screen bg-background smooth-scroll">
      <Header currentMonth={month} onMonthChange={setMonth} currentRole={currentRole} />
      <div className="container space-y-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between fade-in">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Process Allocations</h2>
            <p className="text-muted-foreground text-lg">
              Process submitted Pod Lead allocations into contribution records
            </p>
          </div>
          <Button variant="outline" onClick={handleBack} className="shadow-sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Process Form */}
        <Card className="p-6 card-hover fade-in">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Input
                id="month"
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="max-w-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="podId">Pod ID</Label>
              <Input
                id="podId"
                type="number"
                value={podId}
                onChange={(e) => setPodId(e.target.value)}
                placeholder="Enter Pod ID"
                className="max-w-xs"
              />
              <p className="text-xs text-muted-foreground">
                Enter the Pod ID whose allocations you want to process
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="outputFormat">Output Format</Label>
              <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as 'records' | 'csv')}>
                <SelectTrigger className="max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="records">Records (Default)</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose the output format for processed allocations
              </p>
            </div>

            <Button
              onClick={handleProcess}
              disabled={!podId || processMutation.isPending}
              className="gap-2"
            >
              <FileCheck className="h-4 w-4" />
              {processMutation.isPending ? 'Processing...' : 'Process Allocations'}
            </Button>
          </div>
        </Card>

        {/* Process Results */}
        {processData && (
          <Card className="p-6 card-hover bg-gradient-to-br from-success/10 via-success/5 to-transparent border-success/20 fade-in">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">Processing Complete</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Processed Count</p>
                  <p className="text-2xl font-bold">{processData.processed_count}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created Records</p>
                  <p className="text-2xl font-bold">{processData.created_records}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Output Format</p>
                  <p className="text-2xl font-bold">{processData.output_format}</p>
                </div>
              </div>
              <div className="rounded-lg bg-green-500/10 p-4">
                <p className="text-sm">{processData.message}</p>
              </div>
            </div>
          </Card>
        )}

        {processMutation.isError && (
          <Card className="border-destructive bg-destructive/10 p-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold">Processing Failed</p>
                <p className="text-sm">
                  {processMutation.error instanceof Error
                    ? processMutation.error.message
                    : 'An error occurred while processing allocations'}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

