import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProduct } from '@/api/product';
import type { Product } from '@/types/product';

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Product> }) => updateProduct(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
      }
    },
  });
} 