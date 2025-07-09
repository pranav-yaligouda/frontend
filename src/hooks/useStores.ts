import { useQuery } from '@tanstack/react-query';
import { getAllStores } from '@/api/storeApi';
import type { Store } from '@/types/store';

export function useStores(params?: { search?: string; page?: number; limit?: number }): { data: Store[]; isLoading: boolean; isError: boolean } {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['stores', params],
    queryFn: () => getAllStores(params).then(res => Array.isArray(res.data?.items) ? res.data.items : []),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
  return { data: data || [], isLoading, isError };
} 