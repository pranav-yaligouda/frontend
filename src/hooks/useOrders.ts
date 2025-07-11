import { useQuery } from '@tanstack/react-query';
import { OrderProcessingService } from '@/api/order';
import { useEffect } from 'react';

export function useOrders({ user, status, search }) {
  const enabled = !!user && (user.role !== 'delivery_agent' || (user.isOnline && user.verificationStatus === 'verified'));
  const query = useQuery({
    queryKey: ['orders', user?.role, status, search],
    queryFn: async () => {
      const params = { status };
      // If the API supports search, add it here:
      if (search && search.trim()) params.search = search.trim();
      let orders = [];
      if (user?.role === 'delivery_agent') {
        const res = await OrderProcessingService.fetchAvailableOrdersForAgent(params);
        orders = Array.isArray(res.data?.items) ? res.data.items : [];
      } else {
        const res = await OrderProcessingService.fetchOrdersByRole(params);
        orders = Array.isArray(res.data?.items) ? res.data.items : [];
      }
      // Fallback: client-side filter if API does not support search
      if (search && search.trim()) {
        const s = search.trim().toLowerCase();
        orders = orders.filter(order =>
          (order.id && order.id.toString().toLowerCase().includes(s)) ||
          (order._id && order._id.toString().toLowerCase().includes(s)) ||
          (order.customerName && order.customerName.toLowerCase().includes(s)) ||
          (order.customerId && order.customerId.toLowerCase().includes(s))
        );
      }
      return orders;
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