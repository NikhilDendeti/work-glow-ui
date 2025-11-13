import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, ArrowLeft, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { useImportEmployeeMasterData } from '@/hooks/api/useAdmin';
import { Header } from '@/components/Header';
import { toast } from '@/hooks/use-toast';

export default function ImportEmployeeData() {
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const importMutation = useImportEmployeeMasterData();

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

  const handleImport = () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a CSV file to import',
        variant: 'destructive',
      });
      return;
    }

    importMutation.mutate(file);
  };

  const importData = importMutation.data;

  return (
    <div className="min-h-screen bg-background">
      <Header
        currentMonth={new Date().toISOString().slice(0, 7)}
        onMonthChange={() => {}}
        currentRole="Admin"
      />
      <div className="container space-y-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Import Employee Data</h2>
            <p className="text-muted-foreground">
              Import employee master data from CSV file
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Import Form */}
        <Card className="p-6">
          <div className="space-y-6">
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
              <p className="text-xs text-muted-foreground">
                CSV format: employee_code, name, email, dept, pod, pod_head
              </p>
            </div>

            <Button
              onClick={handleImport}
              disabled={!file || importMutation.isPending}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              {importMutation.isPending ? 'Importing...' : 'Import Employee Data'}
            </Button>
          </div>
        </Card>

        {/* Import Results */}
        {importMutation.isPending && (
          <Card className="p-6">
            <Skeleton className="h-32 w-full" />
          </Card>
        )}

        {importData && (
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">Import Summary</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">Created Employees</p>
                  <p className="text-2xl font-bold">{importData.summary.created_employees}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Updated Employees</p>
                  <p className="text-2xl font-bold">{importData.summary.updated_employees}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created Departments</p>
                  <p className="text-2xl font-bold">{importData.summary.created_departments}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created Pods</p>
                  <p className="text-2xl font-bold">{importData.summary.created_pods}</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {importMutation.isError && (
          <Card className="border-destructive bg-destructive/10 p-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold">Import Failed</p>
                <p className="text-sm">
                  {importMutation.error instanceof Error
                    ? importMutation.error.message
                    : 'An error occurred while importing employee data'}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

