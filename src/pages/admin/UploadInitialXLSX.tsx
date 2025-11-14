import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload, ArrowLeft, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useUploadInitialXLSX } from '@/hooks/api/useAdmin';
import { useDownloadSheet } from '@/hooks/api/useAdmin';
import { Header } from '@/components/Header';
import { toast } from '@/hooks/use-toast';

export default function UploadInitialXLSX() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const uploadMutation = useUploadInitialXLSX();
  const downloadMutation = useDownloadSheet();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.type ===
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        selectedFile.name.endsWith('.xlsx')
      ) {
        setFile(selectedFile);
      } else {
        toast({
          title: 'Invalid file type',
          description: 'Please upload an XLSX file',
          variant: 'destructive',
        });
      }
    }
  };

  const handleUpload = () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload',
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

    uploadMutation.mutate({ file, month });
  };

  const handleDownload = (downloadUrl: string, filename: string) => {
    downloadMutation.mutate({ downloadUrl, filename });
  };

  const uploadData = uploadMutation.data;

  return (
    <div className="min-h-screen bg-background smooth-scroll">
      <Header currentMonth={month} onMonthChange={setMonth} currentRole="Admin" />
      <div className="container space-y-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between fade-in">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Upload Initial XLSX</h2>
            <p className="text-muted-foreground text-lg">
              Upload initial XLSX file and generate allocation sheets for Pod Leads
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin')} className="shadow-sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Upload Form */}
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
              <p className="text-xs text-muted-foreground">Select the month for allocations</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">XLSX File</Label>
              <Input
                id="file"
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleFileChange}
                className="max-w-xs"
              />
              {file && (
                <p className="text-sm text-muted-foreground">Selected: {file.name}</p>
              )}
            </div>

            <Button
              onClick={handleUpload}
              disabled={!file || uploadMutation.isPending}
              className="gap-2 shadow-md"
            >
              <Upload className="h-4 w-4" />
              {uploadMutation.isPending ? 'Uploading...' : 'Upload and Generate Sheets'}
            </Button>
          </div>
        </Card>

        {/* Upload Results */}
        {uploadMutation.isPending && (
          <Card className="p-6 fade-in">
            <Skeleton className="h-32 w-full" />
          </Card>
        )}

        {uploadData && (
          <Card className="p-6 card-hover bg-gradient-to-br from-success/10 via-success/5 to-transparent border-success/20 fade-in">
            <div className="space-y-6">
              {/* Summary */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  {uploadData.has_errors ? (
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                  <h3 className="text-lg font-semibold">Upload Summary</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
                  <div>
                    <p className="text-sm text-muted-foreground">Generated Sheets</p>
                    <p className="text-2xl font-bold">{uploadData.summary.generated_sheets}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created Allocations</p>
                    <p className="text-2xl font-bold">{uploadData.summary.created_allocations}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Employees</p>
                    <p className="text-2xl font-bold">{uploadData.summary.total_employees}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Pods</p>
                    <p className="text-2xl font-bold">{uploadData.summary.total_pods_in_file}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pods with Sheets</p>
                    <p className="text-2xl font-bold text-green-600">{uploadData.summary.pods_with_sheets}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pods Skipped</p>
                    <p className="text-2xl font-bold text-yellow-600">{uploadData.summary.pods_skipped}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Teams Processed</p>
                    <p className="text-2xl font-bold">{uploadData.summary.teams_processed}</p>
                  </div>
                </div>
              </div>

              {/* Teams Breakdown */}
              {uploadData.teams && uploadData.teams.length > 0 && (
                <div>
                  <h4 className="mb-3 font-semibold">Teams Breakdown</h4>
                  <div className="space-y-4">
                    {uploadData.teams.map((team, teamIndex) => (
                      <Card key={teamIndex} className="p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <h5 className="font-semibold">{team.department}</h5>
                          <div className="flex gap-4 text-sm">
                            <span className="text-green-600">
                              {team.pods_with_sheets} sheets generated
                            </span>
                            {team.pods_skipped > 0 && (
                              <span className="text-yellow-600">
                                {team.pods_skipped} skipped
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Generated Sheets */}
                        {team.pods && team.pods.length > 0 && (
                          <div className="mb-3 space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Generated Sheets:</p>
                            {team.pods.map((sheet) => (
                              <div
                                key={sheet.pod_id}
                                className="flex items-center justify-between rounded-lg border bg-card p-3"
                              >
                                <div>
                                  <p className="font-medium">{sheet.pod_name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Pod Lead: {sheet.pod_lead_code}
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
                        )}

                        {/* Skipped Pods */}
                        {team.skipped_pods && team.skipped_pods.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-yellow-600">Skipped Pods:</p>
                            {team.skipped_pods.map((skippedPod, idx) => (
                              <div
                                key={idx}
                                className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium">{skippedPod.pod_name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {skippedPod.employee_count} employees • {skippedPod.reason}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Errors */}
              {uploadData.errors && uploadData.errors.length > 0 && (
                <div>
                  <h4 className="mb-3 font-semibold text-destructive">Errors</h4>
                  <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                    {uploadData.errors.map((error, index) => (
                      <div key={index} className="text-sm">
                        <p className="font-medium">
                          {error.sheet && `Sheet: ${error.sheet} - `}Row {error.row} -{' '}
                          {error.field}
                        </p>
                        <p className="text-muted-foreground">{error.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

