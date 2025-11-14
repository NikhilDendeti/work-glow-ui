import { useMutation, useQuery } from '@tanstack/react-query';
import { uploadApi } from '@/lib/api/uploads';
import { toast } from '@/hooks/use-toast';

export function useUploadCSV(onSuccessCallback?: (data: any, file: File) => void) {
  return useMutation({
    mutationFn: (file: File) => uploadApi.uploadCSV(file),
    onSuccess: (data, file) => {
      toast({
        title: 'Upload successful',
        description: `File uploaded. ${data.summary.created_records} records created.`,
      });
      // Call custom callback if provided
      if (onSuccessCallback) {
        onSuccessCallback(data, file);
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload file',
        variant: 'destructive',
      });
    },
  });
}

export function useUploadDetails(rawFileId: number | undefined) {
  return useQuery({
    queryKey: ['uploadDetails', rawFileId],
    queryFn: () => {
      if (!rawFileId) throw new Error('File ID is required');
      return uploadApi.getUploadDetails(rawFileId);
    },
    enabled: !!rawFileId,
    staleTime: 60000,
    retry: 1,
  });
}

export function useDownloadFile() {
  return useMutation({
    mutationFn: (rawFileId: number) => uploadApi.downloadFile(rawFileId),
    onSuccess: (blob, rawFileId) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `upload_${rawFileId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onError: (error: any) => {
      toast({
        title: 'Download failed',
        description: error.message || 'Failed to download file',
        variant: 'destructive',
      });
    },
  });
}

export function useDownloadErrors() {
  return useMutation({
    mutationFn: (rawFileId: number) => uploadApi.downloadErrors(rawFileId),
    onSuccess: (blob, rawFileId) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `errors_${rawFileId}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onError: (error: any) => {
      toast({
        title: 'Download failed',
        description: error.message || 'Failed to download errors file',
        variant: 'destructive',
      });
    },
  });
}

