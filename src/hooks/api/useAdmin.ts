import { useQuery, useMutation } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import { toast } from '@/hooks/use-toast';

export function useUploadInitialXLSX() {
  return useMutation({
    mutationFn: ({ file, month }: { file: File; month: string }) =>
      adminApi.uploadInitialXLSX(file, month),
    onSuccess: (data) => {
      toast({
        title: 'Upload successful',
        description: `Generated ${data.summary.generated_sheets} sheets for ${data.summary.pods_with_sheets} pods across ${data.summary.teams_processed} teams.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload initial XLSX',
        variant: 'destructive',
      });
    },
  });
}

export function useProcessAllocations(podId: number | undefined) {
  return useMutation({
    mutationFn: ({
      month,
      outputFormat,
    }: {
      month: string;
      outputFormat?: 'records' | 'csv';
    }) => {
      if (!podId) throw new Error('Pod ID is required');
      return adminApi.processAllocations(podId, month, outputFormat || 'records');
    },
    onSuccess: (data) => {
      toast({
        title: 'Processing successful',
        description: data.message || `Created ${data.created_records} records.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Processing failed',
        description: error.message || 'Failed to process allocations',
        variant: 'destructive',
      });
    },
  });
}

export function useGenerateFinalMasterList() {
  return useMutation({
    mutationFn: (month: string) => adminApi.generateFinalMasterList(month),
    onSuccess: (data) => {
      toast({
        title: 'Master list generated',
        description: 'Final master list has been generated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Generation failed',
        description: error.message || 'Failed to generate final master list',
        variant: 'destructive',
      });
    },
  });
}

export function useFinalMasterList(month: string) {
  const isValidMonth = /^\d{4}-\d{2}$/.test(month);

  return useQuery({
    queryKey: ['finalMasterList', month],
    queryFn: () => adminApi.getFinalMasterList(month),
    enabled: isValidMonth,
    staleTime: 60000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useDownloadFinalMasterList() {
  return useMutation({
    mutationFn: (month: string) => adminApi.downloadFinalMasterList(month),
    onSuccess: () => {
      toast({
        title: 'Download started',
        description: 'Final master list download has started',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Download failed',
        description: error.message || 'Failed to download final master list',
        variant: 'destructive',
      });
    },
  });
}

export function useImportEmployeeMasterData() {
  return useMutation({
    mutationFn: (file: File) => adminApi.importEmployeeMasterData(file),
    onSuccess: (data) => {
      toast({
        title: 'Import successful',
        description: `Created ${data.summary.created_employees} employees, ${data.summary.created_departments} departments, ${data.summary.created_pods} pods.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Import failed',
        description: error.message || 'Failed to import employee data',
        variant: 'destructive',
      });
    },
  });
}

export function useUploadFeatureCSV() {
  return useMutation({
    mutationFn: ({ file, month }: { file: File; month: string }) =>
      adminApi.uploadFeatureCSV(file, month),
    onSuccess: (data) => {
      toast({
        title: 'Upload successful',
        description: `Generated ${data.summary?.generated_sheets || 0} sheets and created ${data.summary?.created_allocations || 0} allocations.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload feature CSV',
        variant: 'destructive',
      });
    },
  });
}

export function useGenerateAllPodSheets() {
  return useMutation({
    mutationFn: (month: string) => adminApi.generateAllPodSheets(month),
    onSuccess: (data) => {
      if (data.success && data.data) {
        toast({
          title: 'Sheets generated',
          description: `Generated ${data.data.summary.generated_sheets} allocation sheets for ${data.data.summary.month}`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Generation failed',
        description: error.message || 'Failed to generate pod sheets',
        variant: 'destructive',
      });
    },
  });
}

export function useDownloadSheet() {
  return useMutation({
    mutationFn: ({ downloadUrl, filename }: { downloadUrl: string; filename: string }) =>
      adminApi.downloadSheet(downloadUrl, filename),
    onSuccess: () => {
      toast({
        title: 'Download started',
        description: 'Sheet download has started',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Download failed',
        description: error.message || 'Failed to download sheet',
        variant: 'destructive',
      });
    },
  });
}

