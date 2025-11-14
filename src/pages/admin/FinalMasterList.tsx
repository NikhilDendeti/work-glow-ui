import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, ArrowLeft, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useFinalMasterList, useGenerateFinalMasterList, useDownloadFinalMasterList } from '@/hooks/api/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { toast } from '@/hooks/use-toast';

export default function FinalMasterList() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: masterList, isLoading, refetch } = useFinalMasterList(month);
  const generateMutation = useGenerateFinalMasterList();
  const downloadMutation = useDownloadFinalMasterList();

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

  const handleGenerate = () => {
    if (!/^\d{4}-\d{2}$/.test(month)) {
      toast({
        title: 'Invalid month format',
        description: 'Please use YYYY-MM format',
        variant: 'destructive',
      });
      return;
    }

    generateMutation.mutate(month, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const handleDownload = () => {
    downloadMutation.mutate(month);
  };

  return (
    <div className="min-h-screen bg-background smooth-scroll">
      <Header currentMonth={month} onMonthChange={setMonth} currentRole={currentRole} />
      <div className="container space-y-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between fade-in">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Final Master List</h2>
            <p className="text-muted-foreground text-lg">
              Generate and download the final master list for the selected month
            </p>
          </div>
          <Button variant="outline" onClick={handleBack} className="shadow-sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Month Selector */}
        <Card className="p-6 card-hover fade-in">
          <div className="space-y-4">
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
          </div>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card className="p-6">
            <Skeleton className="h-32 w-full" />
          </Card>
        )}

        {/* Master List Status */}
        {!isLoading && masterList && (
          <Card className="p-6 card-hover bg-gradient-to-br from-success/10 via-success/5 to-transparent border-success/20 fade-in">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">Master List Available</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Filename</p>
                  <p className="font-medium">{masterList.filename}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Month</p>
                  <p className="font-medium">{masterList.month}</p>
                </div>
              </div>
              <Button onClick={handleDownload} disabled={downloadMutation.isPending} className="gap-2">
                <Download className="h-4 w-4" />
                {downloadMutation.isPending ? 'Downloading...' : 'Download Master List'}
              </Button>
            </div>
          </Card>
        )}

        {/* No Master List */}
        {!isLoading && !masterList && (
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <h3 className="text-lg font-semibold">No Master List Found</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Generate a final master list for {month}. Make sure all Pod Leads have submitted
                their allocations before generating.
              </p>
              <Button
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                {generateMutation.isPending ? 'Generating...' : 'Generate Master List'}
              </Button>
            </div>
          </Card>
        )}

        {/* Generation Error */}
        {generateMutation.isError && (
          <Card className="border-destructive bg-destructive/10 p-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold">Generation Failed</p>
                <p className="text-sm">
                  {generateMutation.error instanceof Error
                    ? generateMutation.error.message
                    : 'An error occurred while generating the master list'}
                </p>
                {generateMutation.error instanceof Error &&
                  generateMutation.error.message.includes('pending') && (
                    <p className="mt-2 text-xs">
                      All Pod Leads must submit their allocations before generating the final
                      master list.
                    </p>
                  )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

