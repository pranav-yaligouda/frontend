import { useQuery } from '@tanstack/react-query';
import { getProducts } from '@/api/product';
import type { Product } from '@/types/product';

export function useProducts(params: { storeId?: string; category?: string; search?: string; page?: number; limit?: number }): { data: Product[]; isLoading: boolean; isError: boolean } {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const res = await getProducts(params);
      const items = Array.isArray(res.data?.data?.items) ? res.data.data.items : [];
      // Normalize products to always have id and storeId
      return items.map(product => ({
        ...product,
        id: product._id || product.id,
        storeId: product.store || product.storeId,
      }));
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
  });
  return { data: data || [], isLoading, isError };
} 