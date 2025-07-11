import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/types/order";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const statusColors: Record<OrderStatus, string> = {
  PLACED: "bg-yellow-100 text-yellow-800",
  ACCEPTED_BY_VENDOR: "bg-blue-100 text-blue-800",
  PREPARING: "bg-indigo-100 text-indigo-800",
  READY_FOR_PICKUP: "bg-purple-100 text-purple-800",
  ACCEPTED_BY_AGENT: "bg-orange-100 text-orange-800",
  PICKED_UP: "bg-orange-200 text-orange-900",
  OUT_FOR_DELIVERY: "bg-blue-200 text-blue-900",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  REJECTED: "bg-red-200 text-red-900",
};

const statusLabels: Record<OrderStatus, string> = {
  PLACED: "Placed",
  ACCEPTED_BY_VENDOR: "Accepted by Vendor",
  PREPARING: "Preparing",
  READY_FOR_PICKUP: "Ready for Pickup",
  ACCEPTED_BY_AGENT: "Accepted by Agent",
  PICKED_UP: "Picked Up",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REJECTED: "Rejected",
};

const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
  return (
    <Badge className={`${statusColors[status]} font-normal`}>
      {statusLabels[status]}
    </Badge>
  );
};

export default OrderStatusBadge;
