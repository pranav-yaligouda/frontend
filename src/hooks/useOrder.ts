import { useQuery } from '@tanstack/react-query';
import { getOrderById } from '@/api/order';

export function useOrder(orderId) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrderById(orderId),
    enabled: !!orderId,
    staleTime: 2 * 60 * 1000,
  });
} 