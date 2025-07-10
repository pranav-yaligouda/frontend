import { useMutation, useQueryClient } from '@tanstack/react-query';
import { OrderProcessingService } from '@/api/order';
import { toast } from '@/hooks/use-toast';

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string, status: string }) => OrderProcessingService.updateOrderStatus(orderId, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (variables?.orderId) {
        queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      }
    },
    onError: (error: unknown) => {
      let message = 'Failed to update order status';
      if (error instanceof Error) message = error.message;
      toast({ title: 'Order Status Error', description: message, });
      console.error('Order status update error:', message);
    },
  });
} 