import { useQuery } from '@tanstack/react-query';
import { entityApi } from '@/lib/api/entities';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => entityApi.getProducts(),
    staleTime: 300000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useFeatures(productId?: number) {
  return useQuery({
    queryKey: ['features', productId],
    queryFn: () => entityApi.getFeatures(productId),
    staleTime: 300000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

