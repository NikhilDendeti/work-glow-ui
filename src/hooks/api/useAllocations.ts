import { useQuery, useMutation } from '@tanstack/react-query';
import { allocationApi } from '@/lib/api/allocations';
import { toast } from '@/hooks/use-toast';

export function useAllocationSheet(podId: number | undefined, month: string) {
  const isValidMonth = /^\d{4}-\d{2}$/.test(month);

  return useQuery({
    queryKey: ['allocationSheet', podId, month],
    queryFn: () => {
      if (!podId) throw new Error('Pod ID is required');
      if (!isValidMonth) {
        throw new Error(`Invalid month format: ${month}. Expected YYYY-MM`);
      }
      return allocationApi.getAllocationSheet(podId, month);
    },
    enabled: !!podId && isValidMonth,
    staleTime: 30000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function usePodAllocations(podId: number | undefined, month: string) {
  const isValidMonth = /^\d{4}-\d{2}$/.test(month);

  return useQuery({
    queryKey: ['podAllocations', podId, month],
    queryFn: () => {
      if (!podId) throw new Error('Pod ID is required');
      if (!isValidMonth) {
        throw new Error(`Invalid month format: ${month}. Expected YYYY-MM`);
      }
      return allocationApi.getPodAllocations(podId, month);
    },
    enabled: !!podId && isValidMonth,
    staleTime: 30000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useSubmitAllocations(podId: number | undefined) {
  return useMutation({
    mutationFn: (data: Parameters<typeof allocationApi.submitAllocations>[1]) => {
      if (!podId) throw new Error('Pod ID is required');
      return allocationApi.submitAllocations(podId, data);
    },
    onSuccess: (data) => {
      toast({
        title: 'Allocations submitted successfully',
        description: `${data.summary.updated_allocations} allocations updated.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Submission failed',
        description: error.message || 'Failed to submit allocations',
        variant: 'destructive',
      });
    },
  });
}

export function useDownloadAllocationSheet() {
  return useMutation({
    mutationFn: ({ podId, month }: { podId: number; month: string }) =>
      allocationApi.downloadAllocationSheet(podId, month),
    onSuccess: () => {
      toast({
        title: 'Download started',
        description: 'Allocation sheet download has started',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Download failed',
        description: error.message || 'Failed to download allocation sheet',
        variant: 'destructive',
      });
    },
  });
}

