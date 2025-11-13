import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { FileSpreadsheet, ArrowLeft, Upload, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useUploadFeatureCSV, useDownloadSheet } from '@/hooks/api/useAdmin';
import { Header } from '@/components/Header';
import { toast } from '@/hooks/use-toast';

export default function UploadFeatureCSV() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const uploadMutation = useUploadFeatureCSV();
  const downloadMutation = useDownloadSheet();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
      } else {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a CSV file',
          variant: 'destructive',
        });
      }
    }
  };

  const handleUpload = () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a CSV file to upload',
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
    <div className="min-h-screen bg-background">
      <Header currentMonth={month} onMonthChange={setMonth} currentRole="Admin" />
      <div className="container space-y-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Upload Feature CSV</h2>
            <p className="text-muted-foreground">
              Upload feature CSV and generate allocation sheets
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Upload Form */}
        <Card className="p-6">
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
              <Label htmlFor="file">CSV File</Label>
              <Input
                id="file"
                type="file"
                accept=".csv,text/csv"
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
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              {uploadMutation.isPending ? 'Uploading...' : 'Upload and Generate Sheets'}
            </Button>
          </div>
        </Card>

        {/* Upload Results */}
        {uploadMutation.isPending && (
          <Card className="p-6">
            <Skeleton className="h-32 w-full" />
          </Card>
        )}

        {uploadData && (
          <Card className="p-6">
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
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Generated Sheets</p>
                    <p className="text-2xl font-bold">
                      {uploadData.summary?.generated_sheets || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created Allocations</p>
                    <p className="text-2xl font-bold">
                      {uploadData.summary?.created_allocations || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Errors</p>
                    <p className="text-2xl font-bold">{uploadData.errors.length}</p>
                  </div>
                </div>
              </div>

              {/* Generated Sheets */}
              {uploadData.sheets && uploadData.sheets.length > 0 && (
                <div>
                  <h4 className="mb-3 font-semibold">Generated Sheets</h4>
                  <div className="space-y-2">
                    {uploadData.sheets.map((sheet) => (
                      <div
                        key={sheet.pod_id}
                        className="flex items-center justify-between rounded-lg border p-3"
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

