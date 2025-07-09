import { useQuery } from '@tanstack/react-query';
import { OrderProcessingService } from '@/api/order';

export function useOrders({ user, page, pageSize, status }) {
  return useQuery({
    queryKey: ['orders', user?.role, page, pageSize, status],
    queryFn: () => {
      const params = { page, pageSize, status };
      if (user?.role === 'delivery_agent') {
        return OrderProcessingService.fetchAvailableOrdersForAgent(params).then(res => Array.isArray(res.data?.items) ? res.data.items : []);
      }
      return OrderProcessingService.fetchOrdersByRole(params).then(res => Array.isArray(res.data?.items) ? res.data.items : []);
    },
    enabled: !!user,
    staleTime: 60 * 1000,
  });
} 