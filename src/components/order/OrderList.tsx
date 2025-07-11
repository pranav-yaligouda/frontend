import * as React from "react";
import OrderCard from "./OrderCard";
import OrderFilterBar from "./OrderFilterBar";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import OrderProcessingService from "@/api/order";
import { toast } from "sonner";
import type { Order } from "@/types/order";

const OrderList: React.FC = () => {
  const { user } = useAuth();
  const [status, setStatus] = React.useState("ALL");
  const [search, setSearch] = React.useState("");
  // Remove pagination
  const { data: orders = [], isLoading, isError, refetch } = useOrders({ user, status, search });

  // Robust onAction handler for hotel/store acceptance/rejection
  const handleOrderAction = async (action: "accept" | "reject" | "cancel" | "preparing" | "ready_for_pickup", order: Order) => {
    const orderId = (order._id || order.id);
    if (!orderId) {
      toast.error("Order ID missing, cannot update status.");
      return;
    }
    try {
      if (action === "accept") {
        await OrderProcessingService.updateOrderStatus(orderId, "ACCEPTED_BY_VENDOR");
        toast.success("Order accepted successfully");
      } else if (action === "preparing") {
        await OrderProcessingService.updateOrderStatus(orderId, "PREPARING");
        toast.success("Order marked as preparing");
      } else if (action === "ready_for_pickup") {
        await OrderProcessingService.updateOrderStatus(orderId, "READY_FOR_PICKUP");
        toast.success("Order marked as ready for pickup");
      } else if (action === "reject") {
        await OrderProcessingService.updateOrderStatus(orderId, "REJECTED");
        toast.success("Order rejected");
      } else if (action === "cancel") {
        await OrderProcessingService.updateOrderStatus(orderId, "CANCELLED");
        toast.success("Order cancelled");
      }
      refetch();
    } catch (err) {
      const message = typeof err === 'string' ? err : (err as Error)?.message || 'Failed to update order status';
      toast.error(message);
    }
  };

  if (isLoading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="w-full h-40" />)}</div>;
  if (isError) return <div className="text-red-500 py-8">Failed to fetch orders</div>;
  if (orders.length === 0) return <div className="text-gray-500 py-8">No orders found.</div>;

  return (
    <div>
      <OrderFilterBar status={status} setStatus={setStatus} search={search} setSearch={setSearch} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {orders.map(order => <OrderCard key={order.id} order={order} userRole={user.role} onAction={handleOrderAction} />)}
      </div>
    </div>
  );
};
export default OrderList; 