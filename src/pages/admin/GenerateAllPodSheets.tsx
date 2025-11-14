import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, ArrowLeft, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { useGenerateAllPodSheets, useDownloadSheet } from '@/hooks/api/useAdmin';
import { Header } from '@/components/Header';
import { toast } from '@/hooks/use-toast';

export default function GenerateAllPodSheets() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const navigate = useNavigate();
  const generateMutation = useGenerateAllPodSheets();
  const downloadMutation = useDownloadSheet();

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
      onSuccess: (data) => {
        console.log('Generate success - Response data:', data);
      },
      onError: (error) => {
        console.error('Generate error:', error);
      },
    });
  };

  const handleDownload = (downloadUrl: string, filename: string) => {
    downloadMutation.mutate({ downloadUrl, filename });
  };

  const generateData = generateMutation.data;
  
  // Debug logging
  console.log('GenerateAllPodSheets - generateData:', generateData);
  console.log('GenerateAllPodSheets - isPending:', generateMutation.isPending);
  console.log('GenerateAllPodSheets - isError:', generateMutation.isError);

  return (
    <div className="min-h-screen bg-background smooth-scroll">
      <Header currentMonth={month} onMonthChange={setMonth} currentRole="Admin" />
      <div className="container space-y-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between fade-in">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Generate All Pod Sheets</h2>
            <p className="text-muted-foreground text-lg">
              Generate allocation sheets for all pods for the selected month
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin')} className="shadow-sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Generate Form */}
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

            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              className="gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              {generateMutation.isPending ? 'Generating...' : 'Generate All Pod Sheets'}
            </Button>
          </div>
        </Card>

        {/* Generation Results */}
        {generateMutation.isPending && (
          <Card className="p-6">
            <Skeleton className="h-32 w-full" />
          </Card>
        )}

        {/* Error State */}
        {generateMutation.isError && (
          <Card className="border-destructive bg-destructive/10 p-6">
            <div className="space-y-2">
              <p className="font-semibold text-destructive">Generation Failed</p>
              <p className="text-sm text-muted-foreground">
                {generateMutation.error instanceof Error
                  ? generateMutation.error.message
                  : 'An error occurred while generating sheets'}
              </p>
            </div>
          </Card>
        )}

        {/* Success Results */}
        {!generateMutation.isPending && generateData && generateData.success && generateData.data && (
          <Card className="p-6 card-hover bg-gradient-to-br from-success/10 via-success/5 to-transparent border-success/20 fade-in">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">Sheets Generated</h3>
              </div>
              
              {/* Success Message */}
              {generateData.message && (
                <div className="rounded-lg bg-green-500/10 p-4">
                  <p className="text-sm text-green-700 dark:text-green-400">{generateData.message}</p>
                </div>
              )}

              {generateData.data.summary && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Generated Sheets</p>
                    <p className="text-2xl font-bold">{generateData.data.summary.generated_sheets}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Month</p>
                    <p className="text-2xl font-bold">{generateData.data.summary.month}</p>
                  </div>
                </div>
              )}

              {/* Generated Sheets List */}
              {generateData.data.sheets && generateData.data.sheets.length > 0 ? (
                <div>
                  <h4 className="mb-3 font-semibold">Generated Sheets ({generateData.data.sheets.length})</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {generateData.data.sheets.map((sheet) => (
                      <div
                        key={sheet.pod_id}
                        className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <p className="font-medium">{sheet.pod_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Pod Lead: {sheet.pod_lead_code} | Pod ID: {sheet.pod_id}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDownload(
                              sheet.download_url,
                              `pod_${sheet.pod_id}_allocation_${month}.xlsx`
                            )
                          }
                          disabled={downloadMutation.isPending}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed p-4 text-center">
                  <p className="text-sm text-muted-foreground">No sheets were generated</p>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

