import { useQuery } from '@tanstack/react-query';
import { OrderProcessingService } from '@/api/order';
import { useEffect } from 'react';

export function useOrders({ user, page, pageSize, status }) {
  const enabled = !!user && (user.role !== 'delivery_agent' || (user.isOnline && user.verificationStatus === 'verified'));
  const query = useQuery({
    queryKey: ['orders', user?.role, page, pageSize, status],
    queryFn: () => {
      const params = { page, pageSize, status };
      if (user?.role === 'delivery_agent') {
        return OrderProcessingService.fetchAvailableOrdersForAgent(params).then(res => Array.isArray(res.data?.items) ? res.data.items : []);
      }
      return OrderProcessingService.fetchOrdersByRole(params).then(res => Array.isArray(res.data?.items) ? res.data.items : []);
    },
    enabled,
    staleTime: 60 * 1000,
  });

  // Real-time updates: subscribe to order:status events
  useEffect(() => {
    if (!user) return;
    const onUpdate = () => {
      query.refetch();
    };
    OrderProcessingService.subscribeToOrderUpdates(user._id, undefined, onUpdate);
    return () => {
      OrderProcessingService.unsubscribeFromOrderUpdates();
    };
  }, [user, query.refetch]);

  return query;
} 